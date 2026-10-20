export type ProjectOption = {
  id: string;
  name: string;
};

export const MOCK_PROJECTS: ProjectOption[] = [
  { id: "PRJ-001", name: "SynoraLab Branding" },
  { id: "PRJ-002", name: "AllTrack Platform" },
  { id: "PRJ-003", name: "opsynta.ru Infrastructure" },
  { id: "PRJ-004", name: "Industrial Automation" },
  { id: "PRJ-005", name: "Mobile Delivery" },
  { id: "PRJ-006", name: "Security Hardening" },
  { id: "PRJ-007", name: "Finance Operations" },
  { id: "PRJ-008", name: "Data Platform" },
];

export function getProjectName(projectId: string | null | undefined): string | null {
  if (!projectId) return null;
  return MOCK_PROJECTS.find((project) => project.id === projectId)?.name ?? null;
}

export function getProjectSelectOptions() {
  return MOCK_PROJECTS.map((project) => ({
    value: project.id,
    label: project.name,
  }));
}
