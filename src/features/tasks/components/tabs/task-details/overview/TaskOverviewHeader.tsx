import Badge from "@primitive/badge/Badge.tsx";
import Divider from "@primitive/divider/Divider.tsx";
import Title from "@primitive/title/Title.tsx";
import AuthorBadge from "../../../badges/author-badge/AuthorBadge.tsx";
import DateTimeBadge from "../../../badges/date-time-badge/DateTimeBadge.tsx";
import RequiresResultReviewBadge from "../../../badges/requires-result-review-badge/RequiresResultReviewBadge.tsx";

import type { Task } from "../../../../domain/others.ts";

import styles from "./TaskOverviewHeader.module.scss";

export type TaskOverviewHeaderProps = Pick<
  Task,
  "id" | "title" | "requiresResultReview" | "initiator" | "createdAt"
>;

export function TaskOverviewHeader({
  id,
  title,
  requiresResultReview,
  initiator,
  createdAt,
}: TaskOverviewHeaderProps) {
  return (
    <div className={styles.taskHeader}>
      <div className={styles.taskHeading}>
        <Badge variant="info" className={styles.taskId}>
          <Badge.Label>{id}</Badge.Label>
        </Badge>
        <Divider className={styles.taskHeadingDivider} />
        <Title text={title} className={styles.taskTitle} title={title} />
      </div>

      <div className={styles.headerMeta}>
        <RequiresResultReviewBadge
          requiresResultReview={requiresResultReview}
        />
        <AuthorBadge text={initiator} />
        <DateTimeBadge time={createdAt} />
      </div>
    </div>
  );
}
