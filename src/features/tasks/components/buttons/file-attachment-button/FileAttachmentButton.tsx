import { useRef, type ChangeEvent } from "react";
import { FiPaperclip } from "react-icons/fi";

import { Button } from "@primitive/button/Button";

export type FileAttachmentButtonProps = {
  onFilesSelected: (files: File[]) => void;
  "aria-label": string;
  title?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
};

export function FileAttachmentButton({
  onFilesSelected,
  "aria-label": ariaLabel,
  title,
  multiple = false,
  disabled = false,
  className = "",
}: FileAttachmentButtonProps) {
    
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    onFilesSelected(files);
  };

  return (
    <>
      <Button
        onClick={handleAttachClick}
        className={className}
        ariaLabel={ariaLabel}
        disabled={disabled}
      >
        <Button.Icon>
          <FiPaperclip size={14} />
        </Button.Icon>
        {title ? (
          <Button.Tooltip position="top">{title}</Button.Tooltip>
        ) : null}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        multiple={multiple}
        onChange={handleFileChange}
        tabIndex={-1}
        aria-hidden
        disabled={disabled}
      />
    </>
  );
}
