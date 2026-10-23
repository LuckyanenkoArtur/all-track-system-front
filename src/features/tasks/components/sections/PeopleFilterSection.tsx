import { useMemo, type ReactNode } from "react";
import { Sections } from "@layout/sections/Sections";
import { MultiSelect } from "@input/multi-select/MultiSelect";
import { useTranslation } from "../../../../i18n";
import type { TaskFilters } from "../../domain/others";
import type { MultiSelectOption } from "@input/multi-select/MultiSelect";
import {
  FiFolder,
  FiEye,
  FiGrid,
  FiUser,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import { getProjectSelectOptions } from "../../data/mockProjects";
import styles from "../drawers/task-filter-drawer/Drawer.module.scss";

export type PeopleFilterOptions = {
  categories: string[];
  initiators: string[];
  responsible: string[];
  observables: string[];
};

type PeopleFilterKey =
  | "categories"
  | "projects"
  | "initiators"
  | "responsible"
  | "observables";

type MultiSelectFieldConfig = {
  key: PeopleFilterKey;
  label: string;
  options: MultiSelectOption[];
  icon: ReactNode;
};

type PeopleFilterSectionProps = {
  filters: Pick<TaskFilters, PeopleFilterKey>;
  options: PeopleFilterOptions;
  onChange: (partial: Partial<Pick<TaskFilters, PeopleFilterKey>>) => void;
};

export function PeopleFilterSection({
  filters,
  options,
  onChange,
}: PeopleFilterSectionProps) {
  const { t } = useTranslation();

  const categoryOptions = useMemo(
    () =>
      options.categories.map((category) => ({
        value: category,
        label: category,
      })),
    [options.categories],
  );

  const projectOptions = useMemo(() => getProjectSelectOptions(), []);

  const initiatorOptions = useMemo(
    () =>
      options.initiators.map((initiator) => ({
        value: initiator,
        label: initiator,
      })),
    [options.initiators],
  );

  const responsibleOptions = useMemo(
    () =>
      options.responsible.map((person) => ({ value: person, label: person })),
    [options.responsible],
  );

  const observableOptions = useMemo(
    () =>
      options.observables.map((person) => ({ value: person, label: person })),
    [options.observables],
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
        key: "projects",
        label: t.tasks.project,
        options: projectOptions,
        icon: <FiFolder />,
      },
      {
        key: "categories",
        label: t.tasks.categories,
        options: categoryOptions,
        icon: <FiGrid />,
      },
      {
        key: "initiators",
        label: t.tasks.initiator,
        options: initiatorOptions,
        icon: <FiUser />,
      },
      {
        key: "responsible",
        label: t.tasks.responsible,
        options: responsibleOptions,
        icon: <FiUserCheck />,
      },
      {
        key: "observables",
        label: t.tasks.observables,
        options: observableOptions,
        icon: <FiEye />,
      },
    ],
    [
      t,
      projectOptions,
      categoryOptions,
      initiatorOptions,
      responsibleOptions,
      observableOptions,
    ],
  );

  return (
    <Sections.Section>
      <Sections.Section.Icon>
        <FiUsers size={15} aria-hidden />
      </Sections.Section.Icon>
      <Sections.Section.Title>
        {t.tasks.filterSections.people}
      </Sections.Section.Title>
      <Sections.Section.Content>
        <div className={styles.row}>
          {fields.map(({ key, label, options: fieldOptions, icon }) => (
            <MultiSelect
              key={key}
              label={label}
              icon={icon}
              options={fieldOptions}
              selected={filters[key]}
              onChange={(selected) => onChange({ [key]: selected })}
              {...multiSelectLabels}
            />
          ))}
        </div>
      </Sections.Section.Content>
    </Sections.Section>
  );
}
