#!/usr/bin/env node
/**
 * Repository consistency audit for the interaction-pattern library.
 *
 *   node .claude/skills/library-maintainer/scripts/audit.mjs
 *   node .claude/skills/library-maintainer/scripts/audit.mjs --json
 *
 * Zero dependencies. Exits 1 if any ERROR-level finding exists, 0 otherwise
 * (WARN findings do not fail the build), so it can be wired straight into CI.
 *
 * Understands both the current flat layout (src/components/recreations/*.tsx)
 * and the target layout (src/patterns/<slug>/), so it stays useful throughout
 * the migration.
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, basename, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const SRC = join(ROOT, "src");
const PATTERNS_DIR = join(SRC, "patterns");
const LEGACY_DIR = join(SRC, "components", "recreations");

/** Functional axis. Exactly one per pattern. Always populated. */
const CATEGORIES = [
  "navigation", "input", "feedback", "disclosure",
  "selection", "action", "layout",
];

/** Product axis. 1–3 per pattern. What users browse by. */
const DOMAINS = [
  "ai", "commerce", "authentication", "messaging", "forms",
  "dashboard", "editor", "productivity", "search", "files",
  "accessibility", "media", "onboarding",
];

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

const BANNED_SUFFIXES = ["Interaction", "Component", "Wrapper", "New"];

const findings = [];
const rel = (p) => relative(ROOT, p);

const error = (rule, file, message, fix) =>
  findings.push({ level: "error", rule, file: rel(file), message, fix });
const warn = (rule, file, message, fix) =>
  findings.push({ level: "warn", rule, file: rel(file), message, fix });

/* ------------------------------------------------------------------ utils */

const walk = (dir, out = []) => {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};

const read = (p) => readFileSync(p, "utf8");

/** Best-effort default-export name. Covers the four forms used in this repo. */
const defaultExportName = (src) => {
  const patterns = [
    /export\s+default\s+function\s+([A-Za-z0-9_]+)/,
    /export\s+default\s+([A-Za-z0-9_]+)\s*;/,
    /const\s+([A-Za-z0-9_]+)\s*[:=][\s\S]{0,400}?export\s+default\s+\1/,
    /export\s+default\s+forwardRef<[^>]*>\(\s*function\s+([A-Za-z0-9_]+)/,
  ];
  for (const re of patterns) {
    const m = src.match(re);
    if (m) return m[1];
  }
  return null;
};

const isPascal = (s) => /^[A-Z][A-Za-z0-9]*$/.test(s);
const isKebab = (s) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);

/* ------------------------------------------------- 1. source-wide checks */

const sourceFiles = walk(SRC).filter((f) =>
  [".ts", ".tsx"].includes(extname(f)),
);

