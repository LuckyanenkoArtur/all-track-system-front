import { FiSearch } from "react-icons/fi";

import styles from "./SearchBar.module.scss";

export type SearchBarProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    ariaLabel: string;
    className?: string;
};

export function SearchBar({
    value,
    onChange,
    placeholder,
    ariaLabel,
    className = "",
}: SearchBarProps) {
    return (
        <div className={`${styles.searchBox} ${className}`.trim()}>
            <FiSearch size={16} aria-hidden />
            <input
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                aria-label={ariaLabel}
            />
        </div>
    );
}
