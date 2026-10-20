import type { Task } from "../../../domain/others.ts";
import Badge from "@primitive/badge/Badge.tsx";
import { Card } from "@layout/card/Card.tsx";
import { Initials } from "../../tabs/utils/Initials.ts";
import styles from "../responsible-card/PeopleCard.module.scss";

type ObservablesCardProps = {
  title: string;
  observables: Task["observables"];
};

export function ObservablesCard({ title, observables }: ObservablesCardProps) {
  return (
    <Card>
      <Card.Title>{title}</Card.Title>
      <Card.Content>
        {observables.length > 0 ? (
          <div className={styles.list}>
            {observables.map((person) => (
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
