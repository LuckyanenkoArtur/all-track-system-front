export type TextareaFormatCommand =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "ul"
  | "ol";

export type TextareaFormatResult = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

const UL_PREFIX = /^\s*[-*+]\s+/;
const OL_PREFIX = /^\s*\d+\.\s+/;

function hasExactWrap(before: string, after: string, marker: string) {
  if (!before.endsWith(marker) || !after.startsWith(marker)) return false;
  if (marker !== "*") return true;
  if (before.endsWith("***") && after.startsWith("***")) return true;
  return !(before.endsWith("**") && after.startsWith("**"));
}

function hasExactInnerWrap(selected: string, marker: string) {
  if (
    !selected.startsWith(marker) ||
    !selected.endsWith(marker) ||
    selected.length < marker.length * 2
  ) {
    return false;
  }
  if (marker !== "*") return true;
  if (selected.startsWith("***") && selected.endsWith("***")) return true;
  return !(selected.startsWith("**") && selected.endsWith("**"));
}

function wrapInline(
  value: string,
  start: number,
  end: number,
  marker: string,
): TextareaFormatResult {
  const selected = value.slice(start, end);
  const before = value.slice(0, start);
  const after = value.slice(end);
  const markerLen = marker.length;

  if (hasExactWrap(before, after, marker)) {
    return {
      value: `${before.slice(0, -markerLen)}${selected}${after.slice(markerLen)}`,
      selectionStart: start - markerLen,
      selectionEnd: end - markerLen,
    };
  }

  if (hasExactInnerWrap(selected, marker)) {
    const inner = selected.slice(markerLen, -markerLen);
    return {
      value: `${before}${inner}${after}`,
      selectionStart: start,
      selectionEnd: start + inner.length,
    };
  }

  return {
    value: `${before}${marker}${selected}${marker}${after}`,
    selectionStart: start + markerLen,
    selectionEnd: end + markerLen,
  };
}

function wrapTag(
  value: string,
  start: number,
  end: number,
  open: string,
  close: string,
): TextareaFormatResult {
  const selected = value.slice(start, end);
  const before = value.slice(0, start);
  const after = value.slice(end);

  if (before.endsWith(open) && after.startsWith(close)) {
    return {
      value: `${before.slice(0, -open.length)}${selected}${after.slice(close.length)}`,
      selectionStart: start - open.length,
      selectionEnd: end - open.length,
    };
  }

  if (selected.startsWith(open) && selected.endsWith(close) && selected.length >= open.length + close.length) {
    const inner = selected.slice(open.length, -close.length);
    return {
      value: `${before}${inner}${after}`,
      selectionStart: start,
      selectionEnd: start + inner.length,
    };
  }

  return {
    value: `${before}${open}${selected}${close}${after}`,
    selectionStart: start + open.length,
    selectionEnd: end + open.length,
  };
}

function lineBounds(value: string, start: number, end: number) {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const nextBreak = value.indexOf("\n", end);
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;
  return { lineStart, lineEnd };
}

function toggleList(
  value: string,
  start: number,
  end: number,
  type: "ul" | "ol",
): TextareaFormatResult {
  const { lineStart, lineEnd } = lineBounds(value, start, end);
  const block = value.slice(lineStart, lineEnd);
  const lines = block.split("\n");
  const contentLines = lines.filter((line) => line.trim().length > 0);
  const prefix = type === "ul" ? UL_PREFIX : OL_PREFIX;
  const isFormatted =
    contentLines.length > 0 && contentLines.every((line) => prefix.test(line));

  const nextLines = isFormatted
    ? lines.map((line) => line.replace(prefix, ""))
    : lines.map((line, index) => {
        const text = line.replace(UL_PREFIX, "").replace(OL_PREFIX, "");
        if (!text.trim() && lines.length > 1) return text;
        return type === "ul" ? `- ${text}` : `${index + 1}. ${text}`;
      });

  const nextBlock = nextLines.join("\n");
  const nextValue = `${value.slice(0, lineStart)}${nextBlock}${value.slice(lineEnd)}`;

  if (!isFormatted && start === end && !block.trim()) {
    return {
      value: nextValue,
      selectionStart: lineStart + nextBlock.length,
      selectionEnd: lineStart + nextBlock.length,
    };
  }

  return {
    value: nextValue,
    selectionStart: lineStart,
    selectionEnd: lineStart + nextBlock.length,
  };
}

export function applyTextareaFormat(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  command: TextareaFormatCommand,
): TextareaFormatResult {
  const start = Math.max(0, Math.min(selectionStart, selectionEnd));
  const end = Math.max(0, Math.max(selectionStart, selectionEnd));

  if (command === "bold") return wrapInline(value, start, end, "**");
  if (command === "italic") return wrapInline(value, start, end, "*");
  if (command === "strike") return wrapInline(value, start, end, "~~");
  if (command === "code") return wrapInline(value, start, end, "`");
  if (command === "underline") return wrapTag(value, start, end, "<u>", "</u>");
  return toggleList(value, start, end, command);
}

export function isInlineFormatActive(
  value: string,
  start: number,
  end: number,
  marker: string,
): boolean {
  const selected = value.slice(start, end);
  const before = value.slice(0, start);
  const after = value.slice(end);
  return hasExactWrap(before, after, marker) || hasExactInnerWrap(selected, marker);
}

export function isListFormatActive(
  value: string,
  start: number,
  end: number,
  type: "ul" | "ol",
): boolean {
  const { lineStart, lineEnd } = lineBounds(value, start, end);
  const lines = value
    .slice(lineStart, lineEnd)
    .split("\n")
    .filter((line) => line.trim().length > 0);
  const prefix = type === "ul" ? UL_PREFIX : OL_PREFIX;
  return lines.length > 0 && lines.every((line) => prefix.test(line));
}
