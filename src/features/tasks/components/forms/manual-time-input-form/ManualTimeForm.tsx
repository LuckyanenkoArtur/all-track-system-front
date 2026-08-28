import { useCallback, useState, type FormEvent } from "react";
import { FiPlus } from "react-icons/fi";
import { Form } from "@overlay/form/Form.tsx";
import { NumberInput } from "@input/number-input/NumberInput";
import { Textarea } from "@input/textarea/Textarea";
import { useTranslation } from "../../../../../i18n/index.ts";
import styles from "./ManualTimeForm.module.scss";

export type ManualTimeSubmitInput = {
  hours: number;
  minutes: number;
  note: string;
};

type ManualTimeFormProps = {
  onSubmitManualTime: (input: ManualTimeSubmitInput) => void;
};

export function ManualTimeForm({ onSubmitManualTime }: ManualTimeFormProps) {
  const { t } = useTranslation();
  const labels = t.tasks.details;

  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [note, setNote] = useState("");

  const parsedHours = Number(hours) || 0;
  const parsedMinutes = Number(minutes) || 0;
  const totalMinutes =
    parsedHours * 60 + Math.min(59, Math.max(0, parsedMinutes));
  const canSubmit = totalMinutes > 0 && note.trim().length > 0;
  const isDirty =
    hours.trim().length > 0 ||
    minutes.trim().length > 0 ||
    note.trim().length > 0;

  const resetForm = useCallback(() => {
    setHours("");
    setMinutes("");
    setNote("");
  }, []);

  const getIsDirty = useCallback(() => isDirty, [isDirty]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    onSubmitManualTime({
      hours: Math.max(0, parsedHours),
      minutes: Math.min(59, Math.max(0, parsedMinutes)),
      note: note.trim(),
    });
    resetForm();
  };

  return (
    <div className={styles.composer}>
      <Form isDirty={getIsDirty} onClose={resetForm}>
        <Form.Body id="manual-time-form" className={styles.addZone}>
          <div className={styles.addTop}>
            <div className={styles.addHeading}>
              <strong>{labels.manualTimeDialogTitle}</strong>
              <span>{labels.manualTimeDialogSubtitle}</span>
            </div>
          </div>

          <div className={styles.addRow}>
            <div className={styles.durationGroup}>
              <NumberInput
                className={styles.durationField}
                label={labels.manualTimeHours}
                value={hours}
                onChange={setHours}
                min={0}
                max={999}
                placeholder={0}
              />

              <span className={styles.durationSep} aria-hidden>
                :
              </span>

              <NumberInput
                className={styles.durationField}
                label={labels.manualTimeMinutes}
                value={minutes}
                onChange={setMinutes}
                min={0}
                max={59}
                placeholder={0}
              />
            </div>

            <Textarea
              className={styles.noteInput}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={labels.manualTimeNotePlaceholder}
              rows={1}
              required
              aria-label={labels.manualTimeNote}
            />

            <Form.Button
              type="submit"
              className={styles.submitBtn}
              disabled={!canSubmit}
              onSubmit={handleSubmit}
              aria-label={labels.manualTimeApply}
            >
              <FiPlus size={16} aria-hidden />
              <span>{labels.manualTimeApply}</span>
            </Form.Button>
          </div>
        </Form.Body>
      </Form>
    </div>
  );
}
