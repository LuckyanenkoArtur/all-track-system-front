import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { useTranslation } from "../../../../../i18n";
import { Button } from "@primitive/button/Button";

import styles from "./BackToTasksButton.module.scss";

type BackToTasksButtonProps = {
  to?: string;
  state?: unknown;
  label?: string;
};

export default function BackToTasksButton({
  to = "/app/tasks",
  state,
  label,
}: BackToTasksButtonProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const text = label ?? t.tasks.details.backToTasks;

  return (
    <Button
      onClick={() => navigate(to, state === undefined ? undefined : { state })}
      className={styles.button}
      ariaLabel={text}
    >
      <Button.Icon>
        <FiArrowLeft size={18} />
      </Button.Icon>
      <Button.Tooltip position="bottom">{text}</Button.Tooltip>
    </Button>
  );
}
