import { useCallback } from "react";
import { FiFlag, FiCircle } from "react-icons/fi";

import { Drawer } from "@overlay/drawer/Drawer.tsx";
import { Form } from "@overlay/form/Form.tsx";
import { DropDown } from "@input/drop-down/DropDown.tsx";
import { useTranslation } from "../../../../i18n/index.ts";
import { getTaskPriorityOptions } from "../../../tasks/domain/priority.ts";
import { getTaskStatusOptions } from "../../../tasks/utils/taskStatusUtils.ts";
import {
  projectFiltersEqual,
  type ProjectFilters,
  type ProjectPriority,
  type ProjectStatus,
} from "../../domain/project.ts";
import styles from "./ProjectFilterDrawer.module.scss";

type ProjectFilterDrawerProps = {
  open: boolean;
  draft: ProjectFilters;
  applied: ProjectFilters;
  onChange: (filters: ProjectFilters) => void;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
};

export function ProjectFilterDrawer({
  open,
  draft,
  applied,
  onChange,
  onClose,
  onApply,
  onReset,
}: ProjectFilterDrawerProps) {
  const { t } = useTranslation();
  const dirty = !projectFiltersEqual(draft, applied);
  const getIsDirty = useCallback(() => dirty, [dirty]);

  const statusOptions = getTaskStatusOptions({
    open: t.tasks.open,
    onHold: t.tasks.onHold,
    inProgress: t.tasks.inProgress,
    completed: t.tasks.completed,
    cancelled: t.tasks.cancelled,
  });

  const priorityOptions = getTaskPriorityOptions({
    high: t.tasks.high,
    medium: t.tasks.medium,
    low: t.tasks.low,
  });

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
          <Form.DrawerDismiss>
            <Form.Body as="div">
              <div className={styles.stack}>
                <DropDown
                  label={t.tasks.status}
                  icon={<FiCircle size={16} />}
                  options={statusOptions}
                  value={draft.status}
                  onChange={(value) =>
                    onChange({
                      ...draft,
                      status: (value as ProjectStatus | null) ?? null,
                    })
                  }
                  placeholder={t.projects.allStatuses}
                  clearLabel={t.projects.clear}
                  clearable
                />
                <DropDown
                  label={t.tasks.priority}
                  icon={<FiFlag size={16} />}
                  options={priorityOptions}
                  value={draft.priority}
                  onChange={(value) =>
                    onChange({
                      ...draft,
                      priority: (value as ProjectPriority | null) ?? null,
                    })
                  }
                  placeholder={t.projects.allPriorities}
                  clearLabel={t.projects.clear}
                  clearable
                />
              </div>
            </Form.Body>
            <Form.Footer>
              <Form.Button type="button" onClick={onApply} disabled={!dirty}>
                {t.tasks.applyFilters}
              </Form.Button>
              <Form.Button type="button" variant="secondary" onClick={onReset}>
                {t.tasks.resetFilters}
              </Form.Button>
            </Form.Footer>
          </Form.DrawerDismiss>
        </Form>
      </Drawer.Content>
    </Drawer>
  );
}
