import { FiFilter } from "react-icons/fi";
import { Button } from "@primitive/button/Button";
import { useTranslation } from "../../../../../i18n";
import type { TaskFilters } from "../../../domain/filters";
import { TaskFilterDrawer } from "../../drawers/task-filter-drawer/Drawer";
import styles from "./TaskFilterOptionsButton.module.scss";

type FilterOptions = {
  categories: string[];
  initiators: string[];
  responsible: string[];
  observables: string[];
};

type TaskFilterOptionsButtonProps = {
  open: boolean;
  activeFilterCount: number;
  filters: TaskFilters;
  draftFilters: TaskFilters;
  filterOptions: FilterOptions;
  onOpen: () => void;
  onClose: () => void;
  onChange: (filters: TaskFilters) => void;
  onApply: () => void;
  onReset: () => void;
  onSaveCollection: (name: string) => void;
};

export function TaskFilterOptionsButton({
  open,
  activeFilterCount,
  filters,
  draftFilters,
  filterOptions,
  onOpen,
  onClose,
  onChange,
  onApply,
  onReset,
  onSaveCollection,
}: TaskFilterOptionsButtonProps) {
  const { t } = useTranslation();

  return (
    <>
      <Button
        className={styles.trigger}
        onClick={() => (open ? onClose() : onOpen())}
        active={open}
        ariaExpanded={open}
      >
        <Button.Icon>
          <FiFilter size={16} />
        </Button.Icon>
        <Button.Text>{t.tasks.filters}</Button.Text>
        <Button.Badge>{activeFilterCount}</Button.Badge>
      </Button>

      <TaskFilterDrawer
        open={open}
        filters={draftFilters}
        appliedFilters={filters}
        options={filterOptions}
        onChange={onChange}
        onClose={onClose}
        onApply={onApply}
        onReset={onReset}
        onSaveCollection={onSaveCollection}
      />
    </>
  );
}
