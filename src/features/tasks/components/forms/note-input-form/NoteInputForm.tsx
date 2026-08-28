import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { FiSend } from "react-icons/fi";
import { Button } from "@primitive/button/Button.tsx";
import { Textarea } from "@input/textarea/Textarea";
import { useTranslation } from "../../../../../i18n/index.ts";
import styles from "./NoteInputForm.module.scss";

export type NoteInputFormProps = {
  onAddNote: (body: string) => void;
};

export function NoteInputForm({ onAddNote }: NoteInputFormProps) {
  const { t } = useTranslation();
  const errorId = useId();

  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = body.trim().length > 0;

  const submitNote = () => {
    if (!canSubmit) return;
    onAddNote(body.trim());
    setBody("");
    setError(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitNote();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>,
  ) => {
    if (event.nativeEvent.isComposing || event.key === "Process") return;
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      submitNote();
    }
  };

  return (
    <form
      className={styles.composer}
      onSubmit={handleSubmit}
      aria-label={t.tasks.details.addNote}
    >
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
          placeholder={t.tasks.details.notesPlaceholder}
          aria-label={t.tasks.details.notesPlaceholder}
          aria-invalid={error != null}
          aria-describedby={error ? errorId : undefined}
          enterKeyHint="enter"
          onKeyDown={handleKeyDown}
        />

        <Button
          onClick={submitNote}
          className={styles.sendBtn}
          disabled={!canSubmit}
          ariaLabel={t.tasks.details.sendNote}
        >
          <Button.Icon>
            <FiSend size={16} />
          </Button.Icon>
          <Button.Tooltip position="top">
            {t.tasks.details.sendNoteHint}
          </Button.Tooltip>
        </Button>
      </div>
    </form>
  );
}
