import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type ComponentPropsWithoutRef,
  type DragEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { FiBold, FiCode, FiItalic, FiList, FiUnderline } from "react-icons/fi";
import { MdFormatListNumbered, MdStrikethroughS } from "react-icons/md";

import { useTranslation } from "../../../../i18n/index.ts";
import { type TextareaFormatCommand } from "./applyTextareaFormat.ts";
import {
  htmlToMarkdown,
  isMarkdownEmpty,
  markdownToSafeHtml,
} from "./richEditorHtml.ts";

export type { TextareaFormatCommand };
import styles from "./Textarea.module.scss";

export type TextareaFormatLabels = {
  bold: string;
  italic: string;
  underline: string;
  strikethrough: string;
  code: string;
  bulletList: string;
  numberedList: string;
};

export type TextareaProps = Omit<
  ComponentPropsWithoutRef<"textarea">,
  "onKeyDown"
> & {
  rich?: boolean;
  autoGrow?: boolean;
  maxHeight?: number;
  variant?: "default" | "plain";
  formatLabels?: Partial<TextareaFormatLabels>;
  /** Extra actions at the start of the rich toolbar row, outside `role="toolbar"`. Ignored when `rich` is false. */
  toolbarStart?: ReactNode;
  /** Extra actions at the end of the rich toolbar row, outside `role="toolbar"`. Ignored when `rich` is false. */
  toolbarEnd?: ReactNode;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>) => void;
};

/** Cap for plain `autoGrow` textareas. */
const DEFAULT_AUTO_GROW_MAX_HEIGHT = 140;
/** Fixed rich editor surface height (~2–3 lines at composer font size). */
const DEFAULT_RICH_EDITOR_HEIGHT = 80;

type FormatState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  code: boolean;
  ul: boolean;
  ol: boolean;
};

function preventToolbarFocusSteal(event: MouseEvent<HTMLElement>) {
  event.preventDefault();
}

function queryCommandState(command: string): boolean {
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
}

function execEditorCommand(command: string) {
  try {
    document.execCommand(command, false);
  } catch {
    // Unsupported document commands are ignored; toolbar state stays unchanged.
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getListItem(editor: HTMLElement | null): HTMLLIElement | null {
  const selection = window.getSelection();
  if (!editor || !selection || selection.rangeCount === 0) return null;

  let node: Node | null = selection.anchorNode;
  while (node && node !== editor) {
    if (node instanceof HTMLLIElement) return node;
    node = node.parentNode;
  }
  return null;
}

function getClosestTag(
  editor: HTMLElement | null,
  tagName: string,
): HTMLElement | null {
  const selection = window.getSelection();
  if (!editor || !selection || !selection.anchorNode) return null;

  let node: Node | null = selection.anchorNode;
  while (node && node !== editor) {
    if (node instanceof HTMLElement && node.tagName === tagName) return node;
    node = node.parentNode;
  }
  return null;
}

function isEmptyListItem(item: HTMLLIElement): boolean {
  return (item.textContent ?? "").replace(/\u00a0/g, " ").trim().length === 0;
}

function unwrapElement(element: HTMLElement) {
  const parent = element.parentNode;
  if (!parent) return;
  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  parent.removeChild(element);
}

function toggleCodeFormat(editor: HTMLElement | null) {
  if (!editor) return;

  const existing = getClosestTag(editor, "CODE");
  if (existing) {
    unwrapElement(existing);
    return;
  }

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  if (selection.isCollapsed) {
    try {
      document.execCommand("insertHTML", false, "<code>\u200b</code>");
    } catch {
      // Best-effort; unsupported engines keep prior content.
    }
    return;
  }

  const selected = selection.toString();
  try {
    document.execCommand("insertHTML", false, `<code>${escapeHtml(selected)}</code>`);
  } catch {
    // Best-effort; unsupported engines keep prior content.
  }
}

const PlainTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function PlainTextarea(
    {
      className = "",
      rows = 3,
      autoGrow = false,
      maxHeight = DEFAULT_AUTO_GROW_MAX_HEIGHT,
      variant = "default",
      onChange,
      value,
      id,
      rich: _rich,
      formatLabels: _formatLabels,
      toolbarStart: _toolbarStart,
      toolbarEnd: _toolbarEnd,
      onKeyDown,
      ...props
    },
    forwardedRef,
  ) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(forwardedRef, () => textareaRef.current as HTMLTextAreaElement);

    const resizeField = useCallback(() => {
      const node = textareaRef.current;
      if (!node || !autoGrow) return;

      node.style.height = "auto";
      const nextHeight = Math.min(node.scrollHeight, maxHeight);
      node.style.height = `${nextHeight}px`;
      node.style.overflowY = node.scrollHeight > maxHeight ? "auto" : "hidden";
    }, [autoGrow, maxHeight]);

    useLayoutEffect(() => {
      resizeField();
    }, [resizeField, value, rows]);

    return (
      <textarea
        ref={textareaRef}
        id={fieldId}
        className={`${styles.textarea} ${variant === "plain" ? styles.plain : ""} ${className}`.trim()}
        rows={rows}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        {...props}
      />
    );
  },
);

const RichTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function RichTextarea(
    {
      className = "",
      rows: _rows = 3,
      autoGrow: _autoGrow = false,
      maxHeight = DEFAULT_RICH_EDITOR_HEIGHT,
      variant = "default",
      formatLabels,
      toolbarStart,
      toolbarEnd,
      onChange,
      onKeyDown,
      onFocus,
      onBlur,
      disabled,
      readOnly,
      value,
      defaultValue,
      id,
      placeholder,
      name,
      required,
      enterKeyHint,
      rich: _rich,
      "aria-label": ariaLabel,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    forwardedRef,
  ) {
    const { t } = useTranslation();
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const editorRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastEmittedRef = useRef<string | null>(null);
    const composingRef = useRef(false);
    const [empty, setEmpty] = useState(() =>
      isMarkdownEmpty(typeof value === "string" ? value : ""),
    );
    const [formatState, setFormatState] = useState<FormatState>({
      bold: false,
      italic: false,
      underline: false,
      strike: false,
      code: false,
      ul: false,
      ol: false,
    });

    const labels: TextareaFormatLabels = {
      bold: formatLabels?.bold ?? t.common.formatBold,
      italic: formatLabels?.italic ?? t.common.formatItalic,
      underline: formatLabels?.underline ?? t.common.formatUnderline,
      strikethrough: formatLabels?.strikethrough ?? t.common.formatStrikethrough,
      code: formatLabels?.code ?? t.common.formatCode,
      bulletList: formatLabels?.bulletList ?? t.common.formatBulletList,
      numberedList: formatLabels?.numberedList ?? t.common.formatNumberedList,
    };

    useImperativeHandle(forwardedRef, () => {
      const textarea = textareaRef.current as HTMLTextAreaElement;
      return new Proxy(textarea, {
        get(target, prop, receiver) {
          if (prop === "focus") {
            return () => editorRef.current?.focus();
          }
          if (prop === "blur") {
            return () => editorRef.current?.blur();
          }
          const current = Reflect.get(target, prop, receiver);
          return typeof current === "function" ? current.bind(target) : current;
        },
      });
    });

    const refreshFormatState = useCallback(() => {
      const editor = editorRef.current;
      const selection = window.getSelection();
      if (
        !editor ||
        !selection ||
        !selection.anchorNode ||
        !editor.contains(selection.anchorNode)
      ) {
        return;
      }

      setFormatState({
        bold: queryCommandState("bold"),
        italic: queryCommandState("italic"),
        underline: queryCommandState("underline"),
        strike: queryCommandState("strikeThrough"),
        code: getClosestTag(editor, "CODE") != null,
        ul: queryCommandState("insertUnorderedList"),
        ol: queryCommandState("insertOrderedList"),
      });
    }, []);

    const emitMarkdown = useCallback(
      (nextValue: string) => {
        const node = textareaRef.current;
        if (!node) return;

        lastEmittedRef.current = nextValue;
        setEmpty(isMarkdownEmpty(nextValue));

        const descriptor = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          "value",
        );
        descriptor?.set?.call(node, nextValue);

        onChange?.({
          target: node,
          currentTarget: node,
        } as ChangeEvent<HTMLTextAreaElement>);
      },
      [onChange],
    );

    const emitFromEditor = useCallback(() => {
      const editor = editorRef.current;
      if (!editor) return;
      emitMarkdown(htmlToMarkdown(editor));
      refreshFormatState();
    }, [emitMarkdown, refreshFormatState]);

    useLayoutEffect(() => {
      const editor = editorRef.current;
      if (!editor) return;

      if (value === undefined) {
        if (lastEmittedRef.current !== null) return;
        const initial = typeof defaultValue === "string" ? defaultValue : "";
        editor.innerHTML = markdownToSafeHtml(initial);
        lastEmittedRef.current = initial;
        setEmpty(isMarkdownEmpty(initial));
        return;
      }

      const next = typeof value === "string" ? value : "";
      if (next === lastEmittedRef.current) return;
      editor.innerHTML = markdownToSafeHtml(next);
      lastEmittedRef.current = next;
      setEmpty(isMarkdownEmpty(next));
    }, [defaultValue, value]);

    useEffect(() => {
      const handleSelectionChange = () => {
        refreshFormatState();
      };

      document.addEventListener("selectionchange", handleSelectionChange);
      return () => {
        document.removeEventListener("selectionchange", handleSelectionChange);
      };
    }, [refreshFormatState]);

    const applyFormat = (command: TextareaFormatCommand) => {
      if (disabled || readOnly) return;
      editorRef.current?.focus();

      if (command === "code") {
        toggleCodeFormat(editorRef.current);
        emitFromEditor();
        return;
      }

      const execCommand = {
        bold: "bold",
        italic: "italic",
        underline: "underline",
        strike: "strikeThrough",
        ul: "insertUnorderedList",
        ol: "insertOrderedList",
      }[command];

      if (execCommand) execEditorCommand(execCommand);
      emitFromEditor();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.nativeEvent.isComposing || event.key === "Process") {
        return;
      }

      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        onKeyDown?.(event);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && !event.altKey) {
        const key = event.key.toLowerCase();
        if (key === "b") {
          event.preventDefault();
          applyFormat("bold");
          return;
        }
        if (key === "i") {
          event.preventDefault();
          applyFormat("italic");
          return;
        }
        if (key === "u") {
          event.preventDefault();
          applyFormat("underline");
          return;
        }
        if (key === "e") {
          event.preventDefault();
          applyFormat("code");
          return;
        }
      }

      if (event.key === "Enter" && event.shiftKey) {
        event.preventDefault();
        execEditorCommand("insertLineBreak");
        emitFromEditor();
        return;
      }

      if (event.key === "Enter" && !event.shiftKey) {
        const listItem = getListItem(editorRef.current);
        if (listItem && !isEmptyListItem(listItem)) {
          // Native contenteditable starts a new list item.
          return;
        }
        if (listItem && isEmptyListItem(listItem)) {
          event.preventDefault();
          execEditorCommand(
            listItem.closest("ol") ? "insertOrderedList" : "insertUnorderedList",
          );
          emitFromEditor();
          return;
        }
      }

      onKeyDown?.(event);
    };

    const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();
      const text = event.clipboardData.getData("text/plain");
      execEditorCommandInsertText(text);
      emitFromEditor();
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const text = event.dataTransfer.getData("text/plain");
      if (!text) return;
      execEditorCommandInsertText(text);
      emitFromEditor();
    };

    const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
      try {
        document.execCommand("styleWithCSS", false, "false");
      } catch {
        // styleWithCSS is optional; span fallbacks are serialized.
      }
      onFocus?.(event as unknown as FocusEvent<HTMLTextAreaElement>);
    };

    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
      onBlur?.(event as unknown as FocusEvent<HTMLTextAreaElement>);
    };

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
      if (event.target instanceof HTMLAnchorElement) {
        event.preventDefault();
      }
    };

    const currentValue = typeof value === "string" ? value : lastEmittedRef.current ?? "";
    const editable = !disabled && !readOnly;

    return (
      <div
        className={`${styles.richRoot} ${variant === "plain" ? styles.richPlain : styles.richDefault} ${
          disabled ? styles.richDisabled : ""
        } ${className}`.trim()}
      >
        <div className={styles.toolbarBar} data-toolbar-bar>
          {toolbarStart ? (
            <>
              <div
                className={styles.toolbarSlot}
                onMouseDown={preventToolbarFocusSteal}
              >
                {toolbarStart}
              </div>
              <span className={styles.toolbarDivider} aria-hidden />
            </>
          ) : null}
          <div
            className={styles.toolbar}
            role="toolbar"
            aria-label={t.common.formatToolbar}
            aria-controls={fieldId}
          >
            <button
              type="button"
              className={`${styles.formatBtn} ${formatState.bold ? styles.formatBtnActive : ""}`.trim()}
              onMouseDown={preventToolbarFocusSteal}
              onClick={() => applyFormat("bold")}
              disabled={!editable}
              aria-label={labels.bold}
              aria-pressed={formatState.bold}
              title={labels.bold}
            >
              <FiBold size={14} aria-hidden />
            </button>
            <button
              type="button"
              className={`${styles.formatBtn} ${formatState.italic ? styles.formatBtnActive : ""}`.trim()}
              onMouseDown={preventToolbarFocusSteal}
              onClick={() => applyFormat("italic")}
              disabled={!editable}
              aria-label={labels.italic}
              aria-pressed={formatState.italic}
              title={labels.italic}
            >
              <FiItalic size={14} aria-hidden />
            </button>
            <button
              type="button"
              className={`${styles.formatBtn} ${formatState.underline ? styles.formatBtnActive : ""}`.trim()}
              onMouseDown={preventToolbarFocusSteal}
              onClick={() => applyFormat("underline")}
              disabled={!editable}
              aria-label={labels.underline}
              aria-pressed={formatState.underline}
              title={labels.underline}
            >
              <FiUnderline size={14} aria-hidden />
            </button>
            <button
              type="button"
              className={`${styles.formatBtn} ${formatState.strike ? styles.formatBtnActive : ""}`.trim()}
              onMouseDown={preventToolbarFocusSteal}
              onClick={() => applyFormat("strike")}
              disabled={!editable}
              aria-label={labels.strikethrough}
              aria-pressed={formatState.strike}
              title={labels.strikethrough}
            >
              <MdStrikethroughS size={16} aria-hidden />
            </button>
            <button
              type="button"
              className={`${styles.formatBtn} ${formatState.code ? styles.formatBtnActive : ""}`.trim()}
              onMouseDown={preventToolbarFocusSteal}
              onClick={() => applyFormat("code")}
              disabled={!editable}
              aria-label={labels.code}
              aria-pressed={formatState.code}
              title={labels.code}
            >
              <FiCode size={14} aria-hidden />
            </button>
            <button
              type="button"
              className={`${styles.formatBtn} ${formatState.ul ? styles.formatBtnActive : ""}`.trim()}
              onMouseDown={preventToolbarFocusSteal}
              onClick={() => applyFormat("ul")}
              disabled={!editable}
              aria-label={labels.bulletList}
              aria-pressed={formatState.ul}
              title={labels.bulletList}
            >
              <FiList size={14} aria-hidden />
            </button>
            <button
              type="button"
              className={`${styles.formatBtn} ${formatState.ol ? styles.formatBtnActive : ""}`.trim()}
              onMouseDown={preventToolbarFocusSteal}
              onClick={() => applyFormat("ol")}
              disabled={!editable}
              aria-label={labels.numberedList}
              aria-pressed={formatState.ol}
              title={labels.numberedList}
            >
              <MdFormatListNumbered size={16} aria-hidden />
            </button>
          </div>
          {toolbarEnd ? (
            <>
              <span className={styles.toolbarDivider} aria-hidden />
              <div
                className={styles.toolbarSlot}
                onMouseDown={preventToolbarFocusSteal}
              >
                {toolbarEnd}
              </div>
            </>
          ) : null}
        </div>

        <div
          ref={editorRef}
          id={fieldId}
          className={`${styles.textarea} ${variant === "plain" ? styles.plain : ""} ${styles.editor} ${
            empty ? styles.editorEmpty : ""
          }`.trim()}
          style={{ height: maxHeight, maxHeight }}
          contentEditable={editable}
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          aria-placeholder={placeholder}
          aria-disabled={disabled || undefined}
          aria-readonly={readOnly || undefined}
          data-placeholder={placeholder}
          enterKeyHint={enterKeyHint}
          tabIndex={disabled ? -1 : 0}
          suppressContentEditableWarning
          onInput={() => {
            if (!composingRef.current) emitFromEditor();
          }}
          onCompositionStart={() => {
            composingRef.current = true;
          }}
          onCompositionEnd={() => {
            composingRef.current = false;
            emitFromEditor();
          }}
          onKeyDown={handleKeyDown}
          onKeyUp={refreshFormatState}
          onMouseUp={refreshFormatState}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClick={handleClick}
        />

        <textarea
          {...props}
          ref={textareaRef}
          className={styles.valueMirror}
          tabIndex={-1}
          aria-hidden
          name={name}
          required={required}
          disabled={disabled}
          readOnly
          value={currentValue}
          onChange={onChange}
        />
      </div>
    );
  },
);

function execEditorCommandInsertText(text: string) {
  try {
    document.execCommand("insertText", false, text);
  } catch {
    // Clipboard/drop insertion is best-effort; the editor keeps prior content.
  }
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(props, forwardedRef) {
    if (props.rich) {
      return <RichTextarea {...props} ref={forwardedRef} />;
    }

    return <PlainTextarea {...props} ref={forwardedRef} />;
  },
);