for (const file of sourceFiles) {
  const src = read(file);
  const name = basename(file, extname(file));

  // Legacy motion package. Two import paths ship two runtimes.
  if (/from\s+["']framer-motion["']/.test(src)) {
    error(
      "motion-import",
      file,
      'imports from "framer-motion"',
      'change the import to "motion/react" — the APIs are identical',
    );
  }

  // React.FC adds implicit children and does not compose with generics.
  if (/React\.FC[<\s]/.test(src)) {
    warn("react-fc", file, "uses React.FC", "use a plain function with an explicit props type");
  }

  // strict is on; `any` defeats it.
  if (/:\s*any\b/.test(src) || /<any>/.test(src)) {
    error("no-any", file, "uses `any`", "use `unknown` plus a narrow, or a real type");
  }

  // erasableSyntaxOnly is on — enums emit runtime code and will not compile.
  if (/^\s*(export\s+)?enum\s/m.test(src)) {
    error("no-enum", file, "declares an enum", "use a union type or `as const` object");
  }

  // Timers without a matching clearTimeout leak under React 19 Strict Mode.
  const setTimeouts = (src.match(/setTimeout\(/g) ?? []).length;
  const clears = (src.match(/clearTimeout\(/g) ?? []).length;
  if (setTimeouts > clears) {
    warn(
      "timer-cleanup",
      file,
      `${setTimeouts} setTimeout vs ${clears} clearTimeout`,
      "return a cleanup from every effect that starts a timer",
    );
  }

  // Component files only, and only the pattern layers.
  const isComponent =
    extname(file) === ".tsx" &&
    isPascal(name) &&
    !name.endsWith(".demo") &&
    (file.startsWith(PATTERNS_DIR) || file.startsWith(LEGACY_DIR));

  if (isComponent) {
    const exported = defaultExportName(src);
    if (exported && exported !== name) {
      error(
        "name-mismatch",
        file,
        `file is ${name}.tsx but the default export is ${exported}`,
        `rename one so they agree`,
      );
    }

    for (const suffix of BANNED_SUFFIXES) {
      if (name.endsWith(suffix)) {
        warn(
          "weak-name",
          file,
          `name ends in "${suffix}"`,
          "name the pattern for the problem it solves, not the mechanism",
        );
      }
    }

    if (!/useReducedMotion|matchMedia|prefers-reduced-motion/.test(src) &&
        /motion\.|gsap\./.test(src)) {
      warn(
        "reduced-motion",
        file,
        "animates but never checks prefers-reduced-motion",
        "gate travel/scale/blur behind useReducedMotion; keep opacity",
      );
    }

    if (/min-h-\[|w-\[\d|h-screen/.test(src) && file.startsWith(PATTERNS_DIR)) {
      warn(
        "demo-chrome",
        file,
        "fixed sizing inside a pattern",
        "move min-h / fixed widths to <Name>.demo.tsx",
      );
    }
  }
}

/* ------------------------------------------------ 2. pattern directories */

const patternDirs = existsSync(PATTERNS_DIR)
  ? readdirSync(PATTERNS_DIR).filter((d) =>
      statSync(join(PATTERNS_DIR, d)).isDirectory(),
    )
  : [];

const slugs = new Set();

for (const dir of patternDirs) {
  const full = join(PATTERNS_DIR, dir);

  if (!isKebab(dir)) {
    error("dir-case", full, `directory "${dir}" is not kebab-case`, "rename to kebab-case");
  }

  const pascal = dir.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("");
  const required = [
    "index.ts",
    `${pascal}.tsx`,
    `${pascal}.demo.tsx`,
    "meta.ts",
    "README.md",
  ];

  for (const f of required) {
    if (!existsSync(join(full, f))) {
      error("missing-file", join(full, f), `${f} is missing`, `create it from the pattern-author templates`);
    }
  }

  // --- metadata ---------------------------------------------------------
  const metaPath = join(full, "meta.ts");
  if (existsSync(metaPath)) {
    const meta = read(metaPath);

    const slug = meta.match(/slug:\s*["']([^"']+)["']/)?.[1];
    if (!slug) {
      error("meta-slug", metaPath, "no slug", "add slug matching the directory name");
    } else {
      if (slug !== dir) {
        error("meta-slug", metaPath, `slug "${slug}" ≠ directory "${dir}"`, "make them match");
      }
      if (slugs.has(slug)) {
        error("meta-slug", metaPath, `duplicate slug "${slug}"`, "slugs are URLs — they must be unique");
      }
      slugs.add(slug);
    }

    const category = meta.match(/category:\s*["']([^"']+)["']/)?.[1];
    if (!category) {
      error("meta-category", metaPath, "no category", `add one of: ${CATEGORIES.join(", ")}`);
    } else if (!CATEGORIES.includes(category)) {
      error(
        "meta-category",
        metaPath,
        `category "${category}" is not in the closed set`,
        `use one of: ${CATEGORIES.join(", ")}`,
      );
    }

    // Tolerates escaped quotes inside the string; the naive [^"']* form
    // truncated at the first one and reported a false "too short".
    const problem = meta.match(/problem:\s*"((?:[^"\\]|\\.)*)"/)?.[1];
    if (!problem || problem.trim().length < 20) {
      error(
        "meta-problem",
        metaPath,
        "problem is missing or too short",
        "one sentence a PM would recognise — not a description of the animation",
      );
    }

    const tags = meta.match(/tags:\s*\[([^\]]*)\]/)?.[1];
    const tagCount = tags ? tags.split(",").filter((t) => t.trim()).length : 0;
    if (tagCount < 2 || tagCount > 5) {
      warn("meta-tags", metaPath, `${tagCount} tags`, "use 2–5 tags from the shared vocabulary");
    }

    // Domain axis — what the browse pages are built from.
    const domainsRaw = meta.match(/domains:\s*\[([^\]]*)\]/)?.[1];
    if (domainsRaw === undefined) {
      error("meta-domains", metaPath, "no domains", `add 1–3 of: ${DOMAINS.join(", ")}`);
    } else {
      const domains = [...domainsRaw.matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
      if (domains.length < 1 || domains.length > 3) {
        error("meta-domains", metaPath, `${domains.length} domains`, "use 1–3");
      }
      for (const d of domains) {
        if (!DOMAINS.includes(d)) {
          error("meta-domains", metaPath, `domain "${d}" is not in the closed set`,
            `use one of: ${DOMAINS.join(", ")}`);
        }
      }
    }

    const difficulty = meta.match(/difficulty:\s*["']([^"']+)["']/)?.[1];
    if (!difficulty || !DIFFICULTIES.includes(difficulty)) {
      error("meta-difficulty", metaPath, `difficulty "${difficulty ?? "missing"}" invalid`,
        `use one of: ${DIFFICULTIES.join(", ")}`);
    }

    // ISO date, powers "Recently added".
    const added = meta.match(/added:\s*["']([^"']+)["']/)?.[1];
    if (!added || !/^\d{4}-\d{2}-\d{2}$/.test(added)) {
      error("meta-added", metaPath, "added date missing or not ISO (YYYY-MM-DD)",
        "add an ISO date");
    }

    for (const flag of ["responsive", "featured"]) {
      if (!new RegExp(`${flag}:\\s*(true|false)`).test(meta)) {
        error("meta-flag", metaPath, `${flag} not declared`, `add ${flag}: true | false`);
      }
    }

    for (const flag of ["keyboard", "touch", "reducedMotion"]) {
      if (!new RegExp(`${flag}:\\s*(true|false)`).test(meta)) {
        error("meta-flag", metaPath, `${flag} not declared`, `add ${flag}: true | false`);
      }
    }

    // A claim of keyboard support with no key handling anywhere in the dir.
    const componentPath = join(full, `${pascal}.tsx`);
    if (/keyboard:\s*true/.test(meta) && existsSync(componentPath)) {
      const comp = read(componentPath);
      const hasKeyboard =
        // motion.button and friends render real native elements, so they count
        // as focusable — matching only `<button` reported false claims against
        // patterns whose only trigger is a motion component.
        /onKeyDown|onKeyUp|addEventListener\(\s*["']key|<(?:motion\.)?(?:button|a\s|input|select|textarea)/.test(
          comp,
        );
      if (!hasKeyboard) {
        error(
          "false-claim",
          metaPath,
          "claims keyboard: true but the component has no keyboard handling or focusable element",
          "implement keyboard support, or set the flag to false",
        );
      }
    }

    if (/reducedMotion:\s*true/.test(meta) && existsSync(componentPath)) {
      const comp = read(componentPath);
      if (!/useReducedMotion|matchMedia|prefers-reduced-motion/.test(comp)) {
        error(
          "false-claim",
          metaPath,
          "claims reducedMotion: true but never checks the preference",
          "use useReducedMotion, or set the flag to false",
        );
      }
    }
  }

  // --- docs -------------------------------------------------------------
  const readmePath = join(full, "README.md");
  if (existsSync(readmePath)) {
    const doc = read(readmePath).toLowerCase();
    const sections = [
      ["problem", "## the problem"],
      ["use cases", "## use cases"],
      ["installation", "## installation"],
      ["usage", "## usage"],
      ["api", "## api"],
      ["keyboard", "## keyboard"],
      ["accessibility", "## accessibility"],
      ["performance", "## performance"],
      ["source", "## source"],
      ["technologies", "## technologies"],
      ["credits", "## credits"],
    ];
    const missing = sections.filter(([, h]) => !doc.includes(h)).map(([n]) => n);
    if (missing.length) {
      error(
        "docs-sections",
        readmePath,
        `missing sections: ${missing.join(", ")}`,
        "all twelve required sections — see pattern-author/references/documentation.md",
      );
    }
  }
}

/* ---------------------------------------------------- 3. registry health */

const registryPath = join(PATTERNS_DIR, "registry.ts");
if (patternDirs.length > 0) {
  if (!existsSync(registryPath)) {
    error("registry", registryPath, "registry.ts is missing", "create it and export every pattern's meta");
  } else {
    const registry = read(registryPath);
    for (const dir of patternDirs) {
      if (!registry.includes(`./${dir}/`)) {
        error("registry", registryPath, `"${dir}" is not registered`, `import its meta and add it to the registry array`);
      }
    }
    for (const m of registry.matchAll(/\.\/([a-z0-9-]+)\/meta/g)) {
      if (!patternDirs.includes(m[1])) {
        error("registry", registryPath, `registers "${m[1]}" which has no directory`, "remove the entry or create the directory");
      }
    }

    /*
     * A pattern also has to appear in the ALL array, not just be imported.
     * `import { meta as x }` with no `x,` in the array type-errors, but only
     * because `noUnusedLocals` happens to catch it — which is luck, not a check.
     */
    const allArray = registry.match(/const ALL[^=]*=\s*\[([\s\S]*?)\]/)?.[1] ?? "";
    for (const m of registry.matchAll(/meta as (\w+) \} from "\.\/([a-z0-9-]+)\/meta/g)) {
      if (!new RegExp(`\\b${m[1]}\\b`).test(allArray)) {
        error("registry", registryPath, `"${m[2]}" is imported but not in the registry array`, `add \`${m[1]},\` to ALL`);
      }
    }
  }
}

/* ------------------------------------------------ 3a. icon box vs glyph */

/*
 * An icon larger than the box it sits in is not centred by `place-items-center`
 * or `items-center` — an overflowing item aligns to the start of its area, so
 * the glyph renders low and right by half the difference. It looks like a
 * spacing bug and gets "fixed" by nudging the neighbouring margin, which leaves
 * the icon still off its own centre line.
 */
for (const file of walk(SRC).filter((f) => f.endsWith(".tsx"))) {
  read(file)
    .split("\n")
    .forEach((line, i) => {
      const box = /\bsize-(\d+(?:\.\d+)?)\b/.exec(line);
      const glyph = /\[&>svg\]:size-(\d+(?:\.\d+)?)/.exec(line);
      if (!box || !glyph) return;
      const b = parseFloat(box[1]) * 4;
      const g = parseFloat(glyph[1]) * 4;
      if (g > b) {
        error(
          "icon-box",
          file,
          `line ${i + 1}: ${g}px icon in a ${b}px box — renders ${(g - b) / 2}px low and right`,
          `match the box to the glyph (size-${glyph[1]}) rather than nudging the neighbour`,
        );
      }
    });
}

/* ------------------------------------------------ 3b. demo wiring */

/*
 * A pattern missing from demos.ts renders a detail page with no demo on it and
 * throws nothing — the page just quietly loses its canvas. Caught in review
 * only if someone happens to open that one page.
 */
const demosPath = join(PATTERNS_DIR, "demos.ts");
if (patternDirs.length > 0 && existsSync(demosPath)) {
  const demos = read(demosPath);
  for (const dir of patternDirs) {
    if (!demos.includes(`"${dir}"`)) {
      error("demos", demosPath, `"${dir}" has no demo entry`, `add "${dir}": dynamic(() => import("./${dir}/<Name>.demo"))`);
    }
  }
}

/* ------------------------------------------------------- 4. migration state */

const legacyFiles = existsSync(LEGACY_DIR)
  ? walk(LEGACY_DIR).filter((f) => extname(f) === ".tsx")
  : [];

if (legacyFiles.length) {
  warn(
    "migration",
    LEGACY_DIR,
    `${legacyFiles.length} pattern(s) still in the legacy flat layout`,
    "migrate one per commit — see the playbook in library-maintainer/SKILL.md",
  );
}

/* ------------------------------------------------------------- 5. report */

const errors = findings.filter((f) => f.level === "error");
const warnings = findings.filter((f) => f.level === "warn");

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ errors, warnings }, null, 2));
  process.exit(errors.length ? 1 : 0);
}

const byRule = (list) => {
  const map = new Map();
  for (const f of list) {
    if (!map.has(f.rule)) map.set(f.rule, []);
    map.get(f.rule).push(f);
  }
  return map;
};

const print = (label, list) => {
  if (!list.length) return;
  console.log(`\n${label}\n${"─".repeat(label.length)}`);
  for (const [rule, items] of byRule(list)) {
    console.log(`\n  ${rule}  (${items.length})`);
    for (const f of items) {
      console.log(`    ${f.file}`);
      console.log(`      ${f.message}`);
      console.log(`      → ${f.fix}`);
    }
  }
};

console.log("Interaction-pattern library audit");
console.log(`  ${sourceFiles.length} source files · ${patternDirs.length} migrated patterns · ${legacyFiles.length} legacy`);

print("ERRORS", errors);
print("WARNINGS", warnings);

console.log(
  `\n${errors.length} error(s), ${warnings.length} warning(s).` +
    (errors.length ? "" : " Audit passed."),
);

process.exit(errors.length ? 1 : 0);
