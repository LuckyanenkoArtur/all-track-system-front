# Tasks Endpoints

Based on what the Tasks UI does today (`TasksContext` + `taskService`), these are the main backend endpoints to implement.

## Core tasks

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/tasks` | List tasks with query params: `search`, `status`, `priority`, `groups`, `initiator`, `responsible`, `observables`, `dueDateFrom/To`, `budgetMin/Max`, `timeMin/Max`, `sort`, `page`, `pageSize` |
| `GET` | `/api/tasks/:id` | Get one task (full details page / drawer) |
| `POST` | `/api/tasks` | Create task |
| `PUT` / `PATCH` | `/api/tasks/:id` | Update task (title, description, people, dates, budget, attachments, etc.) |
| `PATCH` | `/api/tasks/:id/status` | Change status (`open`, `onHold`, `inProgress`, `completed`, `cancelled`) |
| `PATCH` | `/api/tasks/:id/priority` | Change priority |
| `PATCH` | `/api/tasks/:id/steps` | Update checklist steps |
| `POST` | `/api/tasks/:id/complete` | Complete with report (description + completed steps) |

`DELETE /api/tasks/:id` is optional — the UI does not delete tasks yet.

---

## Time tracking

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/tasks/tracking/active` | Current active session (global, one at a time) |
| `POST` | `/api/tasks/:id/tracking/start` | Start timer (auto `open` → `inProgress`) |
| `POST` | `/api/tasks/:id/tracking/stop` | Stop timer, commit elapsed time |
| `POST` | `/api/tasks/:id/time-entries` | Add manual time (hours/minutes + note) |
| `GET` | `/api/tasks/:id/time-entries` | Time history for Time tab |

---

## Budget / expenses

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/tasks/:id/expenses` | List budget transactions |
| `POST` | `/api/tasks/:id/expenses` | Log expense (amount + description) |

---

## Comments, notes, history

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/tasks/:id/comments` | Discussions thread |
| `POST` | `/api/tasks/:id/comments` | Add comment (+ attachments) |
| `GET` | `/api/tasks/:id/notes` | Notes (or filter history by `note_added`) |
| `POST` | `/api/tasks/:id/notes` | Add note |
| `GET` | `/api/tasks/:id/history` | Full activity journal |

---

## Collections (saved views)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/task-collections` | List saved filter presets |
| `POST` | `/api/task-collections` | Save collection (filters + sort + pageSize) |
| `PUT` | `/api/task-collections/:id` | Update collection |
| `DELETE` | `/api/task-collections/:id` | Delete collection |

---

## Attachments (if not embedded in create/update)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/tasks/:id/attachments` | Upload file (≤ 5 MB, max 3) |
| `DELETE` | `/api/tasks/:id/attachments/:attachmentId` | Remove attachment |

---

## Priority order for MVP

1. **CRUD + list/filter** — `GET/POST /tasks`, `GET/PATCH /tasks/:id`
2. **Status / complete / steps** — status, complete, steps endpoints
3. **Time tracking** — start/stop + manual time
4. **Comments + history**
5. **Expenses**
6. **Collections**

This set mirrors every operation in `useTasks` today: create/update/status/priority/steps, tracking, complete-with-report, manual time, expenses, comments, notes, history, and collections.
