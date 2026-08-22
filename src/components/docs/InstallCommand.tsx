import CopyButton from "./CopyButton";

/**
 * The CLI install line.
 *
 * The origin comes from NEXT_PUBLIC_SITE_URL. When it is unset the command
 * renders with a visible `<your-domain>` placeholder rather than a plausible
 * but wrong host — a copyable command that silently 404s is worse than one
 * that obviously needs filling in.
 */
export function InstallCommand({ slug }: { slug: string }) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const command = `npx shadcn@latest add ${origin ?? "<your-domain>"}/r/${slug}.json`;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2 pl-3">
      <code className="flex-1 overflow-x-auto font-mono text-sm whitespace-nowrap text-content-muted">
        {command}
      </code>
      <CopyButton value={command} label="Copy install command" />
    </div>
  );
}

export default InstallCommand;
