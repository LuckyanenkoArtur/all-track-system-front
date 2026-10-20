import { useCallback, useEffect, useState } from "react";
import { FiCircle, FiFlag, FiType } from "react-icons/fi";

import { Drawer } from "@overlay/drawer/Drawer.tsx";
import { Form } from "@overlay/form/Form.tsx";
import { DropDown } from "@input/drop-down/DropDown.tsx";
import { TextInput } from "@input/text-input/TextInput.tsx";
import { useTranslation } from "../../../../i18n/index.ts";
import {
  getTaskPriorityOptions,
  isTaskPriorityId,
} from "../../../tasks/domain/priority.ts";
import { getTaskStatusOptions } from "../../../tasks/utils/taskStatusUtils.ts";
import type {
  ProjectPriority,
  ProjectStatus,
} from "../../domain/project.ts";

export type CreateProjectInput = {
  name: string;
  status: ProjectStatus;
  priority: ProjectPriority;
};

type ProjectCreationDrawerProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateProjectInput) => void;
};

const STATUS_IDS: ProjectStatus[] = [
  "open",
  "onHold",
  "inProgress",
  "completed",
  "cancelled",
];

function isProjectStatus(value: string): value is ProjectStatus {
  return STATUS_IDS.some((status) => status === value);
}

export function ProjectCreationDrawer({
  open,
  onClose,
  onSubmit,
}: ProjectCreationDrawerProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("inProgress");
  const [priority, setPriority] = useState<ProjectPriority>("medium");

  useEffect(() => {
    if (!open) return;
    setName("");
    setStatus("inProgress");
    setPriority("medium");
  }, [open]);

  const dirty =
    name.trim().length > 0 || status !== "inProgress" || priority !== "medium";
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

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    onSubmit({ name: trimmed, status, priority });
    onClose();
  };

  return (
    <Drawer open={open} unSaveConfirmation={dirty}>
      <Drawer.Header>
        <Drawer.Title>{t.projects.newProject}</Drawer.Title>
        <Drawer.Desciption>{t.projects.newProjectSubtitle}</Drawer.Desciption>
      </Drawer.Header>
      <Drawer.Content>
        <Form
          isDirty={getIsDirty}
          unsavedConfirmation="taskCreation"
          onClose={onClose}
          resetKey={open}
        >
          <Form.DrawerDismiss>
            <Form.Body id="create-project-form">
              <TextInput
                label={t.projects.projectName}
                value={name}
                onChange={setName}
                placeholder={t.projects.projectNamePlaceholder}
                icon={<FiType size={16} />}
                required
                requiredLabel={t.tasks.dashboard.required}
                autoFocus
              />
              <DropDown
                label={t.tasks.status}
                icon={<FiCircle size={16} />}
                options={statusOptions}
                value={status}
                onChange={(value) => {
                  if (value && isProjectStatus(value)) setStatus(value);
                }}
                placeholder={t.tasks.selectPlaceholder}
              />
              <DropDown
                label={t.tasks.priority}
                icon={<FiFlag size={16} />}
                options={priorityOptions}
                value={priority}
                onChange={(value) => {
                  if (value && isTaskPriorityId(value)) setPriority(value);
                }}
                placeholder={t.tasks.selectPlaceholder}
              />
            </Form.Body>
            <Form.Footer>
              <Form.Button
                type="submit"
                form="create-project-form"
                onSubmit={handleSubmit}
                disabled={!name.trim()}
              >
                {t.projects.newProject}
              </Form.Button>
              <Form.Button type="button" variant="secondary" cancel>
                {t.common.cancel}
              </Form.Button>
            </Form.Footer>
          </Form.DrawerDismiss>
        </Form>
      </Drawer.Content>
    </Drawer>
  );
}
