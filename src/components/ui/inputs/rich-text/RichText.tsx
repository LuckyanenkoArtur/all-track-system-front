import type { ReactNode } from "react";

import styles from "./RichText.module.scss";

type RichTextProps = {
  value: string;
  className?: string;
};

const UL_LINE = /^\s*[-*+]\s+(.*)$/;
const OL_LINE = /^\s*\d+\.\s+(.*)$/;
const BR_TOKEN = /^(<br\s*\/?>)/i;
const U_OPEN = /^<u>/i;
const U_CLOSE = "</u>";

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
  return text.toLowerCase().indexOf(close.toLowerCase(), from);
}

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let index = 0;
  let buffer = "";
  let token = 0;

  const flush = () => {
    if (!buffer) return;
    nodes.push(buffer);
    buffer = "";
  };

  const push = (node: ReactNode) => {
    flush();
    nodes.push(node);
  };

  while (index < text.length) {
    const brMatch = text.slice(index).match(BR_TOKEN);
    if (brMatch) {
      push(<br key={`${keyPrefix}-br-${token}`} />);
      token += 1;
      index += brMatch[1].length;
      continue;
    }

    if (U_OPEN.test(text.slice(index))) {
      const end = findClosingTag(text, index + 3, U_CLOSE);
      if (end !== -1) {
        push(
          <u key={`${keyPrefix}-u-${token}`}>
            {parseInline(text.slice(index + 3, end), `${keyPrefix}-u${token}`)}
          </u>,
        );
        token += 1;
        index = end + U_CLOSE.length;
        continue;
      }
    }

    if (text[index] === "`") {
      const end = text.indexOf("`", index + 1);
      if (end !== -1) {
        push(
          <code key={`${keyPrefix}-code-${token}`}>{text.slice(index + 1, end)}</code>,
        );
        token += 1;
        index = end + 1;
        continue;
      }
    }

    if (text.startsWith("~~", index)) {
      const end = text.indexOf("~~", index + 2);
      if (end !== -1) {
        push(
          <s key={`${keyPrefix}-s-${token}`}>
            {parseInline(text.slice(index + 2, end), `${keyPrefix}-s${token}`)}
          </s>,
        );
        token += 1;
        index = end + 2;
        continue;
      }
    }

    if (text.startsWith("***", index)) {
      const end = text.indexOf("***", index + 3);
      if (end !== -1) {
        push(
          <strong key={`${keyPrefix}-bolditalic-${token}`}>
            <em>
              {parseInline(text.slice(index + 3, end), `${keyPrefix}-bi${token}`)}
            </em>
          </strong>,
        );
        token += 1;
        index = end + 3;
        continue;
      }
    }

    if (text.startsWith("**", index)) {
      const end = text.indexOf("**", index + 2);
      if (end !== -1) {
        push(
          <strong key={`${keyPrefix}-bold-${token}`}>
            {parseInline(text.slice(index + 2, end), `${keyPrefix}-b${token}`)}
          </strong>,
        );
        token += 1;
        index = end + 2;
        continue;
      }
    }

    if (text[index] === "*" && text[index + 1] !== "*") {
      const end = findSingleMarkerEnd(text, index + 1, "*");
      if (end !== -1) {
        push(
          <em key={`${keyPrefix}-em-${token}`}>
            {parseInline(text.slice(index + 1, end), `${keyPrefix}-i${token}`)}
          </em>,
        );
        token += 1;
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
            <a
              key={`${keyPrefix}-link-${token}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {parseInline(
                text.slice(index + 1, labelEnd),
                `${keyPrefix}-a${token}`,
              )}
            </a>,
          );
          token += 1;
          index = hrefEnd + 1;
          continue;
        }
      }
    }

    buffer += text[index];
    index += 1;
  }

  flush();
  return nodes;
}

function parseBlocks(value: string): ReactNode[] {
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;
  let block = 0;

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
        items.push(match[1]);
        index += 1;
      }
      blocks.push(
        <ul key={`ul-${block}`}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{parseInline(item, `ul-${block}-${itemIndex}`)}</li>
          ))}
        </ul>,
      );
      block += 1;
      continue;
    }

    if (OL_LINE.test(lines[index])) {
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index].match(OL_LINE);
        if (!match) break;
        items.push(match[1]);
        index += 1;
      }
      blocks.push(
        <ol key={`ol-${block}`}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{parseInline(item, `ol-${block}-${itemIndex}`)}</li>
          ))}
        </ol>,
      );
      block += 1;
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !UL_LINE.test(lines[index]) &&
      !OL_LINE.test(lines[index])
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }

    blocks.push(
      <p key={`p-${block}`}>
        {paragraph.map((line, lineIndex) => (
          <span key={lineIndex}>
            {lineIndex > 0 ? <br /> : null}
            {parseInline(line, `p-${block}-${lineIndex}`)}
          </span>
        ))}
      </p>,
    );
    block += 1;
  }

  return blocks;
}

export function RichText({ value, className = "" }: RichTextProps) {
  const content = value.trim();
  if (!content) return null;

  return (
    <div className={`${styles.root} ${className}`.trim()}>{parseBlocks(content)}</div>
  );
}
