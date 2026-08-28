import { useCallback, useMemo, useState } from "react";
import { Form } from "@overlay/form/Form";
import { Sections } from "@layout/sections/Sections";
import { Drawer } from "@overlay/drawer/Drawer";
import { useTranslation } from "../../../../../i18n";
import Dialog from "../../../../user-profile/components/dialogs/Dialog";
import type { TaskFilters } from "../../../domain/others";
import { areDrawerFiltersEqual } from "../../../utils/taskListUtils";
import { BudgetFilterSection } from "../../sections/BudgetFilterSection";
import { DueDateFilterSection } from "../../sections/DueDateFilterSection";
import type { PeopleFilterOptions } from "../../sections/PeopleFilterSection";
import { PeopleFilterSection } from "../../sections/PeopleFilterSection";
import { TaskStateFilterSection } from "../../sections/TaskStateFilterSection";
import { TimeFilterSection } from "../../sections/TimeFilterSection";
import styles from "./Drawer.module.scss";

type TaskFilterDrawerProps = {
  open: boolean;
  filters: TaskFilters;
  appliedFilters: TaskFilters;
  options: PeopleFilterOptions;
  onChange: (filters: TaskFilters) => void;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  onSaveCollection: (name: string) => void;
};

export function TaskFilterDrawer({
  open,
  filters,
  appliedFilters,
  options,
  onChange,
  onClose,
  onApply,
  onReset,
  onSaveCollection,
}: TaskFilterDrawerProps) {
  const { t } = useTranslation();
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");

  const dirty = !areDrawerFiltersEqual(filters, appliedFilters);

  const getIsDirty = useCallback(() => dirty, [dirty]);

  const update = (partial: Partial<TaskFilters>) => {
    onChange({ ...filters, ...partial });
  };

  const canApply = !areDrawerFiltersEqual(filters, appliedFilters);

  const footerButtons = useMemo(
    () => [
      {
        key: "apply",
        label: t.tasks.applyFilters,
        onClick: onApply,
        disabled: !canApply,
      },
      {
        key: "saveCollection",
        label: t.tasks.saveCollection,
        onClick: () => setCollectionDialogOpen(true),
      },
      {
        key: "reset",
        label: t.tasks.resetFilters,
        onClick: onReset,
      },
    ],
    [t, canApply, onApply, onReset],
  );

  const handleSaveCollection = () => {
    const trimmed = collectionName.trim();
    if (!trimmed) return;
    onSaveCollection(trimmed);
    setCollectionName("");
    setCollectionDialogOpen(false);
  };

  return (
    <Drawer open={open} unSaveConfirmation={dirty}>
      <Drawer.Header>
        <Drawer.Title>{t.tasks.filters}</Drawer.Title>
      </Drawer.Header>
      <Drawer.Content>
        <Form
          isDirty={getIsDirty}
          unsavedConfirmation="dashboard"
          onClose={onClose}
          resetKey={open}
        >
          <Form.DrawerDismiss
            beforeDismiss={() => (collectionDialogOpen ? false : undefined)}
          >
            <Form.Body as="div">
              <Sections>
                <PeopleFilterSection
                  filters={filters}
                  options={options}
                  onChange={update}
                />
                <TaskStateFilterSection
                  filters={filters}
                  onChange={update}
                />
                <DueDateFilterSection filters={filters} onChange={update} />
                <BudgetFilterSection filters={filters} onChange={update} />
                <TimeFilterSection filters={filters} onChange={update} />
              </Sections>
            </Form.Body>
            <Form.Footer>
              {footerButtons.map(({ key, label, onClick, disabled }) => (
                <Form.Button
                  key={key}
                  type="button"
                  onClick={onClick}
                  disabled={disabled}
                >
                  {label}
                </Form.Button>
              ))}
            </Form.Footer>
            <Dialog
              open={collectionDialogOpen}
              onClose={() => {
                setCollectionDialogOpen(false);
                setCollectionName("");
              }}
              title={t.tasks.saveCollection}
            >
              <div className={styles.collectionForm}>
                <label className={styles.collectionField}>
                  <span>{t.tasks.collectionName}</span>
                  <input
                    type="text"
                    value={collectionName}
                    onChange={(event) => setCollectionName(event.target.value)}
                    placeholder={t.tasks.collectionName}
                    autoFocus
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleSaveCollection();
                    }}
                  />
                </label>
                <div className={styles.collectionActions}>
                  <button
                    type="button"
                    className={styles.collectionSecondaryBtn}
                    onClick={() => {
                      setCollectionDialogOpen(false);
                      setCollectionName("");
                    }}
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="button"
                    className={styles.collectionPrimaryBtn}
                    onClick={handleSaveCollection}
                    disabled={!collectionName.trim()}
                  >
                    {t.common.save}
                  </button>
                </div>
              </div>
            </Dialog>
          </Form.DrawerDismiss>
        </Form>
      </Drawer.Content>
    </Drawer>
  );
}
