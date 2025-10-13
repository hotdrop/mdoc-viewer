import prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-shell-session";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import rehypeSanitize from "rehype-sanitize";
import { fromHtml } from "hast-util-from-html";
import type { Root, Element, Node, Text, Parent } from "hast";
import type { Options as RemarkRehypeOptions } from "remark-rehype";
import { loadSanitizePolicy } from "./sanitize";
import { resolveRelativeDocPath } from "@/lib/path";

export type TocItem = {
  id: string;
  title: string;
  depth: number;
};

export type MarkdownRenderResult = {
  html: string;
  toc: TocItem[];
};

const SUPPORTED_LANGUAGES = new Set(["bash", "javascript", "typescript", "json", "yaml", "markdown"]);

const LANGUAGE_ALIASES: Record<string, string> = {
  shell: "bash",
  sh: "bash",
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  yml: "yaml",
};

type RenderOptions = {
  currentRelativePath: string;
};

export async function renderMarkdown(markdown: string, options: RenderOptions): Promise<MarkdownRenderResult> {
  const toc: TocItem[] = [];
  const sanitizePolicy = await loadSanitizePolicy();
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype, remarkRehypeOptions)
    .use(rehypeSlug)
    .use(withHeadingAnchors, toc)
    .use(withRelativeLinks, options.currentRelativePath)
    .use(withPrismHighlight)
    .use(rehypeSanitize, sanitizePolicy)
    .use(rehypeStringify, { allowDangerousHtml: false });

  const file = await processor.process(markdown);
  return {
    html: String(file),
    toc,
  };
}

const remarkRehypeOptions: RemarkRehypeOptions = {
  allowDangerousHtml: false,
};

function withHeadingAnchors(toc: TocItem[]) {
  return (tree: Root) => {
    visitElements(tree, (node) => {
      if (!isHeading(node.tagName)) {
        return;
      }
      if (typeof node.properties?.id !== "string") {
        return;
      }
      const id = node.properties.id;
      const textContent = extractText(node).trim();
      if (!textContent) {
        return;
      }
      const depth = parseInt(node.tagName.slice(1), 10);
      toc.push({ id, title: textContent, depth });

      node.children = [
        {
          type: "element",
          tagName: "a",
          properties: {
            href: `#${id}`,
            className: ["heading-anchor"],
          },
          children: node.children,
        },
      ];
    });
  };
}

function isHeading(tagName: Element["tagName"]): tagName is "h1" | "h2" | "h3" | "h4" | "h5" | "h6" {
  return /^h[1-6]$/.test(tagName);
}

function extractText(node: Element): string {
  let text = "";
  visitTexts(node, (value) => {
    text += value.value ?? "";
  });
  return text;
}

function withPrismHighlight() {
  return (tree: Root) => {
    visitElements(tree, (node) => {
      if (node.tagName !== "code") return;
      const className = getClassName(node);
      const requestedLanguage = extractLanguage(className);
      if (!requestedLanguage) return;

      const language = ensurePrismLanguage(requestedLanguage);
      if (!language) return;

      const code = getTextContent(node);
      const grammar = prism.languages[language];
      if (!grammar) return;

      const highlighted = prism.highlight(code, grammar, language);
      const fragment = fromHtml(highlighted, { fragment: true });
      node.children = fragment.children as Element[];
    });
  };
}

function withRelativeLinks(currentRelativePath: string) {
  return (tree: Root) => {
    visitElements(tree, (node) => {
      if (node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href !== "string" || href.length === 0) {
        return;
      }
      if (href.startsWith("#")) {
        return;
      }
      if (/^[a-zA-Z][a-zA-Z+.-]*:/.test(href)) {
        return;
      }

      try {
        const normalized = resolveRelativeDocPath(currentRelativePath, href);
        node.properties = {
          ...(node.properties ?? {}),
          href: normalized.viewerPath,
        };
      } catch {
        node.tagName = "span";
        if (node.properties) {
          delete node.properties.href;
        }
      }
    });
  };
}

function getClassName(node: Element): string[] {
  const properties = node.properties ?? {};
  const className = properties.className;
  if (Array.isArray(className)) {
    return className.map(String);
  }
  if (typeof className === "string") {
    return className.split(/\s+/);
  }
  return [];
}

function extractLanguage(classNames: string[]): string | null {
  for (const name of classNames) {
    if (name.startsWith("language-")) {
      return name.slice("language-".length).toLowerCase();
    }
  }
  return null;
}

function ensurePrismLanguage(language: string): string | null {
  const normalized = normalizeLanguage(language);
  if (!normalized) {
    return null;
  }
  if (!prism.languages[normalized]) {
    return null;
  }
  return normalized;
}

function getTextContent(node: Element): string {
  let text = "";
  visitTexts(node, (value) => {
    text += value.value ?? "";
  });
  return text;
}

type VisitHandlers = {
  onElement?: (node: Element) => void;
  onText?: (node: Text) => void;
};

function visitElements(node: Node, visitor: (node: Element) => void): void {
  traverse(node, { onElement: visitor });
}

function visitTexts(node: Node, visitor: (node: Text) => void): void {
  traverse(node, { onText: visitor });
}

function traverse(node: Node, handlers: VisitHandlers): void {
  if (isElementNode(node)) {
    handlers.onElement?.(node);
  }
  if (isTextNode(node)) {
    handlers.onText?.(node);
  }
  if (isParentNode(node)) {
    for (const child of node.children) {
      traverse(child, handlers);
    }
  }
}

function isParentNode(node: Node): node is Parent {
  return "children" in node && Array.isArray((node as Parent).children);
}

function isElementNode(node: Node): node is Element {
  return node.type === "element";
}

function isTextNode(node: Node): node is Text {
  return node.type === "text";
}

function normalizeLanguage(language: string): string | null {
  const lower = language.toLowerCase();
  const canonical = LANGUAGE_ALIASES[lower] ?? lower;
  if (!SUPPORTED_LANGUAGES.has(canonical)) {
    return null;
  }
  return canonical;
}
