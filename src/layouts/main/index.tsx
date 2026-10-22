import { Outlet, useLocation } from "react-router-dom";
import { TasksProvider } from "../../features/tasks/context/TasksContext";
import Sidebar from "./components/sidebar/Sidebar";
import TopBar from "./components/topbar/TopBar";

export default function MainLayout() {
  const { pathname } = useLocation();
  const isFinance = pathname.startsWith("/app/finance");

  return (
    <TasksProvider>
      <div className="layout">
        <Sidebar />

        <div className="main-wrapper">
          <TopBar />
          <main className={`content ${isFinance ? "content--flush" : ""}`}>
            <Outlet />
          </main>
        </div>
      </div>
    </TasksProvider>
  );
}
