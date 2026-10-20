import type { Task } from "../../../domain/others.ts";
import Badge from "@primitive/badge/Badge.tsx";
import { Card } from "@layout/card/Card.tsx";
import { Initials } from "../../tabs/utils/Initials.ts";
import styles from "./PeopleCard.module.scss";

type ResponsibleCardProps = {
  title: string;
  responsible: Task["responsible"];
};

export function ResponsibleCard({ title, responsible }: ResponsibleCardProps) {
  return (
    <Card>
      <Card.Title>{title}</Card.Title>
      <Card.Content>
        {responsible.length > 0 ? (
          <div className={styles.list}>
            {responsible.map((person) => (
              <Badge key={person} variant="info">
                <Badge.Icon>{new Initials(person).get()}</Badge.Icon>
                <Badge.Label>{person}</Badge.Label>
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
