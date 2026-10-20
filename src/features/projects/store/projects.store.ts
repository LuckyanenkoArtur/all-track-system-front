import { useSyncExternalStore } from "react";

import { INITIAL_PROJECTS } from "../data/projects.ts";
import type { Project, ProjectStatus } from "../domain/project.ts";

let projects = INITIAL_PROJECTS;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getProjects() {
  return projects;
}

export function addProject(project: Project) {
  projects = [project, ...projects];
  emit();
}

export function updateProjectStatus(projectId: string, status: ProjectStatus) {
  let changed = false;
  projects = projects.map((project) => {
    if (project.id !== projectId || project.status === status) {
      return project;
    }
    changed = true;
    return { ...project, status };
  });
  if (changed) emit();
}

export function useProjects() {
  return useSyncExternalStore(subscribe, getProjects, getProjects);
}
