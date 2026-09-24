# Rowsafe docs

The source of the Rowsafe documentation at **[rowsafe.sh/docs](https://rowsafe.sh/docs)**.

Rowsafe backs up the databases you run on your own servers, lets you restore to any second, and proves every week that your backups restore. The agent and CLI are open source at [rowsafe/rowsafe](https://github.com/rowsafe/rowsafe).

Found a mistake, or something unclear? Every page has an **Edit on GitHub** link. Pull requests and issues are welcome: see [CONTRIBUTING.md](CONTRIBUTING.md).

## What's here

```text
index.mdx            Introduction (/docs)
quickstart.mdx       /docs/quickstart
concepts/            How Rowsafe works, backups, drills, restore points, ...
guides/              Adopt, restore, Docker, AI agents, monitoring, teams, updates
reference/           CLI, agent configuration, MCP server, webhooks
security/            Security model, verifying releases, disclosure
faq.mdx
troubleshooting.mdx
meta.json            Sidebar order (one per folder)
scripts/             The checks that run on every pull request
```

Each `.mdx` file is one page. Its path is its URL: `guides/restore.mdx` is [rowsafe.sh/docs/guides/restore](https://rowsafe.sh/docs/guides/restore).

## Preview and check your changes

The website that renders these docs is private, so you can't run it. You don't need to:

- **Read as you write.** The pages are plain Markdown with a few components, so any Markdown preview (GitHub, your editor) shows the text, tables and code. For a rough local preview with the sidebar, run `npx fumadocs-preview .`: components such as `<Tabs>` show as raw text there.
- **Run the checks** (Node.js 20 or newer):

  ```sh
  npm ci
  npm run check
  ```

  They check every page's frontmatter, that it compiles as MDX, that it only uses the [available components](CONTRIBUTING.md#components), and that every internal link and `#anchor` points to a page and heading that exist. The same checks run on every pull request.

A maintainer looks at the rendered page before merging.

## License

The documentation is licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE). You may share and adapt it, as long as you give appropriate credit, link to the license, and say if you made changes.

PostgreSQL is a trademark of the PostgreSQL Community Association of Canada.
