const UL_LINE = /^\s*[-*+]\s+(.*)$/;
const OL_LINE = /^\s*\d+\.\s+(.*)$/;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "META", "LINK"]);
const BR_TOKEN = /^(<br\s*\/?>)/i;
const U_OPEN = /^<u>/i;
const U_CLOSE = "</u>";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isSafeHref(href: string): boolean {
  try {
    const url = new URL(href, "https://example.invalid");
    return (
      url.protocol === "http:" ||
      url.protocol === "https:" ||
      url.protocol === "mailto:"
    );
  } catch {
    return false;
  }
}

function findSingleMarkerEnd(text: string, from: number, marker: string) {
  for (let index = from; index < text.length; index += 1) {
    if (text.startsWith(marker + marker, index)) {
      index += marker.length;
      continue;
    }
    if (text[index] === marker) return index;
  }
  return -1;
}

function findClosingTag(text: string, from: number, close: string) {
  const end = text.toLowerCase().indexOf(close.toLowerCase(), from);
  return end;
}

function parseInlineHtml(text: string): string {
  let html = "";
  let index = 0;
  let buffer = "";

  const flush = () => {
    if (!buffer) return;
    html += escapeHtml(buffer);
    buffer = "";
  };

  const push = (chunk: string) => {
    flush();
    html += chunk;
  };

  while (index < text.length) {
    const brMatch = text.slice(index).match(BR_TOKEN);
    if (brMatch) {
      push("<br>");
      index += brMatch[1].length;
      continue;
    }

    if (U_OPEN.test(text.slice(index))) {
      const end = findClosingTag(text, index + 3, U_CLOSE);
      if (end !== -1) {
        push(`<u>${parseInlineHtml(text.slice(index + 3, end))}</u>`);
        index = end + U_CLOSE.length;
        continue;
      }
    }

    if (text[index] === "`") {
      const end = text.indexOf("`", index + 1);
      if (end !== -1) {
        push(`<code>${escapeHtml(text.slice(index + 1, end))}</code>`);
        index = end + 1;
        continue;
      }
    }

    if (text.startsWith("~~", index)) {
      const end = text.indexOf("~~", index + 2);
      if (end !== -1) {
        push(`<s>${parseInlineHtml(text.slice(index + 2, end))}</s>`);
        index = end + 2;
        continue;
      }
    }

    if (text.startsWith("***", index)) {
      const end = text.indexOf("***", index + 3);
      if (end !== -1) {
        push(`<strong><em>${parseInlineHtml(text.slice(index + 3, end))}</em></strong>`);
        index = end + 3;
        continue;
      }
    }

    if (text.startsWith("**", index)) {
      const end = text.indexOf("**", index + 2);
      if (end !== -1) {
        push(`<strong>${parseInlineHtml(text.slice(index + 2, end))}</strong>`);
        index = end + 2;
        continue;
      }
    }

    if (text[index] === "*" && text[index + 1] !== "*") {
      const end = findSingleMarkerEnd(text, index + 1, "*");
      if (end !== -1) {
        push(`<em>${parseInlineHtml(text.slice(index + 1, end))}</em>`);
        index = end + 1;
        continue;
      }
    }

    if (text[index] === "[") {
      const labelEnd = text.indexOf("](", index);
      const hrefEnd = labelEnd === -1 ? -1 : text.indexOf(")", labelEnd + 2);
      if (labelEnd !== -1 && hrefEnd !== -1) {
        const href = text.slice(labelEnd + 2, hrefEnd);
        if (isSafeHref(href)) {
          push(
            `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${parseInlineHtml(
              text.slice(index + 1, labelEnd),
            )}</a>`,
          );
          index = hrefEnd + 1;
          continue;
        }
      }
    }

    buffer += text[index];
    index += 1;
  }

  flush();
  return html;
}

export function markdownToSafeHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  let index = 0;

  while (index < lines.length) {
    if (!lines[index].trim()) {
      index += 1;
      continue;
    }

    if (UL_LINE.test(lines[index])) {
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index].match(UL_LINE);
        if (!match) break;
        items.push(`<li>${parseInlineHtml(match[1])}</li>`);
        index += 1;
      }
      blocks.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (OL_LINE.test(lines[index])) {
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index].match(OL_LINE);
        if (!match) break;
        items.push(`<li>${parseInlineHtml(match[1])}</li>`);
        index += 1;
      }
      blocks.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !UL_LINE.test(lines[index]) &&
      !OL_LINE.test(lines[index])
    ) {
      paragraph.push(parseInlineHtml(lines[index]));
      index += 1;
    }

    blocks.push(`<div>${paragraph.join("<br>")}</div>`);
  }

  return blocks.join("");
}

function isElement(node: Node): node is HTMLElement {
  return node.nodeType === Node.ELEMENT_NODE;
}

function isBr(node: Node): boolean {
  return isElement(node) && node.tagName === "BR";
}

