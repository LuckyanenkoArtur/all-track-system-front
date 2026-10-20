import { FiLayers } from "react-icons/fi";

import type { Task } from "../../../domain/others.ts";
import Badge from "@primitive/badge/Badge.tsx";
import { Card } from "@layout/card/Card.tsx";
import styles from "../responsible-card/PeopleCard.module.scss";

type RelatedGroupsCardProps = {
  title: string;
  groups: Task["groups"];
};

export function RelatedGroupsCard({ title, groups }: RelatedGroupsCardProps) {
  return (
    <Card>
      <Card.Title>{title}</Card.Title>
      <Card.Content>
        {groups.length > 0 ? (
          <div className={styles.list}>
            {groups.map((group) => (
              <Badge key={group} variant="info">
                <Badge.Icon>
                  <FiLayers size={16} aria-hidden />
                </Badge.Icon>
                <Badge.Label>{group}</Badge.Label>
              </Badge>
            ))}
          </div>
        ) : (
          <span className={styles.empty}>—</span>
        )}
      </Card.Content>
    </Card>
  );
}
