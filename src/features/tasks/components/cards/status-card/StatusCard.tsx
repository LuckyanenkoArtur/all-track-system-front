import type { Task, TaskStatus } from "../../../domain/others.ts";
import { Card } from "@layout/card/Card.tsx";
import StatusBadge from "../../badges/status-badge/StatusBadge.tsx";

type StatusCardProps = {
  title: string;
  status: Task["status"];
  onStatusChange?: (status: TaskStatus) => void;
};

export function StatusCard({ title, status, onStatusChange }: StatusCardProps) {
  return (
    <Card>
      <Card.Title>{title}</Card.Title>
      <Card.Content>
        <StatusBadge status={status} onStatusChange={onStatusChange} />
      </Card.Content>
    </Card>
  );
}
