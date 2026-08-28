import type { Task, TaskPriorityId } from "../../../domain/others.ts";
import { Card } from "@layout/card/Card.tsx";
import PriorityBadge from "../../badges/priority-badge/PriorityBadge.tsx";

type PriorityCardProps = {
  title: string;
  priority: Task["priority"];
  onPriorityChange?: (priority: TaskPriorityId) => void;
};

export function PriorityCard({
  title,
  priority,
  onPriorityChange,
}: PriorityCardProps) {
  return (
    <Card>
      <Card.Title>{title}</Card.Title>
      <Card.Content>
        <PriorityBadge
          priority={priority}
          onPriorityChange={onPriorityChange}
        />
      </Card.Content>
    </Card>
  );
}
