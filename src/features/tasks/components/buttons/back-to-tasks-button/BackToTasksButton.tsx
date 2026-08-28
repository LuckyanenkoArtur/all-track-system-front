import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { useTranslation } from "../../../../../i18n";
import { Button } from "@primitive/button/Button";

import styles from "./BackToTasksButton.module.scss";

export function BackToTasksButton() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Button
      onClick={() => navigate("/app/tasks")}
      className={styles.button}
    >
      <Button.Icon>
        <FiArrowLeft size={18} />
      </Button.Icon>
      <Button.Text>{t.tasks.details.backToTasks}</Button.Text>
    </Button>
  );
}
