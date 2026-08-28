import { useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Button } from "@primitive/button/Button";
import { useTranslation } from "../../../../../i18n";
import type { CreateTaskInput } from "../../../domain/others";
import { TaskCreationDrawer } from "../../drawers/task-creation-drawer/Drawer";

type FilterOptions = {
  groups: string[];
  initiators: string[];
  responsible: string[];
  observables: string[];
};

type TaskCreationButtonProps = {
  onSubmit: (input: CreateTaskInput) => void;
  initiatorName: string;
  filterOptions: FilterOptions;
};

export function TaskCreationButton({
  onSubmit,
  initiatorName,
  filterOptions,
}: TaskCreationButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const labels = t.tasks.dashboard;
  const taskLabels = t.tasks;
  const detailLabels = taskLabels.details;

  const groupSelectOptions = useMemo(
    () => filterOptions.groups.map((group) => ({ value: group, label: group })),
    [filterOptions.groups],
  );

  const userSelectOptions = useMemo(() => {
    const users = new Set<string>([
      ...filterOptions.initiators,
      ...filterOptions.responsible,
      ...filterOptions.observables,
      initiatorName,
    ]);
    return [...users].sort().map((user) => ({ value: user, label: user }));
  }, [
    filterOptions.initiators,
    filterOptions.responsible,
    filterOptions.observables,
    initiatorName,
  ]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Button.Icon>
          <FiPlus size={16} />
        </Button.Icon>
        <Button.Text>{labels.createTask}</Button.Text>
        <Button.Tooltip position="bottom">
          {labels.createTaskHint}
        </Button.Tooltip>
      </Button>

      <TaskCreationDrawer
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={onSubmit}
        initiatorName={initiatorName}
        groupOptions={groupSelectOptions}
        userOptions={userSelectOptions}
        labels={{
          title: labels.createTask,
          subtitle: labels.createTaskSubtitle,
          taskTitle: labels.taskTitle,
          taskTitlePlaceholder: labels.taskTitle,
          required: labels.required,
          description: labels.taskDescription,
          descriptionPlaceholder: labels.taskDescriptionPlaceholder,
          steps: labels.stepsToPerform,
          addStep: labels.addStep,
          stepPlaceholder: labels.stepPlaceholder,
          removeStep: labels.removeStep,
          initiator: taskLabels.initiator,
          groups: taskLabels.groups,
          observables: taskLabels.observables,
          startDate: taskLabels.startDate,
          dueDate: taskLabels.dueDate,
          priority: taskLabels.priority,
          priorityPlaceholder: labels.priorityPlaceholder,
          budget: labels.maxBudget,
          budgetPlaceholder: labels.maxBudgetPlaceholder,
          attachments: labels.attachments,
          attachFile: detailLabels.attachFile,
          removeAttachment: detailLabels.removeAttachment,
          fileTooLarge: detailLabels.fileTooLarge,
          maxAttachments: detailLabels.maxAttachments,
          requiresResultReview: labels.requiresResultReview,
          create: labels.create,
          cancel: t.common.cancel,
          searchOptions: taskLabels.searchOptions,
          noOptionsFound: taskLabels.noOptionsFound,
          selectPlaceholder: taskLabels.selectPlaceholder,
          sectionTaskDetails: labels.sections.taskDetails,
          sectionPeople: labels.sections.people,
          sectionSchedule: labels.sections.schedule,
          sectionPriorityBudget: labels.sections.priorityBudget,
          sectionAttachments: labels.sections.attachments,
          high: taskLabels.high,
          medium: taskLabels.medium,
          low: taskLabels.low,
        }}
      />
    </>
  );
}
