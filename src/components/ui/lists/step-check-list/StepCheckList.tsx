import {
  createContext,
  useContext,
  type FC,
  type PropsWithChildren,
} from "react";

import { FiCheck, FiTrash2 } from "react-icons/fi";
import type { CheckListStep } from "./step.d.ts";
import { useTranslation } from "../../../../i18n/index.ts";
import "./StepCheckList.scss";

type StepCheckListContextValue = {
  onToggleStep?: (stepId: string) => void;
  editable: boolean;
  onChangeStep?: (stepId: string, text: string) => void;
  onRemoveStep?: (stepId: string) => void;
  stepPlaceholder?: string;
  removeStepLabel?: string;
  stepCompleted: string;
  stepPending: string;
};

const StepCheckListContext = createContext<StepCheckListContextValue | null>(
  null,
);

type StepCheckListProps = PropsWithChildren<{
  onToggleStep?: (stepId: string) => void;
  editable?: boolean;
  onChangeStep?: (stepId: string, text: string) => void;
  onRemoveStep?: (stepId: string) => void;
  stepPlaceholder?: string;
  removeStepLabel?: string;
}>;

type StepCheckListItemProps = {
  step: CheckListStep;
  index: number;
  autoFocus?: boolean;
};

interface StepCheckListComponent extends FC<StepCheckListProps> {
  Item: FC<StepCheckListItemProps>;
}

const StepCheckList: StepCheckListComponent = ({
  children,
  onToggleStep,
  editable = false,
  onChangeStep,
  onRemoveStep,
  stepPlaceholder,
  removeStepLabel,
}) => {
  const { t } = useTranslation();

  const value: StepCheckListContextValue = {
    onToggleStep,
    editable,
    onChangeStep,
    onRemoveStep,
    stepPlaceholder,
    removeStepLabel,
    stepCompleted: t.tasks.details.tabs.stepCompleted,
    stepPending: t.tasks.details.tabs.stepPending,
  };

  return (
    <StepCheckListContext.Provider value={value}>
      <ul className={`check-list${editable ? " check-list--editable" : ""}`}>
        {children}
      </ul>
    </StepCheckListContext.Provider>
  );
};

StepCheckList.Item = ({ step, index, autoFocus = false }) => {
  const context = useContext(StepCheckListContext);

  if (!context) {
    throw new Error("StepCheckList.Item must be used inside StepCheckList.");
  }

  const {
    onToggleStep,
    editable,
    onChangeStep,
    onRemoveStep,
    stepPlaceholder,
    removeStepLabel,
    stepCompleted,
    stepPending,
  } = context;

  const checkClass = `check-list__check-btn ${
    step.completed ? "check-list__check-btn--checked" : ""
  }`;

  return (
    <li
      className={`check-list__item ${
        step.completed ? "check-list__item--completed" : ""
      }`}
    >
      <span className="check-list__index">{index + 1}</span>

      {onToggleStep ? (
        <button
          type="button"
          className={checkClass}
          onClick={() => onToggleStep(step.id)}
          aria-label={step.completed ? stepCompleted : stepPending}
          aria-pressed={step.completed}
        >
          {step.completed && <FiCheck size={16} aria-hidden />}
        </button>
      ) : (
        <span className={checkClass} aria-hidden>
          {step.completed && <FiCheck size={16} />}
        </span>
      )}

      {editable ? (
        <input
          type="text"
          className="check-list__input"
          value={step.text}
          onChange={(event) => onChangeStep?.(step.id, event.target.value)}
          placeholder={stepPlaceholder}
          aria-label={`${stepPlaceholder ?? "Step"} ${index + 1}`}
          autoFocus={autoFocus}
        />
      ) : (
        <span className="check-list__text">{step.text}</span>
      )}

      {editable && onRemoveStep ? (
        <button
          type="button"
          className="check-list__remove-btn"
          onClick={() => onRemoveStep(step.id)}
          aria-label={removeStepLabel}
        >
          <FiTrash2 size={14} aria-hidden />
        </button>
      ) : null}
    </li>
  );
};

export default StepCheckList;
