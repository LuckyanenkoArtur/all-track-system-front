import { createBrowserRouter, Navigate } from "react-router-dom";

import { isAuthenticated } from "./auth/auth";
import GuestRoute from "./features/login/auth/GuestRoute";
import ProtectedRoute from "./features/login/auth/ProtectedRoute";
import MainLayout from "./layouts/main";

import OverviewPage, { OverviewLayout } from "./features/overview";
import { TasksLayout } from "./features/tasks/layouts/TasksLayout";
import TasksPage from "./features/tasks/pages/tasks/TasksPage";
import { TaskDetailsPage } from "./features/tasks/pages/task-details/TaskDetailsPage";
import CalendarPage from "./features/calendar";
import RemindersPage from "./features/reminders";
import PlannersPage from "./features/planners";
import ProjectsPage from "./features/projects/ProjectsPage";
import { ProjectDetailsPage } from "./features/projects/pages/project-details/ProjectDetailsPage";

import {
  FinanceLayout,
  FinanceDashboard,
  FinanceSection,
} from "./features/finance";
import LoginPage from "./features/login";
import RegisterPage from "./features/register";
import NotFoundPage from "./pages/not-found";
import UserProfilePage from "./features/user-profile";

function RootRedirect() {
  return (
    <Navigate to={isAuthenticated() ? "/app/overview" : "/login"} replace />
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    element: <GuestRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "/app/overview",
            element: <OverviewLayout />,
            children: [{ index: true, element: <OverviewPage /> }],
          },
          {
            path: "/app/tasks",
            element: <TasksLayout />,
            children: [
              { index: true, element: <TasksPage /> },
              { path: ":id", element: <TaskDetailsPage /> },
            ],
          },
          {
            path: "/app/projects",
            element: <ProjectsPage />,
          },
          {
            path: "/app/projects/:id",
            element: <ProjectDetailsPage />,
          },
          {
            path: "/app/planners",
            element: <PlannersPage />,
          },
          {
            path: "/app/calendar",
            element: <CalendarPage />,
          },
          {
            path: "/app/reminders",
            element: <RemindersPage />,
          },

          {
            path: "/app/finance",
            element: <FinanceLayout />,
            children: [
              { index: true, element: <FinanceDashboard /> },
              {
                path: "accounts",
                element: <FinanceSection />,
              },
              {
                path: "transactions/history",
                element: <FinanceSection />,
              },
              {
                path: "transactions/integration",
                element: <FinanceSection />,
              },
              {
                path: "transactions/reports",
                element: <FinanceSection />,
              },
              {
                path: "cashflow",
                element: <FinanceSection />,
              },
              {
                path: "budget",
                element: <FinanceSection />,
              },
              {
                path: "investments",
                element: <FinanceSection />,
              },
            ],
          },
          {
            path: "/app/profile",
            element: <UserProfilePage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
