import { Link, useLocation } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

import { useTranslation } from "../../../../../i18n";
import { useBreadcrumbs } from "./useBreadcrumbs";
import styles from "./Breadcrumbs.module.scss";

export default function Breadcrumbs() {
  const items = useBreadcrumbs();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  if (items.length === 0) return null;

  return (
    <nav className={styles.nav} aria-label={t.common.breadcrumbs}>
      <ol className={styles.list} key={pathname}>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li
              key={`${item.to ?? item.label}-${index}`}
              className={`${styles.crumb} ${isCurrent ? styles.crumbCurrent : ""}`}
            >
              {index > 0 && (
                <FiChevronRight className={styles.separator} aria-hidden="true" />
              )}
              {isCurrent || !item.to ? (
                <span
                  className={isCurrent ? styles.current : styles.static}
                  aria-current={isCurrent ? "page" : undefined}
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <Link className={styles.link} to={item.to} title={item.label}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
