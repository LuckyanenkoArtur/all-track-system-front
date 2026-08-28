import { FiCalendar } from "react-icons/fi";
import type { Task } from "../../../domain/others.ts";
import Badge from "@primitive/badge/Badge.tsx";
import { Card } from "@layout/card/Card.tsx";
import { formatDueDate } from "../../../utils/dateUtils.ts";

type DueDateCardProps = {
  title: string;
  dueDate: Task["dueDate"];
};

export function DueDateCard({ title, dueDate }: DueDateCardProps) {
  return (
    <Card>
      <Card.Title>{title}</Card.Title>
      <Card.Content>
        <Badge variant="info">
          <Badge.Icon>
            <FiCalendar size={16} aria-hidden />
          </Badge.Icon>
          <Badge.Label>{formatDueDate(dueDate)}</Badge.Label>
        </Badge>
      </Card.Content>
    </Card>
  );
}
