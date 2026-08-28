import { FiDollarSign } from "react-icons/fi";
import type { Task } from "../../../domain/others.ts";
import Badge from "@primitive/badge/Badge.tsx";
import { Card } from "@layout/card/Card.tsx";
import { formatBudget } from "../../../utils/taskListUtils.ts";

type BudgetCardProps = {
  title: string;
  budget: Task["budget"];
};

export function BudgetCard({ title, budget }: BudgetCardProps) {
  return (
    <Card>
      <Card.Title>{title}</Card.Title>
      <Card.Content>
        <Badge variant="info">
          <Badge.Icon>
            <FiDollarSign size={16} aria-hidden />
          </Badge.Icon>
          <Badge.Label>{formatBudget(budget)}</Badge.Label>
        </Badge>
      </Card.Content>
    </Card>
  );
}
