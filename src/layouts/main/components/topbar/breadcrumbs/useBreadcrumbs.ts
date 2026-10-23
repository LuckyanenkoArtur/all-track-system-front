import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import { useProjects } from "../../../../../features/projects/store/projects.store";
import { useTasks } from "../../../../../features/tasks/hooks/useTasks";
import { useTranslation } from "../../../../../i18n";

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

/** Section titles live in the crumb slot. Nested pages add a parent link. */
export function useBreadcrumbs(): BreadcrumbItem[] {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { tasks } = useTasks();
  const projects = useProjects();

  return useMemo(() => {
    const parts = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
    if (parts[0] !== "app" || parts.length < 2) return [];

    const section = parts[1];
    const sidebar = t.sidebar;

    switch (section) {
      case "overview":
        return leaf(parts, sidebar.tasksOverview);
      case "tasks":
        return entityCrumbs(parts, sidebar.tasks, "/app/tasks", (id) =>
          tasks.find((item) => item.id === id)?.title,
        );
      case "projects":
        return entityCrumbs(parts, sidebar.projects, "/app/projects", (id) =>
          projects.find((item) => item.id === id)?.name,
        );
      case "planners":
        return planningCrumbs(parts, sidebar.planning, sidebar.planners);
      case "calendar":
        return planningCrumbs(parts, sidebar.planning, sidebar.events);
      case "reminders":
        return planningCrumbs(parts, sidebar.planning, sidebar.reminders);
      case "finance":
        return financeCrumbs(parts.slice(2), sidebar);
      case "profile":
        return leaf(parts, t.userPage.title);
      default:
        return [];
    }
  }, [pathname, projects, t, tasks]);
}

function leaf(parts: string[], label: string): BreadcrumbItem[] {
  return parts.length === 2 ? [{ label }] : [];
}

function planningCrumbs(
  parts: string[],
  planningLabel: string,
  pageLabel: string,
): BreadcrumbItem[] {
  if (parts.length !== 2) return [];
  return [{ label: planningLabel }, { label: pageLabel }];
}

function entityCrumbs(
  parts: string[],
  sectionLabel: string,
  sectionPath: string,
  resolveName: (id: string) => string | undefined,
): BreadcrumbItem[] {
  if (parts.length === 2) return [{ label: sectionLabel }];

  const name = resolveName(parts[2]);
  if (!name || parts.length > 3) return [];

  return [
    { label: sectionLabel, to: sectionPath },
    { label: name },
  ];
}

function financeCrumbs(
  segments: string[],
  sidebar: {
    finance: string;
    financeDashboard: string;
    financeAccounts: string;
    financeHistory: string;
    financeIntegration: string;
    financeReports: string;
    financeCashflow: string;
    financeBudget: string;
    financeInvestments: string;
  },
): BreadcrumbItem[] {
  if (segments.length === 0) {
    return [{ label: sidebar.finance }, { label: sidebar.financeDashboard }];
  }

  const pageLabels: Record<string, string> = {
    accounts: sidebar.financeAccounts,
    cashflow: sidebar.financeCashflow,
    budget: sidebar.financeBudget,
    investments: sidebar.financeInvestments,
  };

  const [section, leafName] = segments;
  let pageLabel: string | undefined;

  if (section === "transactions") {
    const transactionLabels: Record<string, string> = {
      history: sidebar.financeHistory,
      integration: sidebar.financeIntegration,
      reports: sidebar.financeReports,
    };
    pageLabel = leafName ? transactionLabels[leafName] : undefined;
    if (!pageLabel || segments.length > 2) return [];
  } else {
    pageLabel = section ? pageLabels[section] : undefined;
    if (!pageLabel || segments.length > 1) return [];
  }

  return [
    { label: sidebar.finance, to: "/app/finance" },
    { label: pageLabel },
  ];
}
