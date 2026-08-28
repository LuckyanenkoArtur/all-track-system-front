import type { IconType } from "react-icons";

import styles from "./ViewSwitcher.module.scss";

export type ViewSwitcherItem = {
  id: string;
  label: string;
  icon: IconType;
  disabled?: boolean;
};

export type ViewSwitcherProps = {
  value: string;
  items: ViewSwitcherItem[];
  ariaLabel?: string;
  onChange?: (id: string) => void;
};

export function ViewSwitcher({
  value,
  items,
  ariaLabel = "View mode",
  onChange,
}: ViewSwitcherProps) {
  return (
    <div className={styles.root} role="tablist" aria-label={ariaLabel}>
      {items.map(({ id, label, icon: Icon, disabled }) => {
        const isActive = value === id;

        return (
          <button
            key={id}
            type="button"
            className={`${styles.toggleBtn} ${isActive ? styles.active : ""}`}
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onChange?.(id)}
          >
            <Icon size={16} aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