function isBoldValue(value: string): boolean {
  const weight = Number(value);
  return (
    value === "bold" ||
    value === "bolder" ||
    value === "600" ||
    value === "650" ||
    value === "700" ||
    value === "800" ||
    value === "900" ||
    (!Number.isNaN(weight) && weight >= 600)
  );
}

function hasTextDecoration(style: CSSStyleDeclaration, value: string): boolean {
  return style.textDecoration.includes(value) || style.textDecorationLine.includes(value);
}

function wrapInline(marker: string, inner: string): string {
  if (!inner) return "";
  return `${marker}${inner}${marker}`;
}

function wrapTag(open: string, close: string, inner: string): string {
  if (!inner) return "";
  return `${open}${inner}${close}`;
}

function serializeInline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.replace(/\u00a0/g, " ") ?? "";
  }

  if (!isElement(node) || SKIP_TAGS.has(node.tagName)) return "";
  if (isBr(node)) return "\n";

  const inner = serializeInlineChildren(node);
  const tag = node.tagName;

  if (tag === "STRONG" || tag === "B") return wrapInline("**", inner);
  if (tag === "EM" || tag === "I") return wrapInline("*", inner);
  if (tag === "CODE" || tag === "KBD") return inner ? `\`${inner.replace(/`/g, "")}\`` : "";
  if (tag === "U") return wrapTag("<u>", "</u>", inner);
  if (tag === "S" || tag === "STRIKE" || tag === "DEL") return wrapInline("~~", inner);
  if (tag === "A") {
    const href = node.getAttribute("href") ?? "";
    return isSafeHref(href) && inner ? `[${inner}](${href})` : inner;
  }

  const fontWeight = node.style.fontWeight;
  const fontStyle = node.style.fontStyle;
  let result = inner;
  if (fontStyle === "italic") result = wrapInline("*", result);
  if (isBoldValue(fontWeight)) result = wrapInline("**", result);
  if (hasTextDecoration(node.style, "underline")) result = wrapTag("<u>", "</u>", result);
  if (hasTextDecoration(node.style, "line-through")) result = wrapInline("~~", result);
  return result;
}

function serializeInlineChildren(node: Node): string {
  const nodes = Array.from(node.childNodes);
  while (nodes.length > 0 && isBr(nodes[nodes.length - 1])) {
    nodes.pop();
  }
  return nodes.map((child) => serializeInline(child)).join("");
}

function serializeList(list: HTMLElement, type: "ul" | "ol"): string {
  const items = Array.from(list.children).filter(
    (child): child is HTMLElement => isElement(child) && child.tagName === "LI",
  );

  return items
    .map((item, index) => {
      const text = serializeInlineChildren(item).replace(/\n/g, "<br>").trim();
      if (!text) return "";
      return type === "ul" ? `- ${text}` : `${index + 1}. ${text}`;
    })
    .filter(Boolean)
    .join("\n");
}

const BLOCK_TAGS = new Set([
  "DIV",
  "P",
  "UL",
  "OL",
  "LI",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "BLOCKQUOTE",
  "PRE",
]);

function isBlockNode(node: Node): node is HTMLElement {
  return isElement(node) && BLOCK_TAGS.has(node.tagName);
}

function serializeBlocks(node: Node): string[] {
  if (!isElement(node) || SKIP_TAGS.has(node.tagName)) return [];

  const tag = node.tagName;
  if (tag === "UL") {
    const list = serializeList(node, "ul");
    return list ? [list] : [];
  }
  if (tag === "OL") {
    const list = serializeList(node, "ol");
    return list ? [list] : [];
  }
  if (tag === "LI") {
    const text = serializeInlineChildren(node).replace(/\n/g, "<br>").trim();
    return text ? [text] : [];
  }

  const hasBlockChild = Array.from(node.childNodes).some((child) => isBlockNode(child));
  if (hasBlockChild) {
    return collectBlocks(node);
  }

  const text = serializeInlineChildren(node);
  return text ? [text] : [];
}

function collectBlocks(root: ParentNode): string[] {
  const blocks: string[] = [];
  let inlineBuffer = "";

  const flushInline = () => {
    const text = inlineBuffer.replace(/\u00a0/g, " ");
    if (text) blocks.push(text);
    inlineBuffer = "";
  };

  for (const child of Array.from(root.childNodes)) {
    if (isElement(child) && SKIP_TAGS.has(child.tagName)) continue;

    if (isBlockNode(child)) {
      flushInline();
      blocks.push(...serializeBlocks(child));
      continue;
    }

    inlineBuffer += serializeInline(child);
  }

  flushInline();
  return blocks;
}

export function htmlToMarkdown(root: ParentNode): string {
  return collectBlocks(root)
    .join("\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "");
}

export function isMarkdownEmpty(markdown: string): boolean {
  return markdown.replace(/\u00a0/g, " ").trim().length === 0;
}
