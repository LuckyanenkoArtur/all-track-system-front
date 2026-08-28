import { useTranslation } from "../../../../../i18n/index.ts";
import type { Task } from "../../../domain/others.ts";
import TaskDetailsTabulator from "../../tabulator/details/Tabulator.tsx";
import { Drawer } from "@overlay/drawer/Drawer.tsx";

type TaskDetailsDrawerProps = {
  task: Task | null;
  initialTab?: string;
};

export function TaskDetailsDrawer({ task, initialTab }: TaskDetailsDrawerProps) {
  const { t } = useTranslation();
  const open = task !== null;
  const expandUrl = task ? `/app/tasks/${task.id}` : undefined;

  return (
    <Drawer open={open} expander={expandUrl}>
      <Drawer.Header>
        <Drawer.Title>{t.tasks.details.panelTitle}</Drawer.Title>
        <Drawer.Desciption>{t.tasks.details.panelSubtitle}</Drawer.Desciption>
      </Drawer.Header>
      <Drawer.Content>
        {task ? (
          <TaskDetailsTabulator task={task} initialTab={initialTab} />
        ) : null}
      </Drawer.Content>
    </Drawer>
  );
}
