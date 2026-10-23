import type { ReactNode } from "react";
import {
  FiCheckCircle,
  FiEdit2,
  FiFileText,
  FiPlus,
  FiSend,
  FiZap,
} from "react-icons/fi";

import { Card } from "@layout/card/Card.tsx";
import { Button } from "@primitive/button/Button.tsx";
import { useTranslation } from "../../../../i18n/index.ts";
import type { ProjectDetailTab } from "./projectDetailTabs.ts";
import styles from "./ProjectOverviewTemplates.module.scss";

function IconTipButton({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <Button onClick={() => undefined} ariaLabel={label}>
      <Button.Icon>{icon}</Button.Icon>
      <Button.Tooltip position="bottom">{label}</Button.Tooltip>
    </Button>
  );
}

export function ProjectRecentActivity() {
  const { t } = useTranslation();
  const copy = t.projects.details.templates;

  const activities: { icon: ReactNode; text: string; time: string }[] = [
    { icon: <FiSend size={14} />, text: copy.activityProposal, time: copy.activityProposalTime },
    { icon: <FiPlus size={14} />, text: copy.activityTask, time: copy.activityTaskTime },
    { icon: <FiCheckCircle size={14} />, text: copy.activityComplete, time: copy.activityCompleteTime },
    { icon: <FiZap size={14} />, text: copy.activityUpdate, time: copy.activityUpdateTime },
    { icon: <FiFileText size={14} />, text: copy.activityInvoice, time: copy.activityInvoiceTime },
  ];

  return (
    <Card className={`${styles.card} ${styles.activityCard}`}>
      <div className={styles.head}>
        <h2 className={styles.title}>{copy.recentActivity}</h2>
      </div>
      <ul className={styles.activityList}>
        {activities.map((item) => (
          <li key={item.text} className={styles.activity}>
            <span className={styles.activityIcon}>{item.icon}</span>
            <span className={styles.activityCopy}>
              <span className={styles.activityText}>{item.text}</span>
              <span className={styles.activityTime}>{item.time}</span>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function ProjectFinanceSummaries() {
  const { t } = useTranslation();
  const copy = t.projects.details.templates;

  return (
    <div className={styles.financeRow}>
      <Card className={styles.card}>
        <SummaryCard
          title={copy.invoicesSummary}
          label={copy.invoices}
          amount="$12,500"
          change="+25.3%"
          addLabel={copy.addNew}
          legend={[
            { label: copy.outstanding, value: "$4,950", amount: 4950, tone: "warning" },
            { label: copy.overdue, value: "$2,150", amount: 2150, tone: "danger" },
            { label: copy.paid, value: "$5,400", amount: 5400, tone: "success" },
            { label: copy.pending, value: "$3,200", amount: 3200, tone: "muted" },
          ]}
        />
      </Card>

      <Card className={styles.card}>
        <SummaryCard
          title={copy.expensesSummary}
          label={copy.expenses}
          amount="$10,200"
          change="+18.7%"
          addLabel={copy.addNew}
          legend={[
            { label: copy.total, value: "$1,600", amount: 1600, tone: "danger" },
            { label: copy.reimbursed, value: "$5,100", amount: 5100, tone: "success" },
            { label: copy.nonReimbursed, value: "$3,500", amount: 3500, tone: "warning" },
          ]}
        />
      </Card>
    </div>
  );
}

export function ProjectTaskSummary() {
  const { t } = useTranslation();
  const copy = t.projects.details.templates;

  const taskCounts = [
    { label: copy.upcoming, value: "15", tone: "muted" },
    { label: copy.dueToday, value: "2", tone: "danger" },
    { label: copy.overdue, value: "0", tone: "warning" },
    { label: copy.completed, value: "20", tone: "success" },
  ];

  return (
    <Card className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>{copy.tasksTitle}</h2>
        <IconTipButton label={copy.addTasks} icon={<FiPlus size={16} />} />
      </div>
      <ul className={styles.counts}>
        {taskCounts.map((item) => (
          <li key={item.label}>
            <p className={styles.countLabel}>
              <span className={styles.legendDot} data-tone={item.tone} />
              {item.label}
            </p>
            <p className={styles.countValue}>
              <strong>{item.value}</strong> {copy.tasksUnit}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function ProjectOverviewTemplates({
  onOpenTab,
}: {
  onOpenTab?: (tab: ProjectDetailTab) => void;
}) {
  const { t } = useTranslation();
  const copy = t.projects.details.templates;

  const tasks = [
    {
      name: copy.clientProposal,
      meta: `${copy.completed} · ${copy.high} · ${copy.sampleDue}`,
      mark: "CP",
      tone: "success",
    },
    {
      name: copy.homepageRedesign,
      meta: `${copy.dueToday} · ${copy.normal} · ${copy.sampleDue}`,
      mark: "HR",
      tone: "danger",
    },
  ];

  const documents = [
    { name: "Invoice Project.pdf", meta: "14 MB of 8.1 MB", kind: "PDF", tone: "danger", addedBy: "Alex Morgan" },
    { name: "Moodboard.jpg", meta: "3.0 MB", kind: "IMG", tone: "success", addedBy: "Lena Kovacs" },
    { name: "Brief Project.pdf", meta: "2.0 MB", kind: "PDF", tone: "danger", addedBy: "Sofia Reed" },
    { name: "Design References.fig", meta: "6.4 MB", kind: "FIG", tone: "info", addedBy: "Priya Nair" },
  ];

  return (
    <div className={styles.grid}>
      <Card className={`${styles.card} ${styles.overviewCard}`}>
        <div className={styles.head}>
          <h2 className={styles.title}>{copy.taskOverview}</h2>
          <IconTipButton label={copy.edit} icon={<FiEdit2 size={16} />} />
        </div>
        <ul className={styles.roster}>
          {tasks.map((task) => (
            <li key={task.name} className={styles.rosterItem}>
              <span className={styles.mark} data-tone={task.tone}>
                {task.mark}
              </span>
              <span className={styles.rosterCopy}>
                <span className={styles.rosterName}>{task.name}</span>
                <span className={styles.rosterMeta}>{task.meta}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className={styles.cardFooter}>
          <button
            type="button"
            className={styles.viewAll}
            onClick={() => onOpenTab?.("tasks")}
          >
            {t.projects.details.viewAll}
          </button>
        </div>
      </Card>

      <Card className={`${styles.card} ${styles.documentsCard}`}>
        <div className={styles.head}>
          <h2 className={styles.title}>{copy.documentsTitle}</h2>
          <IconTipButton label={copy.addNew} icon={<FiPlus size={16} />} />
        </div>
        <ul className={styles.roster}>
          {documents.map((file) => (
            <li key={file.name} className={styles.rosterItem}>
              <span className={styles.mark} data-tone={file.tone}>
                {file.kind}
              </span>
              <span className={styles.rosterCopy}>
                <span className={styles.rosterName}>{file.name}</span>
                <span className={styles.rosterMeta}>
                  {file.meta} · {copy.addedBy} {file.addedBy}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <div className={styles.cardFooter}>
          <button
            type="button"
            className={styles.viewAll}
            onClick={() => onOpenTab?.("documents")}
          >
            {t.projects.details.viewAll}
          </button>
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({
  title,
  label,
  amount,
  change,
  addLabel,
  legend,
}: {
  title: string;
  label: string;
  amount: string;
  change: string;
  addLabel: string;
  legend: { label: string; value: string; amount: number; tone: string }[];
}) {
  const total = legend.reduce((sum, item) => sum + item.amount, 0) || 1;

  return (
    <>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        <IconTipButton label={addLabel} icon={<FiPlus size={16} />} />
      </div>
      <div className={styles.summaryBody}>
        <div className={styles.summaryTop}>
          <div className={styles.summaryCopy}>
            <p className={styles.summaryLabel}>{label}</p>
            <p className={styles.summaryAmount}>{amount}</p>
          </div>
          <p className={styles.summaryChange}>{change}</p>
        </div>
        <div className={styles.splitBar} aria-hidden>
          {legend.map((item) => (
            <span
              key={item.label}
              data-tone={item.tone}
              style={{ width: `${(item.amount / total) * 100}%` }}
            />
          ))}
        </div>
        <ul className={styles.legend}>
          {legend.map((item) => (
            <li key={item.label}>
              <span className={styles.legendDot} data-tone={item.tone} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
