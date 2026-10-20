import { FiFolder } from "react-icons/fi";

import Badge from "@primitive/badge/Badge.tsx";
import { Card } from "@layout/card/Card.tsx";
import { getProjectName } from "../../../data/mockProjects.ts";

type ProjectCardProps = {
  title: string;
  project: string | null | undefined;
};

export function ProjectCard({ title, project }: ProjectCardProps) {
  const projectName = getProjectName(project);

  return (
    <Card>
      <Card.Title>{title}</Card.Title>
      <Card.Content>
        {projectName ? (
          <Badge variant="info">
            <Badge.Icon>
              <FiFolder size={16} aria-hidden />
            </Badge.Icon>
            <Badge.Label>{projectName}</Badge.Label>
          </Badge>
        ) : (
          <span>—</span>
        )}
      </Card.Content>
    </Card>
  );
}
