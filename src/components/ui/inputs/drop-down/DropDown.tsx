import {
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { FiChevronDown, FiSearch, FiX } from "react-icons/fi";

import styles from "./DropDown.module.scss";

export type DropDownOption = {
  value: string;
  label: string;
};

type DropDownProps = {
  label?: string;
  icon?: ReactNode;
  options: DropDownOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsLabel?: string;
  clearLabel?: string;
  searchable?: boolean;
  clearable?: boolean;
};

export function DropDown({
  label,
  icon,
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  noResultsLabel = "No options found",
  clearLabel = "Clear",
  searchable = false,
  clearable = false,
}: DropDownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: Event) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const filtered = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : options;

  const selectedOption = options.find((option) => option.value === value);
  const hasSelection = Boolean(selectedOption);
  const triggerText = selectedOption?.label ?? placeholder;

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
    setQuery("");
  };

  const handleClear = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onChange(null);
    setOpen(false);
    setQuery("");
  };

  const toggleOpen = () => setOpen((current) => !current);

  return (
    <div className={styles.root} ref={containerRef}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <div
        className={`${styles.control} ${open ? styles.controlOpen : ""}`.trim()}
      >
        {icon ? <span className={styles.icon}>{icon}</span> : null}
        <button
          type="button"
          className={styles.trigger}
          onClick={toggleOpen}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listId}
        >
          <span
            className={`${styles.triggerText} ${hasSelection ? styles.hasValue : ""}`}
          >
            {triggerText}
          </span>
        </button>
        {hasSelection && clearable ? (
          <button
            type="button"
            className={styles.clearBtn}
            aria-label={clearLabel}
            onClick={handleClear}
          >
            <FiX size={14} aria-hidden />
          </button>
        ) : null}
        <button
          type="button"
          className={styles.chevronBtn}
          aria-label={open ? "Close options" : "Open options"}
          aria-expanded={open}
          onClick={toggleOpen}
        >
          <FiChevronDown size={16} aria-hidden />
        </button>
      </div>

      {open && (
        <div className={styles.dropdown}>
          {searchable ? (
            <div className={styles.searchBox}>
              <FiSearch size={14} aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                autoFocus
              />
            </div>
          ) : null}
          <ul className={styles.options} role="listbox" id={listId}>
            {filtered.length === 0 ? (
              <li className={styles.noResults}>{noResultsLabel}</li>
            ) : (
              filtered.map((option) => {
                const isSelected = option.value === value;
                const optionClassName = `${styles.option} ${
                  isSelected ? styles.optionSelected : ""
                }`.trim();

                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <button
                      type="button"
                      className={optionClassName}
                      onClick={() => handleSelect(option.value)}
                    >
                      <span>{option.label}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
