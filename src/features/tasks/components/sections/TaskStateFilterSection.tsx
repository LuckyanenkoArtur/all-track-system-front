import { useMemo, type ReactNode } from "react";
import { Sections } from "@layout/sections/Sections";
import { MultiSelect } from "@input/multi-select/MultiSelect";
import { useTranslation } from "../../../../i18n";
import type { TaskFilters, TaskStatus } from "../../domain/others";
import {
  isTaskPriorityId,
  TASK_PRIORITIES,
  type TaskPriorityId,
} from "../../domain/priority";
import type { MultiSelectOption } from "@input/multi-select/MultiSelect";
import { FiActivity, FiAlertTriangle } from "react-icons/fi";
import styles from "../drawers/task-filter-drawer/Drawer.module.scss";

const STATUS_OPTIONS: TaskStatus[] = [
  "open",
  "onHold",
  "inProgress",
  "completed",
  "cancelled",
];

const PRIORITY_OPTIONS: TaskPriorityId[] = ["high", "medium", "low"];

type TaskStateFilterKey = "statuses" | "priorities";

type MultiSelectFieldConfig = {
  key: TaskStateFilterKey;
  label: string;
  options: MultiSelectOption[];
  icon: ReactNode;
};

type TaskStateFilterSectionProps = {
  filters: Pick<TaskFilters, TaskStateFilterKey>;
  onChange: (partial: Partial<Pick<TaskFilters, TaskStateFilterKey>>) => void;
};

export function TaskStateFilterSection({
  filters,
  onChange,
}: TaskStateFilterSectionProps) {
  const { t } = useTranslation();

  const statusOptions = useMemo(
    () =>
      STATUS_OPTIONS.map((value) => ({
        value,
        label: t.tasks[value],
      })),
    [t],
  );

  const priorityOptions = useMemo(
    () =>
      PRIORITY_OPTIONS.map((value) => ({
        value,
        label: t.tasks[value],
      })),
    [t],
  );

  const multiSelectLabels = useMemo(
    () => ({
      placeholder: t.tasks.selectPlaceholder,
      searchPlaceholder: t.tasks.searchOptions,
      noResultsLabel: t.tasks.noOptionsFound,
    }),
    [t],
  );

  const fields = useMemo<MultiSelectFieldConfig[]>(
    () => [
      {
        key: "statuses",
        label: t.tasks.status,
        options: statusOptions,
        icon: <FiActivity />,
      },
      {
        key: "priorities",
        label: t.tasks.priority,
        options: priorityOptions,
        icon: <FiAlertTriangle />,
      },
    ],
    [t, statusOptions, priorityOptions],
  );

  const handleChange = (key: TaskStateFilterKey, selected: string[]) => {
    if (key === "statuses") {
      onChange({ statuses: selected as TaskStatus[] });
      return;
    }

    onChange({
      priorities: selected
        .filter(isTaskPriorityId)
        .map((id) => TASK_PRIORITIES[id]),
    });
  };

  const getSelected = (key: TaskStateFilterKey): string[] => {
    if (key === "statuses") return filters.statuses;
    return filters.priorities.map((priority) => priority.id);
  };

  return (
    <Sections.Section>
      <Sections.Section.Icon>
        <FiActivity size={15} aria-hidden />
      </Sections.Section.Icon>
      <Sections.Section.Title>
        {t.tasks.filterSections.taskState}
      </Sections.Section.Title>
      <Sections.Section.Content>
        <div className={styles.row}>
          {fields.map(({ key, label, options, icon }) => (
            <MultiSelect
              key={key}
              label={label}
              icon={icon}
              options={options}
              selected={getSelected(key)}
              onChange={(selected) => handleChange(key, selected)}
              {...multiSelectLabels}
            />
          ))}
        </div>
      </Sections.Section.Content>
    </Sections.Section>
  );
}
