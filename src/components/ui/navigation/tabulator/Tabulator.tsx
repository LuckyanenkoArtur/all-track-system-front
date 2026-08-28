import type { FC, PropsWithChildren, ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import styles from "./Tabulator.module.scss";

type TabContextType = {
  active: string;
  setActive: (value: string) => void;
};

const TabContext = createContext<TabContextType | null>(null);

function useTabContext() {
  const ctx = useContext(TabContext);
  if (!ctx) throw new Error("Tab components must be used inside Tabulator");
  return ctx;
}

interface TabulatorComponent extends FC<TabulatorProps> {
  Tabs: FC<PropsWithChildren>;
  Tab: FC<TabProps>;
  Panels: FC<PropsWithChildren>;
  Panel: FC<TabulatorPanelProps>;
}

type TabulatorProps = PropsWithChildren & {
  defaultValue: string;
  header?: ReactNode;
};

type TabProps = PropsWithChildren & {
  value: string;
};

type TabulatorPanelProps = PropsWithChildren & {
  value: string;
};

export const Tabulator: TabulatorComponent = ({
  children,
  defaultValue,
  header,
}) => {
  const [active, setActive] = useState(defaultValue);

  return (
    <TabContext.Provider value={{ active, setActive }}>
      <div className={styles.contentCard}>
        {header}
        {children}
      </div>
    </TabContext.Provider>
  );
};

Tabulator.Tabs = ({ children }) => {
  return (
    <div className={styles.tabs} aria-label="tabs-nav">
      {children}
    </div>
  );
};

Tabulator.Tab = ({ children, value }) => {
  const { active, setActive } = useTabContext();

  const isActive = active === value;

  return (
    <button
      className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
      onClick={() => setActive(value)}
      role="tab"
      aria-selected={isActive}
    >
      {children}
    </button>
  );
};

Tabulator.Panels = ({ children }) => {
  return <div className={styles.tabPanel}>{children}</div>;
};

Tabulator.Panel = ({ children, value }) => {
  const { active } = useTabContext();

  if (active !== value) return null;

  return (
    <div role="tabpanel" className={styles.panelContent}>
      {children}
    </div>
  );
};
