import type { SidebarNavItemData } from "../components/navigation/types/navigation-item";

import { RxDashboard } from "react-icons/rx";
import {
  FiCheckSquare,
  FiFolder,
  FiCalendar,
  FiDollarSign,
  FiBell,
  FiClock,
  FiMap,
} from "react-icons/fi";

type TFunction = {
  sidebar: Record<string, string>;
};

export function createSidebarItems(t: TFunction): SidebarNavItemData[] {
  return [
    {
      kind: "link",
      id: "dashboard",
      to: "/app/overview",
      label: t.sidebar.dashboard,
      icon: RxDashboard,
    },
    {
      kind: "link",
      id: "tasks",
      to: "/app/tasks",
      label: t.sidebar.tasks,
      icon: FiCheckSquare,
    },
    {
      kind: "link",
      id: "projects",
      to: "/app/projects",
      label: t.sidebar.projects,
      icon: FiFolder,
    },
    {
      kind: "group",
      id: "finance",
      label: t.sidebar.finance,
      icon: FiDollarSign,
      children: [
        {
          kind: "link",
          id: "finance-dashboard",
          to: "/app/finance",
          label: t.sidebar.financeDashboard,
          end: true,
        },
        {
          kind: "link",
          id: "finance-accounts",
          to: "/app/finance/accounts",
          label: t.sidebar.financeAccounts,
        },
        {
          kind: "group",
          id: "finance-transactions",
          label: t.sidebar.financeTransactions,
          children: [
            {
              kind: "link",
              id: "finance-history",
              to: "/app/finance/transactions/history",
              label: t.sidebar.financeHistory,
            },
            {
              kind: "link",
              id: "finance-integration",
              to: "/app/finance/transactions/integration",
              label: t.sidebar.financeIntegration,
            },
            {
              kind: "link",
              id: "finance-reports",
              to: "/app/finance/transactions/reports",
              label: t.sidebar.financeReports,
            },
          ],
        },
        {
          kind: "link",
          id: "finance-cashflow",
          to: "/app/finance/cashflow",
          label: t.sidebar.financeCashflow,
        },
        {
          kind: "link",
          id: "finance-budget",
          to: "/app/finance/budget",
          label: t.sidebar.financeBudget,
        },
        {
          kind: "link",
          id: "finance-investments",
          to: "/app/finance/investments",
          label: t.sidebar.financeInvestments,
        },
      ],
    },
    {
      kind: "group",
      id: "planning",
      label: t.sidebar.planning,
      icon: FiClock,
      children: [
        {
          kind: "link",
          id: "planners",
          to: "/app/planners",
          label: t.sidebar.planners,
          icon: FiMap,
        },
        {
          kind: "link",
          id: "events",
          to: "/app/calendar",
          label: t.sidebar.events,
          icon: FiCalendar,
        },
        {
          kind: "link",
          id: "reminders",
          to: "/app/reminders",
          label: t.sidebar.reminders,
          icon: FiBell,
        },
      ],
    },
  ];
}
