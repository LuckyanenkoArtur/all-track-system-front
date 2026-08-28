import { Form } from "@overlay/form/Form";
import { Drawer } from "@overlay/drawer/Drawer";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  FiAlertTriangle,
  FiCalendar,
  FiEye,
  FiFileText,
  FiGrid,
  FiPaperclip,
  FiType,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { FaMoneyBill } from "react-icons/fa6";
import type {
  CreateTaskInput,
  Task,
  TaskPriority,
  TaskStep,
} from "../../../domain/others";
import { TASK_PRIORITIES, isTaskPriorityId } from "../../../domain/priority";
import { Attachments } from "@primitive/attachments/Attachments";
import { Button } from "@primitive/button/Button";
import { DatePicker } from "@input/date-picker/DatePicker";
import {
  MultiSelect,
  type MultiSelectOption,
} from "@input/multi-select/MultiSelect";
import { NumberInput } from "@input/number-input/NumberInput";
import { Sections } from "@layout/sections/Sections";
import { Textarea } from "@input/textarea/Textarea";
import { TextInput } from "@input/text-input/TextInput";
import inputStyles from "@input/number-input/NumberInput.module.scss";
import { toDateTimeLocalValue } from "../../../utils/dateUtils";
import {
  createPendingAttachment,
  MAX_COMMENT_ATTACHMENTS,
  MAX_COMMENT_FILE_SIZE,
  readFileAsDataUrl,
  type PendingAttachment,
} from "../../../utils/commentUtils";
import { TaskStepsEditor } from "../../task-steps-editor/TaskStepsEditor";
import styles from "./Drawer.module.scss";

type FormState = {
  title: string;
  description: string;
  steps: TaskStep[];
  groups: string[];
  observables: string[];
  startDate: string;
  dueDate: string;
  priority: TaskPriority;
  budget: string;
  attachments: PendingAttachment[];
  requiresResultReview: boolean;
};

type CreateTaskDialogLabels = {
  title: string;
  subtitle: string;
  taskTitle: string;
  taskTitlePlaceholder: string;
  required: string;
  description: string;
  descriptionPlaceholder: string;
  steps: string;
  addStep: string;
  stepPlaceholder: string;
  removeStep: string;
  initiator: string;
  groups: string;
  observables: string;
  startDate: string;
  dueDate: string;
  priority: string;
  priorityPlaceholder: string;
  budget: string;
  budgetPlaceholder: string;
  attachments: string;
  attachFile: string;
  removeAttachment: string;
  fileTooLarge: string;
  maxAttachments: string;
  requiresResultReview: string;
  create: string;
  save?: string;
  cancel: string;
  searchOptions: string;
  noOptionsFound: string;
  selectPlaceholder: string;
  sectionTaskDetails: string;
  sectionPeople: string;
  sectionSchedule: string;
  sectionPriorityBudget: string;
  sectionAttachments: string;
  high: string;
  medium: string;
  low: string;
};

type TaskCreationDrawerProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateTaskInput) => void;
  task?: Task | null;
  initiatorName: string;
  groupOptions: MultiSelectOption[];
  userOptions: MultiSelectOption[];
  labels: CreateTaskDialogLabels;
};

function toBudgetInputValue(budget: string): string {
  const numeric = budget.replace(/[$,]/g, "");
  if (!numeric || !Number.isFinite(Number(numeric))) return "";
  return Number(numeric).toFixed(2);
}

function createEmptyForm(): FormState {
  return {
    title: "",
    description: "",
    steps: [],
    groups: [],
    observables: [],
    startDate: "",
    dueDate: "",
    priority: TASK_PRIORITIES.medium,
    budget: "",
    attachments: [],
    requiresResultReview: false,
  };
}

