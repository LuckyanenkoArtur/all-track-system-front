import { useMemo, type ReactNode } from "react";
import { Sections } from "@layout/sections/Sections";
import { MultiSelect } from "@input/multi-select/MultiSelect";
import { useTranslation } from "../../../../i18n";
import type { TaskFilters } from "../../domain/others";
import type { MultiSelectOption } from "@input/multi-select/MultiSelect";
import { FiEye, FiGrid, FiUser, FiUserCheck, FiUsers } from "react-icons/fi";
import styles from "../drawers/task-filter-drawer/Drawer.module.scss";

export type PeopleFilterOptions = {
  groups: string[];
  initiators: string[];
  responsible: string[];
  observables: string[];
};

type PeopleFilterKey = "groups" | "initiators" | "responsible" | "observables";

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

  const groupOptions = useMemo(
    () => options.groups.map((group) => ({ value: group, label: group })),
    [options.groups],
  );

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
      { key: "groups", label: t.tasks.groups, options: groupOptions, icon: <FiGrid /> },
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
      groupOptions,
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
      <Sections.Section.Title>{t.tasks.filterSections.people}</Sections.Section.Title>
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
