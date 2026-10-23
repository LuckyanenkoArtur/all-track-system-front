import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { useTranslation } from "../../../../../i18n";
import { Button } from "@primitive/button/Button";

import styles from "./BackToTasksButton.module.scss";

export default function BackToTasksButton() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Button
      onClick={() => navigate("/app/tasks")}
      className={styles.button}
      ariaLabel={t.tasks.details.backToTasks}
    >
      <Button.Icon>
        <FiArrowLeft size={18} />
      </Button.Icon>
      <Button.Tooltip position="bottom">
        {t.tasks.details.backToTasks}
      </Button.Tooltip>
    </Button>
  );
}
