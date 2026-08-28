import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./NumberInput.module.scss";

export type NumberInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: number;
  min?: number;
  max?: number;
  fractionDigits?: number;
  currency?: string;
  currencyOptions?: string[];
  onCurrencyChange?: (currency: string) => void;
  grouping?: boolean;
  icon?: React.ReactNode;
  className?: string;
};

function addGrouping(intPart: string) {
  // Keep it locale-stable and avoid Number precision issues.
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function countLogicalChars(valueWithCommas: string, caret: number) {
  // Count numeric-editing characters to keep caret stable across formatting.
  let count = 0;
  for (let i = 0; i < Math.min(caret, valueWithCommas.length); i++) {
    const ch = valueWithCommas[i];
    if ((ch >= "0" && ch <= "9") || ch === "." || ch === "-") count++;
  }
  return count;
}

function logicalToVisualCaret(formatted: string, logicalCount: number) {
  if (logicalCount <= 0) return 0;
  let count = 0;
  for (let i = 0; i < formatted.length; i++) {
    const ch = formatted[i];
    if ((ch >= "0" && ch <= "9") || ch === "." || ch === "-") count++;
    if (count >= logicalCount) return i + 1;
  }
  return formatted.length;
}

function normalizeTypedNumber(
  typed: string,
  opts: { fractionDigits?: number; min: number; max?: number },
) {
  const cleaned = typed.replace(/,/g, "");
  if (!cleaned) return "";
  if (cleaned === "-") return "-";
  if (!/^-?\d*(\.\d*)?$/.test(cleaned)) return null;

  if (typeof opts.fractionDigits !== "number") {
    if (cleaned !== "" && cleaned !== "-" && Number.isFinite(Number(cleaned))) {
      const num = Number(cleaned);
      if (num < opts.min) return String(opts.min);
      if (typeof opts.max === "number" && num > opts.max) return String(opts.max);
    }
    return cleaned;
  }

  // During typing: do NOT pad with zeros (it makes fraction deletion feel impossible).
  // We only *display* padded zeros. We store up to fractionDigits.
  const sign = cleaned.startsWith("-") ? "-" : "";
  const withoutSign = sign ? cleaned.slice(1) : cleaned;
  const [intPartRaw, fracPartRaw] = withoutSign.split(".");

  const intPart = intPartRaw ?? "";
  const fracPart =
    fracPartRaw === undefined
      ? undefined
      : fracPartRaw.slice(0, Math.max(0, opts.fractionDigits));

  const normalized =
    fracPart === undefined ? `${sign}${intPart}` : `${sign}${intPart}.${fracPart}`;

  if (
    normalized !== "-" &&
    normalized !== "" &&
    normalized !== "." &&
    normalized !== "-." &&
    Number.isFinite(Number(normalized)) &&
    (Number(normalized) < opts.min ||
      (typeof opts.max === "number" && Number(normalized) > opts.max))
  ) {
    const num = Number(normalized);
    if (num < opts.min) return String(opts.min);
    if (typeof opts.max === "number" && num > opts.max) return String(opts.max);
  }

  return normalized;
}

function formatForDisplay(
  raw: string,
  opts: { grouping: boolean; fractionDigits?: number; min: number; max?: number },
) {
  const normalized = normalizeTypedNumber(raw, {
    fractionDigits: opts.fractionDigits,
    min: opts.min,
    max: opts.max,
  });
  if (normalized === null) return raw;
  if (!normalized || normalized === "-") return normalized;

  const sign = normalized.startsWith("-") ? "-" : "";
  const withoutSign = sign ? normalized.slice(1) : normalized;
  const [intPartRaw, fracPartRaw] = withoutSign.split(".");
  const intPart = intPartRaw || "0";

  const groupedInt = opts.grouping ? addGrouping(intPart) : intPart;

  if (typeof opts.fractionDigits !== "number") {
    return `${sign}${groupedInt}${
      fracPartRaw !== undefined ? `.${fracPartRaw}` : ""
    }`;
  }

  const currentFrac = fracPartRaw ?? "";
  const paddedFrac = (currentFrac + "0".repeat(opts.fractionDigits)).slice(
    0,
    opts.fractionDigits,
  );
  return `${sign}${groupedInt}.${paddedFrac}`;
}

function overwriteFractionDigit(args: {
  currentValue: string;
  displayValue: string;
  caret: number;
  digit: string;
  fractionDigits: number;
}) {
  const dotIndex = args.displayValue.indexOf(".");
  if (dotIndex === -1) return null;
  if (args.caret <= dotIndex) return null;
  const fracIndex = args.caret - (dotIndex + 1);
  if (fracIndex < 0 || fracIndex >= args.fractionDigits) return null;

  const cleaned = args.currentValue.replace(/,/g, "");
  if (!cleaned || cleaned === "-" || !/^-?\d*(\.\d*)?$/.test(cleaned)) return null;

  const sign = cleaned.startsWith("-") ? "-" : "";
  const withoutSign = sign ? cleaned.slice(1) : cleaned;
  const [intPartRaw, fracPartRaw = ""] = withoutSign.split(".");
  const intPart = intPartRaw || "0";
  const fracArr = (fracPartRaw + "0".repeat(args.fractionDigits))
    .slice(0, args.fractionDigits)
    .split("");

  fracArr[fracIndex] = args.digit;

  const nextValue = `${sign}${intPart}.${fracArr.join("")}`;
  const nextLogicalCaret =
    `${sign}${intPart}.`.length + (fracIndex + 1);

  return { nextValue, nextLogicalCaret };
}

export function NumberInput({
  label,
  value,
  onChange,
  placeholder,
  min = 0,
  max,
  fractionDigits,
  currency,
  currencyOptions,
  onCurrencyChange,
  grouping = false,
  icon,
  className = "",
}: NumberInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const currencyButtonRef = useRef<HTMLButtonElement | null>(null);
  const currencyMenuRef = useRef<HTMLDivElement | null>(null);
  const pendingLogicalCaret = useRef<number | null>(null);

  const displayValue = useMemo(() => {
    // When fractionDigits is set, we always display fixed precision while typing.
    // When grouping is set, we also format while typing (commas update live).
    if (isFocused && !grouping && typeof fractionDigits !== "number") return value;
    return formatForDisplay(value, {
      grouping,
      fractionDigits,
      min,
      max,
    });
  }, [fractionDigits, grouping, isFocused, max, min, value]);

  useEffect(() => {
    const logical = pendingLogicalCaret.current;
    if (logical === null) return;
    pendingLogicalCaret.current = null;

    const el = inputRef.current;
    if (!el) return;

    const pos = logicalToVisualCaret(displayValue, logical);
    el.setSelectionRange(pos, pos);
  }, [displayValue]);

  useEffect(() => {
    if (!currencyMenuOpen) return;

    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      if (currencyButtonRef.current?.contains(target)) return;
      if (currencyMenuRef.current?.contains(target)) return;

      setCurrencyMenuOpen(false);
    };

    const onDocKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCurrencyMenuOpen(false);
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, [currencyMenuOpen]);

  const displayPlaceholder =
    typeof placeholder === "number"
      ? formatForDisplay(String(placeholder), {
          grouping,
          fractionDigits,
          min,
          max,
        })
      : undefined;

  return (
    <label className={`${styles.field} ${className}`.trim()}>
      <span className={styles.label}>{label}</span>
      <div className={styles.controlWrap}>
        <div className={styles.control}>
          {icon ? <span className={styles.icon}>{icon}</span> : null}
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            inputMode="decimal"
            value={displayValue}
          onKeyDown={(event) => {
            if (typeof fractionDigits !== "number") return;
            if (event.key.length !== 1 || event.key < "0" || event.key > "9") return;

            const el = event.currentTarget;
            const start = el.selectionStart ?? 0;
            const end = el.selectionEnd ?? 0;
            if (start !== end) return; // only overwrite when there's no selection

            const res = overwriteFractionDigit({
              currentValue: value,
              displayValue,
              caret: start,
              digit: event.key,
              fractionDigits,
            });
            if (!res) return;

            event.preventDefault();
            pendingLogicalCaret.current = res.nextLogicalCaret;
            onChange(res.nextValue);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);

            if (typeof fractionDigits !== "number") {
              const normalized = normalizeTypedNumber(value, { fractionDigits, min, max });
              if (normalized === null) return;
              if (normalized !== value) onChange(normalized);
              return;
            }

            const cleaned = value.replace(/,/g, "");
            if (!cleaned || cleaned === "-" || !Number.isFinite(Number(cleaned))) return;

            const next = Number(cleaned).toFixed(fractionDigits);
            const nextNum = Number(next);
            if (nextNum < min) {
              onChange(String(min));
              return;
            }
            if (typeof max === "number" && nextNum > max) {
              onChange(String(max));
              return;
            }
            if (next !== value) onChange(next);
          }}
          onChange={(event) => {
            const raw = event.target.value;
            const logicalCaret = countLogicalChars(raw, event.target.selectionStart ?? 0);
            pendingLogicalCaret.current = logicalCaret;

            const normalized = normalizeTypedNumber(raw, { fractionDigits, min, max });
            if (normalized === null) return;
            onChange(normalized);
          }}
          placeholder={displayPlaceholder}
          />
          {currency ? (
            currencyOptions && onCurrencyChange ? (
              <div className={styles.currencyWrap}>
                <button
                  ref={currencyButtonRef}
                  type="button"
                  className={styles.currencyButton}
                  aria-haspopup="listbox"
                  aria-expanded={currencyMenuOpen}
                  onMouseDown={(e) => {
                    // Keep focus/caret in the input.
                    e.preventDefault();
                  }}
                  onClick={() => setCurrencyMenuOpen((v) => !v)}
                >
                  {currency}
                </button>
              </div>
            ) : (
              <span className={styles.currency}>{currency}</span>
            )
          ) : null}
        </div>

        {currency &&
        currencyOptions &&
        onCurrencyChange &&
        currencyMenuOpen ? (
          <div
            ref={currencyMenuRef}
            className={styles.currencyMenu}
            role="listbox"
            aria-label="Currency"
          >
            {currencyOptions.map((code) => (
              <button
                key={code}
                type="button"
                className={styles.currencyMenuItem}
                role="option"
                aria-selected={code === currency}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onCurrencyChange(code);
                  setCurrencyMenuOpen(false);
                }}
              >
                {code}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </label>
  );
}
