import Badge from "../badge/Badge";
import styles from "../number-input/NumberInput.module.scss";

export type TextInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  required?: boolean;
  requiredLabel?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
};

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  icon,
  className = "",
  required = false,
  requiredLabel,
  readOnly = false,
  autoFocus = false,
}: TextInputProps) {
  return (
    <label className={`${styles.field} ${className}`.trim()}>
      <span className={styles.label}>
        {label}
        {requiredLabel ? (
          <Badge variant="info" compact>
            <Badge.Label>{requiredLabel}</Badge.Label>
          </Badge>
        ) : null}
      </span>
      <div className={styles.controlWrap}>
        <div className={styles.control}>
          {icon ? <span className={styles.icon}>{icon}</span> : null}
          <input
            className={styles.input}
            type="text"
            value={value}
            readOnly={readOnly}
            required={required}
            autoFocus={autoFocus}
            placeholder={placeholder}
            onChange={(event) => {
              if (readOnly) return;
              onChange(event.target.value);
            }}
          />
        </div>
      </div>
    </label>
  );
}
