import {
  FiArrowRight,
  FiCheckCircle,
  FiCheckSquare,
  FiClock,
  FiDollarSign,
  FiEdit2,
  FiEye,
  FiFileText,
  FiFlag,
  FiPlayCircle,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import type {
  Task,
  TaskPriorityId,
  TaskStatus,
} from "../../../../domain/others.ts";
import styles from "./TaskOverviewBody.module.scss";
import { useTranslation } from "../../../../../../i18n/index.ts";
import { Button } from "@primitive/button/Button.tsx";
import buttonStyles from "@primitive/button/Button.module.scss";
import Divider from "@primitive/divider/Divider.tsx";
import { Sections } from "@layout/sections/Sections.tsx";
import ProgressBar from "@primitive/progress-bar/ProgressBar.tsx";
import StepCheckList from "@list/step-check-list/StepCheckList.tsx";
import { BudgetCard } from "../../../cards/budget-card/BudgetCard.tsx";
import { DueDateCard } from "../../../cards/due-date-card/DueDateCard.tsx";
import { ObservablesCard } from "../../../cards/observables-card/ObservablesCard.tsx";
import { PriorityCard } from "../../../cards/priority-card/PriorityCard.tsx";
import { ProjectCard } from "../../../cards/project-card/ProjectCard.tsx";
import { RelatedGroupsCard } from "../../../cards/related-groups-card/RelatedGroupsCard.tsx";
import { ResponsibleCard } from "../../../cards/responsible-card/ResponsibleCard.tsx";
import { StartDateCard } from "../../../cards/start-date-card/StartDateCard.tsx";
import { StatusCard } from "../../../cards/status-card/StatusCard.tsx";
import { TaskTrackingBar } from "../../../tracking/TaskTrackingBar.tsx";

import { isTerminalTaskStatus } from "../../../../utils/taskStatusUtils.ts";

export type TaskOverviewBodyProps = {
  task: Task;
  onToggleStep?: (stepId: string) => void;
  stepsReadOnly?: boolean;
  onStatusChange?: (status: TaskStatus) => void;
  onPriorityChange?: (priority: TaskPriorityId) => void;
  isTracking?: boolean;
  sessionTimer?: string;
  onToggleTracking?: () => void;
  onEditTask?: () => void;
  onCompleteTask?: () => void;
};

export function TaskOverviewBody({
  task,
  onToggleStep,
  stepsReadOnly = false,
  onStatusChange,
  onPriorityChange,
  isTracking,
  sessionTimer,
  onToggleTracking,
  onEditTask,
  onCompleteTask,
}: TaskOverviewBodyProps) {
  const { t } = useTranslation();
  const closed = isTerminalTaskStatus(task.status);
  const steps = task.steps ?? [];
  const completedSteps = steps.filter((step) => step.completed).length;
  const stepsLocked = closed || stepsReadOnly;
  const showComplete = Boolean(onCompleteTask) && !closed;
  const showTaskActions = showComplete || Boolean(onEditTask);

  return (
    <div className={styles.body}>
      <Sections className={styles.mainColumn}>
        <Sections.Section>
          <Sections.Section.Icon>
            <FiFlag size={15} aria-hidden />
          </Sections.Section.Icon>
          <Sections.Section.Title>Status & Priority</Sections.Section.Title>
          <Sections.Section.Content>
            <div className={styles.splitFields}>
              <PriorityCard
                title={t.tasks.priority}
                priority={task.priority}
                onPriorityChange={onPriorityChange}
              />
              <Divider icon={<FiFlag size={11} aria-hidden />} />
              <StatusCard
                title={t.tasks.status}
                status={task.status}
                onStatusChange={onStatusChange}
              />
            </div>
          </Sections.Section.Content>
        </Sections.Section>

        <Sections.Section>
          <Sections.Section.Icon>
            <FiUsers size={15} aria-hidden />
          </Sections.Section.Icon>
          <Sections.Section.Title>
            {t.tasks.filterSections.people}
          </Sections.Section.Title>
          <Sections.Section.Content>
            <div className={styles.fieldGrid}>
              <div className={styles.splitFields}>
                <ProjectCard title={t.tasks.project} project={task.project} />
                <Divider icon={<FiUser size={11} aria-hidden />} />
                <ResponsibleCard
                  title={t.tasks.responsible}
                  responsible={task.responsible}
                />
              </div>
              <div className={styles.splitFields}>
                <ObservablesCard
                  title={t.tasks.observables}
                  observables={task.observables}
                />
                <Divider icon={<FiEye size={11} aria-hidden />} />
                <RelatedGroupsCard
                  title={t.tasks.groups}
                  groups={task.groups}
                />
              </div>
            </div>
          </Sections.Section.Content>
        </Sections.Section>

        <Sections.Section>
          <Sections.Section.Icon>
            <FiClock size={15} aria-hidden />
          </Sections.Section.Icon>
          <Sections.Section.Title>Timeline</Sections.Section.Title>
          <Sections.Section.Content>
            <div className={styles.splitFields}>
              <StartDateCard
                title={t.tasks.details.startDate}
                startDate={task.startDate}
              />
              <Divider icon={<FiArrowRight size={11} aria-hidden />} />
              <DueDateCard title={t.tasks.dueDate} dueDate={task.dueDate} />
            </div>
          </Sections.Section.Content>
        </Sections.Section>

        <Sections.Section>
          <Sections.Section.Icon>
            <FiDollarSign size={15} aria-hidden />
          </Sections.Section.Icon>
          <Sections.Section.Title>Financials</Sections.Section.Title>
          <Sections.Section.Content>
            <BudgetCard title={t.tasks.budget} budget={task.budget} />
          </Sections.Section.Content>
        </Sections.Section>
      </Sections>

      <Sections className={styles.sidebar}>
        <Sections.Section>
          <Sections.Section.Icon>
            <FiFileText size={15} aria-hidden />
          </Sections.Section.Icon>
          <Sections.Section.Title>
            {t.tasks.details.description}
          </Sections.Section.Title>
          <Sections.Section.Content>
            {task.description?.trim() ? (
              <div className={styles.descriptionText}>{task.description}</div>
            ) : (
              <div className={styles.descriptionPlaceholder}>
                {t.tasks.details.descriptionEmpty}
              </div>
            )}
          </Sections.Section.Content>
        </Sections.Section>

        <Sections.Section>
          <Sections.Section.Icon>
            <FiCheckSquare size={15} aria-hidden />
          </Sections.Section.Icon>
          <Sections.Section.Title>
            {t.tasks.details.tabs.steps}
          </Sections.Section.Title>
          <Sections.Section.Content>
            {steps.length === 0 ? (
              <p className={styles.empty}>{t.tasks.details.tabs.stepsEmpty}</p>
            ) : (
              <div className={styles.root}>
                <ProgressBar completed={completedSteps} total={steps.length}>
                  <ProgressBar.Header
                    text={t.tasks.details.tabs.stepsProgress}
                  />
                  <ProgressBar.Body />
                </ProgressBar>
                <StepCheckList
                  onToggleStep={stepsLocked ? undefined : onToggleStep}
                >
                  {steps.map((step, index) => (
                    <StepCheckList.Item
                      key={step.id}
                      step={{ ...step, completed: Boolean(step.completed) }}
                      index={index}
                    />
                  ))}
                </StepCheckList>
                {stepsReadOnly && !closed && (
                  <p className={styles.readOnlyHint}>
                    {t.tasks.details.tabs.stepsReadOnlyResponsible}
                  </p>
                )}
              </div>
            )}
          </Sections.Section.Content>
        </Sections.Section>

        <Sections.Section>
          <Sections.Section.Icon>
            <FiPlayCircle size={15} aria-hidden />
          </Sections.Section.Icon>
          <Sections.Section.Title>
            {t.tasks.details.overviewActions}
          </Sections.Section.Title>
          <Sections.Section.Content>
            <div className={styles.actionsStack}>
              <TaskTrackingBar
                task={task}
                isTracking={isTracking}
                sessionTimer={sessionTimer}
                onToggleTracking={onToggleTracking}
                className={styles.trackingBarFull}
              />
              {showTaskActions && (
                <div className={styles.actionButtons}>
                  {showComplete && onCompleteTask && (
                    <Button
                      onClick={onCompleteTask}
                      className={styles.actionBtn}
                    >
                      <Button.Icon>
                        <FiCheckCircle size={15} />
                      </Button.Icon>
                      <Button.Text>{t.tasks.details.completeTask}</Button.Text>
                    </Button>
                  )}
                  {onEditTask && (
                    <Button
                      onClick={onEditTask}
                      className={`${buttonStyles.secondary} ${styles.actionBtn}`}
                    >
                      <Button.Icon>
                        <FiEdit2 size={15} />
                      </Button.Icon>
                      <Button.Text>{t.tasks.details.editTask}</Button.Text>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Sections.Section.Content>
        </Sections.Section>
      </Sections>
    </div>
  );
}
