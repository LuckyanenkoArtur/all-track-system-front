import { FiPaperclip, FiX } from "react-icons/fi";

import styles from "./Attachments.module.scss";

export type AttachmentItem = {
  id: string;
  name: string;
  size: number;
};

export type AttachmentsProps = {
  items: AttachmentItem[];
  onRemove: (id: string) => void;
  /** Prefix for each remove button’s aria-label (`{removeLabel}: {name}`). */
  removeLabel: string;
  className?: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Attachments({
  items,
  onRemove,
  removeLabel,
  className = "",
}: AttachmentsProps) {
  if (items.length === 0) return null;

  return (
    <ul className={`${styles.root} ${className}`.trim()}>
      {items.map((attachment) => (
        <li key={attachment.id} className={styles.item}>
          <FiPaperclip size={14} aria-hidden />
          <span className={styles.name}>{attachment.name}</span>
          <span className={styles.size}>{formatFileSize(attachment.size)}</span>
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => onRemove(attachment.id)}
            aria-label={`${removeLabel}: ${attachment.name}`}
          >
            <FiX size={14} aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}
