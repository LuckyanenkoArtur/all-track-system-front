import { useState } from "react";
import { FiPlus } from "react-icons/fi";

import { Button } from "@primitive/button/Button";
import StepCheckList from "@list/step-check-list/StepCheckList";
import type { TaskStep } from "../../domain/others";
import styles from "./TaskStepsEditor.module.scss";

type TaskStepsEditorLabels = {
  addStep: string;
  stepPlaceholder: string;
  removeStep: string;
};

type TaskStepsEditorProps = {
  steps: TaskStep[];
  onChange: (steps: TaskStep[]) => void;
  labels: TaskStepsEditorLabels;
};

function createStep(text = ""): TaskStep {
  return {
    id: `step-${crypto.randomUUID().slice(0, 8)}`,
    text,
    completed: false,
  };
}

export function TaskStepsEditor({
  steps,
  onChange,
  labels,
}: TaskStepsEditorProps) {
  const [focusStepId, setFocusStepId] = useState<string | null>(null);

  const addStep = () => {
    const step = createStep();
    onChange([...steps, step]);
    setFocusStepId(step.id);
  };

  const updateStep = (id: string, text: string) => {
    onChange(steps.map((step) => (step.id === id ? { ...step, text } : step)));
  };

  const removeStep = (id: string) => {
    onChange(steps.filter((step) => step.id !== id));
  };

  return (
    <div className={styles.root}>
      {steps.length > 0 ? (
        <StepCheckList
          editable
          onChangeStep={updateStep}
          onRemoveStep={removeStep}
          stepPlaceholder={labels.stepPlaceholder}
          removeStepLabel={labels.removeStep}
        >
          {steps.map((step, index) => (
            <StepCheckList.Item
              key={step.id}
              step={{ ...step, completed: Boolean(step.completed) }}
              index={index}
              autoFocus={step.id === focusStepId}
            />
          ))}
        </StepCheckList>
      ) : null}

      <Button onClick={addStep} className={styles.addBtn}>
        <Button.Icon>
          <FiPlus size={14} />
        </Button.Icon>
        <Button.Text>{labels.addStep}</Button.Text>
      </Button>
    </div>
  );
}
