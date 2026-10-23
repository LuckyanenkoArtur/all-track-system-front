import { FiGrid } from "react-icons/fi";

import type { Task } from "../../../domain/others.ts";
import Badge from "@primitive/badge/Badge.tsx";
import { Card } from "@layout/card/Card.tsx";
import styles from "../responsible-card/PeopleCard.module.scss";

type CategoryCardProps = {
  title: string;
  category: Task["category"];
};

export function CategoryCard({ title, category }: CategoryCardProps) {
  return (
    <Card>
      <Card.Title>{title}</Card.Title>
      <Card.Content>
        {category ? (
          <div className={styles.list}>
            <Badge variant="info">
              <Badge.Icon>
                <FiGrid size={16} aria-hidden />
              </Badge.Icon>
              <Badge.Label>{category}</Badge.Label>
            </Badge>
          </div>
        ) : (
          <span className={styles.empty}>—</span>
        )}
      </Card.Content>
    </Card>
  );
}
