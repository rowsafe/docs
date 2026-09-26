# Rowsafe docs (public, CC BY 4.0)

MDX pages served at https://rowsafe.sh/docs (the site pulls this repo as a git submodule).

- Structure: `index.mdx`, `quickstart.mdx`, `guides/`, `concepts/`, `reference/`, `security/`,
  `faq.mdx`, `troubleshooting.mdx`; navigation order in each folder's `meta.json`.
- Allowed components: Callout, Steps, Step, Tabs, Tab, Cards, Card, Accordions, Accordion.
- Check before committing: `npm run check` (frontmatter, links, anchors, meta.json).
- Voice: plain language for people who aren't database experts; short sentences; the dashboard
  button first, the command only as an alternative; honest limits. Feature names: Rewind (Marks),
  Proof, Pulse, Guard. Write "Rowsafe" (never RowSafe).
- Keep anchors stable: the dashboard and site link to them (e.g. `guides/storage#cloudflare-r2`).
