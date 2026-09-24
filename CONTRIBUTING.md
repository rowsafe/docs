# Contributing to the Rowsafe docs

Thanks for helping. Small fixes (a typo, a broken command, an unclear sentence) are welcome as a pull request straight away. For a new page or a big change, open an issue first so we can agree on the shape.

By contributing, you agree that your contribution is licensed under [CC BY 4.0](LICENSE), like the rest of the docs.

## Style

Write for someone who runs a database and is busy, maybe at 3 a.m. during an incident.

- **Short sentences, plain words.** One idea per sentence. Prefer "use" to "utilize", "about" to "approximately".
- **Say what to do, then why.** Lead with the action or the answer.
- **Address the reader as "you".** Use the active voice: "Rowsafe restores the backup", not "the backup is restored".
- **Keep pages focused and scannable.** Headings a reader can jump to, short paragraphs, lists and tables. Put deep details in an `<Accordion>`.
- **Be exact.** Name the real command, flag, file and setting. Use the same words as the CLI and the dashboard.
- **Be honest about limits.** If Rowsafe can't do something yet, say so plainly.
- **No marketing.** No "seamless", "simply", "just", "blazing". Don't promise dates.
- **American English**, sentence-case headings, the serial comma is optional but be consistent within a page.
- **Examples** use the database `app`, the host `db-1`, and placeholders like `<account-id>` or `rse_...`. Never paste real tokens, keys, hostnames or customer data.

## Verified commands

Every command, flag, environment variable, default and error message must match the code in [rowsafe/rowsafe](https://github.com/rowsafe/rowsafe):

- CLI: `rowsafe help all`, and `cmd/rowsafe`.
- Agent and its settings: `cmd/rowsafe-agent`, `internal/agent`.
- Installer: `scripts/install.sh`.
- Docker: `deploy/docker`.

Run what you document, where you can, and copy output rather than retyping it. If you are not sure something is true, ask in the pull request instead of guessing.

## Pages

- Each page is an `.mdx` file with frontmatter:

  ```mdx
  ---
  title: Restore a database
  description: One sentence that says what the page covers. It is shown in search results and link previews.
  ---
  ```

- Don't repeat the title as a `#` heading: the site shows it. Start sections at `##`.
- Add a new page to its folder's `meta.json`, or it won't appear in the sidebar.
- Link to other pages with their site path: `[Restore a database](/docs/guides/restore)`, and to a section with its heading: `/docs/guides/restore#to-a-restore-point`. Anchors are the heading in lowercase, with spaces as dashes and punctuation removed.
- Give code blocks a language (`sh`, `yaml`, `json`, `sql`, `text` for output) and, for files, a title: ` ```sh title="/etc/rowsafe/agent.env" `.
- No `import` or `export` statements, and no HTML beyond what Markdown needs.

## Components

Only these components are available. Anything else fails the checks.

| Component | Use it for |
|---|---|
| `<Callout type="info" title="...">` | A note the reader must not miss. `type` is `info` (default), `warn`, `error` or `success`. Use sparingly. |
| `<Steps>` with `<Step>` | A procedure. Put a `###` heading at the start of each step. |
| `<Tabs items={["A", "B"]}>` with `<Tab value="A">` | Alternatives, such as a server vs Docker, or one OS vs another. |
| `<Cards>` with `<Card title="..." href="...">` | Links to next pages. |
| `<Accordions>` with `<Accordion title="...">` | Details most readers can skip. |

Leave a blank line after an opening tag and before a closing tag, so the Markdown inside is parsed:

```mdx
<Callout type="warn" title="Store the passphrase first">

Without it, no backup can ever be restored.

</Callout>
```

## Before you open a pull request

```sh
npm ci
npm run check
```

Then read your page once more, top to bottom, as a first-time user.
