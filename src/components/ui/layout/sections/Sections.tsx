import type { FC, PropsWithChildren } from "react";

import styles from "./Sections.module.scss";

type SectionsProps = PropsWithChildren<{
  className?: string;
}>;

interface SectionsItemComponent extends FC<PropsWithChildren> {
  Icon: FC<PropsWithChildren>;
  Title: FC<PropsWithChildren>;
  Content: FC<PropsWithChildren>;
}

interface SectionsComponent extends FC<SectionsProps> {
  Section: SectionsItemComponent;
}

const SectionsItem: SectionsItemComponent = ({ children }) => {
  return <section className={styles.section}>{children}</section>;
};

SectionsItem.Icon = ({ children }) => {
  return <span className={styles.sectionIcon}>{children}</span>;
};

SectionsItem.Title = ({ children }) => {
  return <h3 className={styles.sectionTitle}>{children}</h3>;
};

SectionsItem.Content = ({ children }) => {
  return <div className={styles.sectionContent}>{children}</div>;
};

export const Sections: SectionsComponent = ({ className, children }) => {
  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.body}>{children}</div>
    </section>
  );
};

Sections.Section = SectionsItem;
