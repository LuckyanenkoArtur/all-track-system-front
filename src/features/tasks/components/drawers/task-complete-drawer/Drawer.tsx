import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import styles from "./Drawer.module.scss";
import { Form } from "@overlay/form/Form";
import formStyles from "@overlay/form/Form.module.scss";
import { Drawer } from "@overlay/drawer/Drawer";
import Badge from "@primitive/badge/Badge";
import Title from "@primitive/title/Title";
import type { CompletionReportStep } from "../../../domain/step";
import type { TaskStep } from "../../../domain/others";
import { TaskStepsEditor } from "../../task-steps-editor/TaskStepsEditor";

export type CompleteTaskDrawerLabels = {
  title: string;
  subtitle: string;
  description: string;
  descriptionPlaceholder: string;
  required: string;
  steps: string;
  addStep: string;
  stepPlaceholder: string;
  removeStep: string;
  apply: string;
  cancel: string;
};

type CompleteTaskDrawerProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    description: string;
    steps: CompletionReportStep[];
  }) => void;
  labels: CompleteTaskDrawerLabels;
};

function createEmptySteps(): CompletionReportStep[] {
  return [];
}

function toEditorSteps(steps: CompletionReportStep[]) {
  return steps.map((step) => ({ ...step, completed: false }));
}

function fromEditorSteps(steps: TaskStep[]): CompletionReportStep[] {
  return steps.map(({ id, text }) => ({ id, text }));
}

function isDirty(description: string, steps: CompletionReportStep[]): boolean {
  return (
    description.trim().length > 0 ||
    steps.some((step) => step.text.trim().length > 0)
  );
}

export function CompleteTaskDrawer({
  open,
  onClose,
  onSubmit,
  labels,
}: CompleteTaskDrawerProps) {
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<CompletionReportStep[]>(createEmptySteps);

  useEffect(() => {
    if (open) {
      setDescription("");
      setSteps(createEmptySteps());
    }
  }, [open]);

  const canSubmit = description.trim().length > 0;

  const handleClose = useCallback(() => {
    setDescription("");
    setSteps(createEmptySteps());
    onClose();
  }, [onClose]);

  const getIsDirty = useCallback(
    () => isDirty(description, steps),
    [description, steps],
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    onSubmit({
      description: description.trim(),
      steps: steps
        .map((step) => ({ ...step, text: step.text.trim() }))
        .filter((step) => step.text.length > 0),
    });
    handleClose();
  };

  return (
    <Drawer open={open} unSaveConfirmation={getIsDirty()}>
      <Drawer.Header>
        <Drawer.Title>{labels.title}</Drawer.Title>
        <Drawer.Desciption>{labels.subtitle}</Drawer.Desciption>
      </Drawer.Header>

      <Drawer.Content>
        <Form
          isDirty={getIsDirty}
          unsavedConfirmation="completeTask"
          onClose={handleClose}
          resetKey={open}
        >
          <Form.DrawerDismiss>
            <div className={formStyles.wrapper}>
              <Form.Body id="complete-task-form" contentGap="compact">
                <label className={formStyles.field}>
                  <span className={formStyles.fieldLabel}>
                    {labels.description}
                    <Badge variant="info" compact>
                      <Badge.Label>{labels.required}</Badge.Label>
                    </Badge>
                  </span>
                  <textarea
                    className={styles.textarea}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder={labels.descriptionPlaceholder}
                    rows={4}
                    required
                  />
                </label>

                <section
                  className={formStyles.section}
                  aria-label={labels.steps}
                >
                  <Title
                    text={labels.steps}
                    as="h3"
                    underline
                    className={formStyles.sectionTitle}
                  />
                  <TaskStepsEditor
                    steps={toEditorSteps(steps)}
                    onChange={(next) => setSteps(fromEditorSteps(next))}
                    labels={{
                      addStep: labels.addStep,
                      stepPlaceholder: labels.stepPlaceholder,
                      removeStep: labels.removeStep,
                    }}
                  />
                </section>
              </Form.Body>

              <Form.Footer>
                <Form.Button
                  type="submit"
                  disabled={!canSubmit}
                  onSubmit={handleSubmit}
                >
                  {labels.apply}
                </Form.Button>
                <Form.Button type="button" cancel>
                  {labels.cancel}
                </Form.Button>
              </Form.Footer>
            </div>
          </Form.DrawerDismiss>
        </Form>
      </Drawer.Content>
    </Drawer>
  );
};
