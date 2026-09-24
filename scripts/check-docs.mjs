#!/usr/bin/env node
// Checks the Rowsafe docs without the website that renders them:
//
//   - every page is .mdx with a `title` and a `description` in its frontmatter;
//   - every page compiles as MDX, uses only the components the website provides,
//     and has no import or export statements;
//   - every internal link points to an existing page (and heading, for #anchors);
//   - every meta.json entry exists, and every page is listed in a meta.json.
//
// Usage: node scripts/check-docs.mjs [docs directory, default: the repository root]

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createProcessor } from "@mdx-js/mdx";
import GithubSlugger from "github-slugger";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import YAML from "yaml";

const root = path.resolve(process.argv[2] ?? path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));

// Components registered by the website (src/components/docs/mdx.tsx there).
const COMPONENTS = new Set(["Callout", "Steps", "Step", "Tabs", "Tab", "Cards", "Card", "Accordions", "Accordion"]);

// Pages of rowsafe.sh outside /docs that the docs may link to.
const SITE_PATHS = new Set(["/", "/pricing", "/security", "/agents", "/contact", "/llms.txt", "/llms-full.txt"]);

// Not part of the docs: repository files and tooling.
const SKIP_DIRS = new Set(["node_modules", "scripts", ".github", ".git", "_repo"]);

const errors = [];
const fail = (file, message, node) => {
  const line = node?.position?.start?.line;
  errors.push(`${path.relative(root, file)}${line ? `:${line}` : ""}: ${message}`);
};

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...(await walk(full)));
    } else {
      out.push(full);
    }
  }
  return out;
}

const exists = (p) =>
  stat(p).then(
    () => true,
    () => false,
  );

const files = await walk(root);
const pages = files.filter((f) => f.endsWith(".mdx"));
const metas = files.filter((f) => path.basename(f) === "meta.json");
for (const f of files) {
  if (f.endsWith(".md") && path.dirname(f) !== root) fail(f, "pages must be .mdx (only README.md and CONTRIBUTING.md may be .md, at the root)");
}

/** URL path of a page: index.mdx is its folder. */
function urlOf(file) {
  const rel = path.relative(root, file).replace(/\\/g, "/").replace(/\.mdx$/, "");
  const slugs = rel.split("/").filter((s) => s !== "index");
  return slugs.length ? `/docs/${slugs.join("/")}` : "/docs";
}

const processor = createProcessor({ remarkPlugins: [remarkGfm] });
const parsed = new Map(); // url -> { file, tree, anchors }

for (const file of pages) {
  const source = await readFile(file, "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source);
  if (!match) {
    fail(file, "missing frontmatter (--- title: ... description: ... ---)");
    continue;
  }
  let data;
  try {
    data = YAML.parse(match[1]) ?? {};
  } catch (e) {
    fail(file, `frontmatter is not valid YAML: ${e.message}`);
    continue;
  }
  for (const key of ["title", "description"]) {
    if (typeof data[key] !== "string" || data[key].trim() === "") fail(file, `frontmatter needs a non-empty "${key}"`);
  }

  // Keep line numbers right: replace the frontmatter with blank lines.
  const body = source.slice(0, match[0].length).replace(/[^\n]/g, "") + source.slice(match[0].length);
  let tree;
  try {
    tree = processor.parse(body);
    await processor.run(tree);
    // Compiling catches what parsing doesn't (e.g. invalid expressions).
    await processor.process(body);
  } catch (e) {
    fail(file, `MDX error: ${e.reason ?? e.message}`, { position: e.place ? { start: e.place.start ?? e.place } : undefined });
    continue;
  }

  const slugger = new GithubSlugger();
  const anchors = new Set();
  visit(tree, (node) => {
    if (node.type === "heading") anchors.add(slugger.slug(toText(node)));
    if (node.type === "mdxjsEsm") fail(file, "import and export statements are not allowed: use the built-in components", node);
    if ((node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") && node.name && /^[A-Z]/.test(node.name)) {
      if (!COMPONENTS.has(node.name)) fail(file, `unknown component <${node.name}> (available: ${[...COMPONENTS].join(", ")})`, node);
    }
  });
  parsed.set(urlOf(file), { file, tree, anchors });
}

function toText(node) {
  if (node.type === "text" || node.type === "inlineCode") return node.value;
  return (node.children ?? []).map(toText).join("");
}

// Links.
for (const { file, tree, anchors } of parsed.values()) {
  const check = (href, node) => {
    if (!href || /^(https?:|mailto:)/.test(href)) return;
    if (href.startsWith("#")) {
      if (!anchors.has(href.slice(1))) fail(file, `no heading for ${href} on this page`, node);
      return;
    }
    if (!href.startsWith("/")) {
      fail(file, `use site paths for links, e.g. /docs/guides/restore (got "${href}")`, node);
      return;
    }
    const [pathname, hash] = href.split("#");
    const clean = pathname.replace(/\/$/, "") || "/";
    if (!clean.startsWith("/docs")) {
      if (!SITE_PATHS.has(clean)) fail(file, `link to ${clean}, which is not a docs page or a known page of rowsafe.sh`, node);
      return;
    }
    const target = parsed.get(clean);
    if (!target) {
      fail(file, `broken link: ${href}`, node);
      return;
    }
    if (hash && !target.anchors.has(hash)) fail(file, `broken anchor: ${href} (no such heading on that page)`, node);
  };
  visit(tree, (node) => {
    if (node.type === "link" || node.type === "definition") check(node.url, node);
    if ((node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") && node.name === "Card") {
      const href = node.attributes.find((a) => a.name === "href")?.value;
      if (typeof href === "string") check(href, node);
    }
  });
}

// meta.json: every entry exists; with a "pages" list (and no "..."), every page
// of that folder must be in it, or it won't appear in the sidebar.
const metaByDir = new Map();
for (const file of metas) {
  let meta;
  try {
    meta = JSON.parse(await readFile(file, "utf8"));
  } catch (e) {
    fail(file, `not valid JSON: ${e.message}`);
    continue;
  }
  const dir = path.dirname(file);
  const names = new Set();
  for (const entry of meta.pages ?? []) {
    if (typeof entry !== "string") continue;
    if (/^---.*---$/.test(entry) || entry === "...") continue;
    const name = entry.startsWith("...") ? entry.slice(3) : entry;
    names.add(name);
    if (!(await exists(path.join(dir, `${name}.mdx`))) && !(await exists(path.join(dir, name)))) {
      fail(file, `"${entry}" is neither ${name}.mdx nor a folder`);
    }
  }
  metaByDir.set(dir, { names, all: !Array.isArray(meta.pages) || meta.pages.includes("...") });
}
for (const file of pages) {
  const meta = metaByDir.get(path.dirname(file));
  if (meta && !meta.all && !meta.names.has(path.basename(file, ".mdx"))) {
    fail(file, `not listed in ${path.relative(root, path.join(path.dirname(file), "meta.json"))}, so it won't appear in the sidebar`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} problem${errors.length === 1 ? "" : "s"} in ${pages.length} pages.`);
  process.exit(1);
}
console.log(`OK: ${pages.length} pages, ${metas.length} meta.json files, all links resolve.`);
