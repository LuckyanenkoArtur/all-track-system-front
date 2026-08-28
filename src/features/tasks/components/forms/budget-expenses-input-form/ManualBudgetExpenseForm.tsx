import { useCallback, useState, type FormEvent } from "react";
import { FiPlus } from "react-icons/fi";
import { Form } from "@overlay/form/Form.tsx";
import { NumberInput } from "@input/number-input/NumberInput";
import { Textarea } from "@input/textarea/Textarea";
import { useTranslation } from "../../../../../i18n/index.ts";
import styles from "./ManualBudgetExpenseForm.module.scss";

export type ManualBudgetExpenseSubmitInput = {
  amount: number;
  description: string;
};

type ManualBudgetExpenseFormProps = {
  onSubmitBudgetExpense: (input: ManualBudgetExpenseSubmitInput) => void;
};

export function ManualBudgetExpenseForm({
  onSubmitBudgetExpense,
}: ManualBudgetExpenseFormProps) {
  const { t } = useTranslation();
  const labels = t.tasks.details;

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const parsedAmount = Number(amount.replace(/,/g, "")) || 0;
  const canSubmit = parsedAmount > 0 && description.trim().length > 0;
  const isDirty =
    amount.trim().length > 0 || description.trim().length > 0;

  const resetForm = useCallback(() => {
    setAmount("");
    setDescription("");
  }, []);

  const getIsDirty = useCallback(() => isDirty, [isDirty]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    onSubmitBudgetExpense({
      amount: parsedAmount,
      description: description.trim(),
    });
    resetForm();
  };

  return (
    <div className={styles.composer}>
      <Form isDirty={getIsDirty} onClose={resetForm}>
        <Form.Body id="manual-budget-expense-form" className={styles.addZone}>
          <div className={styles.addTop}>
            <div className={styles.addHeading}>
              <strong>{labels.budgetExpenseDialogTitle}</strong>
              <span>{labels.budgetExpenseDialogSubtitle}</span>
            </div>
          </div>

          <div className={styles.addRow}>
            <NumberInput
              className={styles.amountField}
              label={labels.budgetExpenseAmount}
              value={amount}
              onChange={setAmount}
              min={0}
              fractionDigits={2}
              currency="$"
              grouping
              placeholder={0}
            />

            <Textarea
              className={styles.noteInput}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={labels.budgetExpenseDescriptionPlaceholder}
              rows={1}
              required
              aria-label={labels.budgetExpenseDescription}
            />

            <Form.Button
              type="submit"
              className={styles.submitBtn}
              disabled={!canSubmit}
              onSubmit={handleSubmit}
              aria-label={labels.budgetExpenseApply}
            >
              <FiPlus size={16} aria-hidden />
              <span>{labels.budgetExpenseApply}</span>
            </Form.Button>
          </div>
        </Form.Body>
      </Form>
    </div>
  );
}