function taskToForm(task: Task): FormState {
  return {
    title: task.title,
    description: task.description ?? "",
    steps: task.steps ?? [],
    groups: task.groups,
    observables: task.observables,
    startDate: toDateTimeLocalValue(new Date(task.startDate)),
    dueDate: toDateTimeLocalValue(new Date(task.dueDate)),
    priority: task.priority,
    budget: toBudgetInputValue(task.budget),
    attachments: (task.attachments ?? []).map((attachment) => ({
      id: attachment.id,
      name: attachment.name,
      size: attachment.size,
      mimeType: attachment.mimeType,
      dataUrl: attachment.dataUrl,
    })),
    requiresResultReview: task.requiresResultReview ?? false,
  };
}

function isFormDirty(form: FormState, baseline: FormState): boolean {
  return (
    form.title.trim() !== baseline.title.trim() ||
    form.description.trim() !== baseline.description.trim() ||
    form.startDate !== baseline.startDate ||
    form.dueDate !== baseline.dueDate ||
    form.priority.id !== baseline.priority.id ||
    form.budget.trim() !== baseline.budget.trim() ||
    form.requiresResultReview !== baseline.requiresResultReview ||
    form.groups.join("|") !== baseline.groups.join("|") ||
    form.observables.join("|") !== baseline.observables.join("|") ||
    form.steps.length !== baseline.steps.length ||
    form.steps.some(
      (step, index) =>
        step.text !== baseline.steps[index]?.text ||
        step.completed !== baseline.steps[index]?.completed,
    ) ||
    form.attachments.length !== baseline.attachments.length ||
    form.attachments.some(
      (attachment, index) =>
        attachment.name !== baseline.attachments[index]?.name,
    )
  );
}

