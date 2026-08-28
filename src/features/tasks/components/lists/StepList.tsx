import type { CheckListStep } from "@list/step-check-list/step";
import ProgressBar from "@primitive/progress-bar/ProgressBar.tsx";
import StepCheckList from "@list/step-check-list/StepCheckList.tsx";
import { useTranslation } from "../../../../i18n/index.ts";
import styles from "./StepList.module.scss";

type StepListProps = {
  steps: CheckListStep[];
  onToggleStep?: (stepId: string) => void;
  readOnly?: boolean;
};

export function StepList({
  steps,
  onToggleStep,
  readOnly = false,
}: StepListProps) {
  const { t } = useTranslation();
  const labels = t.tasks.details.tabs;

  const completed = steps.filter((step) => step.completed).length;
  const total = steps.length;

  if (steps.length === 0) {
    return <p className={styles.empty}>{labels.stepsEmpty}</p>;
  }

  return (
    <div className={styles.root}>
      <ProgressBar completed={completed} total={total}>
        <ProgressBar.Header text={labels.stepsProgress} />
        <ProgressBar.Body />
      </ProgressBar>

      <StepCheckList onToggleStep={onToggleStep}>
        {steps.map((step, index) => (
          <StepCheckList.Item key={step.id} step={step} index={index} />
        ))}
      </StepCheckList>

      {readOnly && (
        <p className={styles.readOnlyHint}>{labels.stepsReadOnlyResponsible}</p>
      )}
    </div>
  );
}
