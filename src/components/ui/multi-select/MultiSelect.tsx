import {
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { FiChevronDown, FiSearch, FiX } from "react-icons/fi";

import styles from "./MultiSelect.module.scss";

export type MultiSelectOption = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  label: string;
  icon?: React.ReactNode;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsLabel?: string;
  clearLabel?: string;
  multiple?: boolean;
};

export function MultiSelect({
  label,
  icon,
  options,
  selected,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  noResultsLabel = "No options found",
  clearLabel = "Clear",
  multiple = true,
}: MultiSelectProps) {
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

  const filtered = options.filter((option) =>
    option.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const toggle = (value: string) => {
    if (!multiple) {
      onChange([value]);
      setOpen(false);
      setQuery("");
      return;
    }

    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  };

  const handleClear = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onChange([]);
    setOpen(false);
    setQuery("");
  };

  const selectedLabels = options
    .filter((option) => selected.includes(option.value))
    .map((option) => option.label);

  const triggerText =
    selected.length === 0 ? placeholder : selectedLabels.join(", ");
  const hasSelection = selected.length > 0;

  return (
    <div className={styles.root} ref={containerRef}>
      <span className={styles.label}>{label}</span>
      <div
        className={`${styles.control} ${open ? styles.controlOpen : ""}`.trim()}
      >
        {icon ? <span className={styles.icon}>{icon}</span> : null}
        <button
          type="button"
          className={styles.trigger}
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listId}
        >
          <span
            className={`${styles.triggerText} ${hasSelection ? styles.hasValue : ""}`}
          >
            {triggerText}
          </span>
          {hasSelection && multiple ? (
            <span className={styles.badge}>{selected.length}</span>
          ) : null}
        </button>
        {hasSelection && multiple ? (
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
          onClick={() => setOpen((current) => !current)}
        >
          <FiChevronDown size={16} aria-hidden />
        </button>
      </div>

      {open && (
        <div className={styles.dropdown}>
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
          <ul
            className={styles.options}
            role="listbox"
            aria-multiselectable={multiple}
            id={listId}
          >
            {filtered.length === 0 ? (
              <li className={styles.noResults}>{noResultsLabel}</li>
            ) : (
              filtered.map((option) => {
                const isSelected = selected.includes(option.value);
                const optionClassName = `${styles.option} ${
                  !multiple && isSelected ? styles.optionSelected : ""
                }`.trim();

                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {multiple ? (
                      <label className={optionClassName}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggle(option.value)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ) : (
                      <button
                        type="button"
                        className={optionClassName}
                        onClick={() => toggle(option.value)}
                      >
                        <span>{option.label}</span>
                      </button>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
