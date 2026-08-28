import { FiCalendar } from "react-icons/fi";

import Badge from "@primitive/badge/Badge.tsx";
import { formatDate } from "../../../utils/taskListUtils.ts";

import styles from "./DateTimeBadge.module.scss";

type DateTimeBadgeProps = {
  time: string;
};

export default function DateTimeBadge({ time }: DateTimeBadgeProps) {
  return (
    <Badge variant="info" className={styles.chip}>
      <Badge.Icon>
        <FiCalendar size={13} aria-hidden />
      </Badge.Icon>
      <Badge.Label>
        <time dateTime={time}>{formatDate(time)}</time>
      </Badge.Label>
    </Badge>
  );
}
