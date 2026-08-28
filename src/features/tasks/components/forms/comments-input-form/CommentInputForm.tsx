import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { FiSend } from "react-icons/fi";
import { Attachments } from "@primitive/attachments/Attachments.tsx";
import { Button } from "@primitive/button/Button.tsx";
import { Textarea } from "@input/textarea/Textarea";
import { useTranslation } from "../../../../../i18n/index.ts";
import {
  createPendingAttachment,
  MAX_COMMENT_ATTACHMENTS,
  MAX_COMMENT_FILE_SIZE,
  readFileAsDataUrl,
  type PendingAttachment,
} from "../../../utils/commentUtils.ts";
import { FileAttachmentButton } from "../../buttons/file-attachment-button/FileAttachmentButton.tsx";
import styles from "./CommentInputForm.module.scss";

export type CommentInputFormProps = {
  onAddComment: (body: string, attachments: PendingAttachment[]) => void;
};

export function CommentInputForm({ onAddComment }: CommentInputFormProps) {
  const { t } = useTranslation();
  const errorId = useId();

  const [body, setBody] = useState("");

  const [pendingAttachments, setPendingAttachments] = useState<
    PendingAttachment[]
  >([]);

  const [error, setError] = useState<string | null>(null);

  const canSubmit = body.trim().length > 0 || pendingAttachments.length > 0;

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    setError(null);

    if (pendingAttachments.length + files.length > MAX_COMMENT_ATTACHMENTS) {
      setError(t.tasks.details.maxAttachments);
      return;
    }

    try {
      const nextAttachments: PendingAttachment[] = [];

      for (const file of files) {
        if (file.size > MAX_COMMENT_FILE_SIZE) {
          setError(t.tasks.details.fileTooLarge);
          continue;
        }

        const dataUrl = await readFileAsDataUrl(file);
        nextAttachments.push(createPendingAttachment(file, dataUrl));
      }

      if (nextAttachments.length > 0) {
        setPendingAttachments((prev) =>
          [...prev, ...nextAttachments].slice(0, MAX_COMMENT_ATTACHMENTS),
        );
      }
    } catch {
      setError(t.tasks.details.fileTooLarge);
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setPendingAttachments((prev) =>
      prev.filter((item) => item.id !== attachmentId),
    );
    setError(null);
  };

  const submitComment = () => {
    if (!canSubmit) return;
    onAddComment(body.trim(), pendingAttachments);
    setBody("");
    setPendingAttachments([]);
    setError(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitComment();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>,
  ) => {
    if (event.nativeEvent.isComposing || event.key === "Process") return;
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      submitComment();
    }
  };

  return (
    <form
      className={styles.composer}
      onSubmit={handleSubmit}
      aria-label={t.tasks.details.addComment}
    >
      <Attachments
        items={pendingAttachments}
        onRemove={handleRemoveAttachment}
        removeLabel={t.tasks.details.removeAttachment}
      />

      {/* !We need to create new component Text and add the error type to it, and normal type too */}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.composerRow}>
        <Textarea
          className={styles.composerField}
          variant="plain"
          rich
          maxHeight={140}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={t.tasks.details.commentPlaceholder}
          aria-label={t.tasks.details.commentPlaceholder}
          aria-invalid={error != null}
          aria-describedby={error ? errorId : undefined}
          enterKeyHint="enter"
          onKeyDown={handleKeyDown}
          toolbarStart={
            <FileAttachmentButton
              onFilesSelected={handleFilesSelected}
              aria-label={t.tasks.details.attachFile}
              title={t.tasks.details.attachFile}
              multiple
            />
          }
        />

        <Button
          onClick={submitComment}
          className={styles.sendBtn}
          disabled={!canSubmit}
          ariaLabel={t.tasks.details.sendComment}
        >
          <Button.Icon>
            <FiSend size={16} />
          </Button.Icon>
          <Button.Tooltip position="top">
            {t.tasks.details.sendCommentHint}
          </Button.Tooltip>
        </Button>
      </div>
    </form>
  );
}
