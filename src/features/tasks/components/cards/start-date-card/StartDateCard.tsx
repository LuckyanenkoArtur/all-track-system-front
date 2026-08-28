import { FiPlay } from "react-icons/fi";
import type { Task } from "../../../domain/others.ts";
import Badge from "@primitive/badge/Badge.tsx";
import { Card } from "@layout/card/Card.tsx";
import { formatDueDate } from "../../../utils/dateUtils.ts";

type StartDateCardProps = {
  title: string;
  startDate: Task["startDate"];
};

export function StartDateCard({ title, startDate }: StartDateCardProps) {
  return (
    <Card>
      <Card.Title>{title}</Card.Title>
      <Card.Content>
        <Badge variant="info">
          <Badge.Icon>
            <FiPlay size={16} aria-hidden />
          </Badge.Icon>
          <Badge.Label>{formatDueDate(startDate)}</Badge.Label>
        </Badge>
      </Card.Content>
    </Card>
  );
}