function TaskCreationDrawerContent({
  open,
  onClose,
  onSubmit,
  task = null,
  initiatorName,
  groupOptions,
  userOptions,
  labels,
}: TaskCreationDrawerProps) {
  const isEditMode = task != null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(() =>
    task ? taskToForm(task) : createEmptyForm(),
  );
  const [baseline] = useState<FormState>(() =>
    task ? taskToForm(task) : createEmptyForm(),
  );
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const canSubmit = form.title.trim().length > 0 && form.dueDate.length > 0;
  const initiatorValue = isEditMode ? task!.initiator : initiatorName;

  const priorityOptions = useMemo(
    () => [
      { value: "high", label: labels.high },
      { value: "medium", label: labels.medium },
      { value: "low", label: labels.low },
    ],
    [labels.high, labels.medium, labels.low],
  );

  const multiSelectLabels = useMemo(
    () => ({
      placeholder: labels.selectPlaceholder,
      searchPlaceholder: labels.searchOptions,
      noResultsLabel: labels.noOptionsFound,
    }),
    [labels.selectPlaceholder, labels.searchOptions, labels.noOptionsFound],
  );

  const getIsDirty = useCallback(
    () => isFormDirty(form, baseline),
    [form, baseline],
  );

  const handleClose = useCallback(() => {
    setForm(createEmptyForm());
    onClose();
  }, [onClose]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    const filteredSteps = form.steps
      .map((step) => ({ ...step, text: step.text.trim() }))
      .filter((step) => step.text.length > 0);

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      steps: filteredSteps,
      priority: form.priority,
      groups: form.groups.length > 0 ? form.groups : ["General"],
      observables: form.observables,
      startDate: form.startDate || undefined,
      dueDate: form.dueDate,
      initiator: initiatorValue,
      responsible: isEditMode ? task!.responsible : ["Unassigned"],
      budget: form.budget.trim() ? `$${form.budget.replace(/^\$/, "")}` : "$0",
      attachments: form.attachments.map(
        ({ id, name, size, mimeType, dataUrl }) => ({
          id: id.startsWith("ATT-") ? id : undefined,
          name,
          size,
          mimeType,
          dataUrl,
        }),
      ),
      requiresResultReview: form.requiresResultReview,
    });

    handleClose();
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) return;

    setAttachmentError(null);

    if (form.attachments.length + files.length > MAX_COMMENT_ATTACHMENTS) {
      setAttachmentError(labels.maxAttachments);
      return;
    }

    try {
      const nextAttachments: PendingAttachment[] = [];

      for (const file of files) {
        if (file.size > MAX_COMMENT_FILE_SIZE) {
          setAttachmentError(labels.fileTooLarge);
          continue;
        }

        const dataUrl = await readFileAsDataUrl(file);
        nextAttachments.push(createPendingAttachment(file, dataUrl));
      }

      if (nextAttachments.length > 0) {
        setForm((current) => ({
          ...current,
          attachments: [...current.attachments, ...nextAttachments].slice(
            0,
            MAX_COMMENT_ATTACHMENTS,
          ),
        }));
      }
    } catch {
      setAttachmentError(labels.fileTooLarge);
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setForm((current) => ({
      ...current,
      attachments: current.attachments.filter(
        (item) => item.id !== attachmentId,
      ),
    }));
    setAttachmentError(null);
  };

  return (
    <>
      <Drawer.Header>
        <Drawer.Title>{labels.title}</Drawer.Title>
        <Drawer.Desciption>{labels.subtitle}</Drawer.Desciption>
      </Drawer.Header>
      <Drawer.Content>
        <Form
          isDirty={getIsDirty}
          unsavedConfirmation="taskCreation"
          onClose={handleClose}
          resetKey={open}
        >
          <Form.DrawerDismiss>
            <Form.Body id="create-task-form">
              <Sections>
                <Sections.Section>
                  <Sections.Section.Icon>
                    <FiFileText size={15} aria-hidden />
                  </Sections.Section.Icon>
                  <Sections.Section.Title>
                    {labels.sectionTaskDetails}
                  </Sections.Section.Title>
                  <Sections.Section.Content>
                    <div className={styles.stack}>
                      <TextInput
                        label={labels.taskTitle}
                        requiredLabel={labels.required}
                        icon={<FiType />}
                        value={form.title}
                        onChange={(title) => setForm({ ...form, title })}
                        placeholder={labels.taskTitlePlaceholder}
                        required
                        autoFocus
                      />

                      <div className={inputStyles.field}>
                        <span className={inputStyles.label}>
                          {labels.description}
                        </span>
                        <Textarea
                          value={form.description}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              description: event.target.value,
                            })
                          }
                          placeholder={labels.descriptionPlaceholder}
                          rows={4}
                        />
                      </div>

                      <div className={inputStyles.field}>
                        <span className={inputStyles.label}>
                          {labels.steps}
                        </span>
                        <TaskStepsEditor
                          steps={form.steps}
                          onChange={(steps) => setForm({ ...form, steps })}
                          labels={{
                            addStep: labels.addStep,
                            stepPlaceholder: labels.stepPlaceholder,
                            removeStep: labels.removeStep,
                          }}
                        />
                      </div>
                    </div>
                  </Sections.Section.Content>
                </Sections.Section>

                <Sections.Section>
                  <Sections.Section.Icon>
                    <FiUsers size={15} aria-hidden />
                  </Sections.Section.Icon>
                  <Sections.Section.Title>
                    {labels.sectionPeople}
                  </Sections.Section.Title>
                  <Sections.Section.Content>
                    <div className={styles.stack}>
                      <TextInput
                        label={labels.initiator}
                        icon={<FiUser />}
                        value={initiatorValue}
                        onChange={() => undefined}
                        readOnly
                      />
                      <div className={styles.row}>
                        <MultiSelect
                          label={labels.groups}
                          icon={<FiGrid />}
                          options={groupOptions}
                          selected={form.groups}
                          onChange={(groups) => setForm({ ...form, groups })}
                          {...multiSelectLabels}
                        />
                        <MultiSelect
                          label={labels.observables}
                          icon={<FiEye />}
                          options={userOptions}
                          selected={form.observables}
                          onChange={(observables) =>
                            setForm({ ...form, observables })
                          }
                          {...multiSelectLabels}
                        />
                      </div>
                    </div>
                  </Sections.Section.Content>
                </Sections.Section>

                <Sections.Section>
                  <Sections.Section.Icon>
                    <FiCalendar size={15} aria-hidden />
                  </Sections.Section.Icon>
                  <Sections.Section.Title>
                    {labels.sectionSchedule}
                  </Sections.Section.Title>
                  <Sections.Section.Content>
                    <div className={styles.row}>
                      <DatePicker
                        label={labels.startDate}
                        icon={<FiCalendar />}
                        includeTime
                        value={form.startDate}
                        onChange={(startDate) =>
                          setForm({ ...form, startDate })
                        }
                      />
                      <DatePicker
                        label={labels.dueDate}
                        icon={<FiCalendar />}
                        includeTime
                        required
                        requiredLabel={labels.required}
                        value={form.dueDate}
                        onChange={(dueDate) => setForm({ ...form, dueDate })}
                      />
                    </div>
                  </Sections.Section.Content>
                </Sections.Section>

                <Sections.Section>
                  <Sections.Section.Icon>
                    <FiAlertTriangle size={15} aria-hidden />
                  </Sections.Section.Icon>
                  <Sections.Section.Title>
                    {labels.sectionPriorityBudget}
                  </Sections.Section.Title>
                  <Sections.Section.Content>
                    <div className={styles.row}>
                      <MultiSelect
                        label={labels.priority}
                        icon={<FiAlertTriangle />}
                        options={priorityOptions}
                        selected={[form.priority.id]}
                        onChange={(selected) => {
                          const nextId = selected[0];
                          if (!nextId || !isTaskPriorityId(nextId)) return;
                          setForm({
                            ...form,
                            priority: TASK_PRIORITIES[nextId],
                          });
                        }}
                        placeholder={labels.priorityPlaceholder}
                        searchPlaceholder={labels.searchOptions}
                        noResultsLabel={labels.noOptionsFound}
                        multiple={false}
                      />
                      <NumberInput
                        label={labels.budget}
                        icon={<FaMoneyBill />}
                        currency="$"
                        grouping
                        fractionDigits={2}
                        value={form.budget}
                        onChange={(budget) => setForm({ ...form, budget })}
                        placeholder={0}
                      />
                    </div>
                  </Sections.Section.Content>
                </Sections.Section>

                <Sections.Section>
                  <Sections.Section.Icon>
                    <FiPaperclip size={15} aria-hidden />
                  </Sections.Section.Icon>
                  <Sections.Section.Title>
                    {labels.sectionAttachments}
                  </Sections.Section.Title>
                  <Sections.Section.Content>
                    <div className={styles.stack}>
                      <div className={inputStyles.field}>
                        <span className={inputStyles.label}>
                          {labels.attachments}
                        </span>
                        <Attachments
                          items={form.attachments}
                          onRemove={removeAttachment}
                          removeLabel={labels.removeAttachment}
                        />
                        <Button
                          onClick={handleAttachClick}
                          className={styles.attachBtn}
                          ariaLabel={labels.attachFile}
                        >
                          <Button.Icon>
                            <FiPaperclip size={14} />
                          </Button.Icon>
                          <Button.Text>{labels.attachFile}</Button.Text>
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          className={styles.hiddenFileInput}
                          onChange={handleFileChange}
                        />
                        {attachmentError ? (
                          <p className={styles.attachError} role="alert">
                            {attachmentError}
                          </p>
                        ) : null}
                      </div>

                      <label className={styles.checkboxField}>
                        <input
                          type="checkbox"
                          checked={form.requiresResultReview}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              requiresResultReview: event.target.checked,
                            })
                          }
                        />
                        <span>{labels.requiresResultReview}</span>
                      </label>
                    </div>
                  </Sections.Section.Content>
                </Sections.Section>
              </Sections>
            </Form.Body>

            <Form.Footer>
              <Form.Button
                type="submit"
                disabled={!canSubmit}
                onSubmit={handleSubmit}
              >
                {isEditMode ? (labels.save ?? labels.create) : labels.create}
              </Form.Button>
              <Form.Button type="button" cancel>
                {labels.cancel}
              </Form.Button>
            </Form.Footer>
          </Form.DrawerDismiss>
        </Form>
      </Drawer.Content>
    </>
  );
}

export function TaskCreationDrawer(props: TaskCreationDrawerProps) {
  return (
    <Drawer open={props.open} unSaveConfirmation>
      <TaskCreationDrawerContent {...props} />
    </Drawer>
  );
}
