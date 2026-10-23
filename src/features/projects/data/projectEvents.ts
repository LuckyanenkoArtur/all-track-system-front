export type ProjectMeeting = {
  id: string;
  projectId: string;
  title: string;
  start: string;
  end: string;
  tag: string;
};

export const PROJECT_MEETINGS: ProjectMeeting[] = [
  {
    id: "evt-1",
    projectId: "PRJ-001",
    title: "Meeting with Alex Morgan",
    start: "2026-01-11T09:00:00",
    end: "2026-01-11T09:45:00",
    tag: "Branding",
  },
  {
    id: "evt-2",
    projectId: "PRJ-001",
    title: "Meeting with the design team",
    start: "2026-01-11T11:00:00",
    end: "2026-01-11T11:45:00",
    tag: "Design",
  },
  {
    id: "evt-3",
    projectId: "PRJ-001",
    title: "Campus logo review",
    start: "2026-01-16T14:00:00",
    end: "2026-01-16T15:00:00",
    tag: "Review",
  },
  {
    id: "evt-4",
    projectId: "PRJ-002",
    title: "Platform planning",
    start: "2026-01-20T10:00:00",
    end: "2026-01-20T11:00:00",
    tag: "Product",
  },
];
