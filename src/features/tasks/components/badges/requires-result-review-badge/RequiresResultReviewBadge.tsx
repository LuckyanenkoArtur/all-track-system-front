import { FiEye } from "react-icons/fi";

import Badge from "@primitive/badge/Badge.tsx";
import { useTranslation } from "../../../../../i18n/index.ts";

import styles from "./RequiresResultReviewBadge.module.scss";

type RequiresResultReviewBadgeProps = {
  requiresResultReview: boolean | undefined;
};

export default function RequiresResultReviewBadge({
  requiresResultReview,
}: RequiresResultReviewBadgeProps) {
  const { t } = useTranslation();

  if (!requiresResultReview) {
    return null;
  }

  return (
    <Badge variant="info" className={styles.reviewChip}>
      <Badge.Icon>
        <FiEye size={13} aria-hidden />
      </Badge.Icon>
      <Badge.Label>{t.tasks.details.requiresResultReview}</Badge.Label>
    </Badge>
  );
}
