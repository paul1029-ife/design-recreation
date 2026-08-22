"use client";

import InviteCard from "./InviteCard";

/**
 * Gallery demo. Starts with the link enabled so the invite flow — the part
 * worth looking at — is on screen without a click.
 */
export default function InviteCardDemo() {
  return (
    <InviteCard
      url="acme.com/enterprise/note/1234"
      defaultLinkEnabled
      defaultInvitees={[{ id: "seed-1", email: "ada@acme.com", name: "Ada" }]}
    />
  );
}
