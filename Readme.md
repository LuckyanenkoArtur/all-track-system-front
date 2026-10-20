# Tasks Feature

Work-queue module for creating and managing tasks, assigning people/groups, tracking time, logging budget spend, discussing via comments, keeping notes, and auditing activity history.

**Location:** `src/features/tasks/`

Also reused on the Overview dashboard (`/app/overview`) for task creation, active time tracking, and the task details drawer.

---

## Routes

| Route | Page | Description |
|-------|------|-------------|
| `/app/tasks` | `TasksPage` | Task list with search, filters, collections, table, create, and details drawer |
| `/app/tasks/:id` | `TaskDetailsPage` | Full-page task details with the same tabs as the drawer |
| `/app/overview` | Overview | Reuses tasks provider for create, active tracking, and details drawer |

Sidebar link: **Tasks** → `/app/tasks`.

---

## Domain Model

### Task

| Field | Description |
|-------|-------------|
| `id` | Task identifier (e.g. `TSK-001`) |
| `title` | Task title |
| `status` | Current status |
| `priority` | Priority object `{ id, name }` |
| `groups` | Related projects/groups |
| `observables` | Watchers |
| `createdAt`, `startDate`, `dueDate` | ISO date strings |
| `initiator` | Creator |
| `responsible` | Assignees |
| `budget` | Max budget (e.g. `"$1,200"`) |
| `timeSpent` | Accumulated time (e.g. `"6h 15m"`) |
| `description` | Optional description |
| `steps` | Optional checklist steps |
| `attachments` | Optional file attachments |
| `requiresResultReview` | Whether completion needs review |
| `budgetSpent` | Optional spent fallback when no transactions exist |

### Status

`open` · `onHold` · `inProgress` · `completed` · `cancelled`

- Terminal (read-only UI): `completed`, `cancelled`
- Starting a timer on an `open` task moves it to `inProgress`

### Priority

`high` · `medium` · `low`

### Related entities

- **Steps** — `{ id, text, completed? }` checklist items
- **Comments** — discussion posts with optional attachments; completion reports use `kind: "completion"`
- **History** — activity journal entries (status changes, edits, time, budget, notes, completion)
- **Budget transactions** — expense logs (`amount`, `description`, `author`, `createdAt`)
- **Collections** — saved filter/sort/pageSize presets

---

## Task List (`/app/tasks`)

Users can:

- **Search** across id, title, people, groups, budget, time, status, and priority
- **Filter** via a filter drawer (draft → Apply / Reset):
  - Status, priority
  - People & groups (initiators, responsible, observables, groups)
  - Due date range
  - Budget range (USD)
  - Time spent range (minutes)
- **Sort** by clicking sortable columns (asc/desc toggle)
- **Paginate** with page sizes `5 | 10 | 15 | 20`
- **Toggle column visibility** (persisted in `localStorage`; title and actions always shown)
- **Save / apply / delete collections** — named presets of filters, sort, and page size
- **Switch view mode** — only **Table** is implemented; Kanban, Calendar, and List are disabled stubs
- **Open details** by clicking a row (details drawer)
- **Create tasks** via the Create Task button
- Accept deep-links from Overview with preset filters or a selected task

### Row actions (⋯ menu)

- Complete task (disabled when terminal)
- Start / stop time tracking
- Add manual time (opens details on the Time tab)
- Log budget expense (opens details on the Transactions tab)

---

## Create / Edit Task

Drawer sections: task details, people & groups, schedule, priority & budget, attachments & review.

Users can set:

- Title, description, steps
- Groups, observables
- Start date, due date
- Priority, max budget
- Attachments (up to 3 files, ≤ 5 MB each)
- `requiresResultReview`

Initiator defaults from the user profile. New tasks start as `open` with `timeSpent: "0h 00m"`.

---

## Task Details (Drawer & Full Page)

Shared tabulator used by the details drawer and `/app/tasks/:id`.

| Tab | Functionality |
|-----|---------------|
| **Overview** | Header, status/priority cards, people, timeline, budget, groups, description, steps checklist, tracking bar, edit & complete |
| **Metrics** | Time left, live total time, budget chart and utilization |
| **Time** | Time entry thread + manual time form |
| **Transactions** | Expense thread + expense form |
| **Discussions** | Comments thread + compose form (with attachments) |
| **Notes** | Notes from history + add note form |
| **Documents** | Placeholder (not implemented) |
| **History** | Full activity journal |

Choosing status **Completed** opens the completion drawer instead of a silent status change. Terminal tasks lock comment/note/time/expense forms as read-only.

The drawer can expand to the full details page at `/app/tasks/:id`.

---

## Time Tracking

- One active tracking session at a time
- **Start** — if status is `open`, auto-sets `inProgress`; stops any previous session first
- **Stop** — commits elapsed minutes into `timeSpent` and writes a `time_tracked` history entry
- Completing a task clears its tracking session
- Session persists across refresh (`localStorage`)
- UI surfaces: row menu, overview tracking bar (live timer), Overview **Active Tracking** card, live highlighting in the table time column and Metrics tab
- **Manual time** — hours + minutes + optional note → updates `timeSpent`, history `manual_time_added`

---

## Budget & Expenses

- Task has a max budget string; spend is tracked via budget transactions
- Users can **log expenses** (amount + description) → transaction + history `budget_expense_added`
- Spent calculation: sum of transactions; else `budgetSpent`; else heuristic based on hours × rate
- Metrics / budget chart shows total, spent, remaining, and utilization % (ok / warning / critical thresholds)

---

## Comments, Notes & History

**Comments**

- Threaded discussions on the Discussions tab
- Ctrl/⌘+Enter to send
- Up to 3 attachments × 5 MB; downloadable when a data URL is present
- Completion reports appear as comments with `kind: "completion"`

**Notes**

- Stored as history entries of type `note_added`
- Notes tab filters and displays those entries

**History**

Event types: `task_completed`, `comment_added`, `note_added`, `budget_expense_added`, `manual_time_added`, `time_tracked`, `task_updated`, `status_changed`

---

## Steps / Checklist

- Defined at create/edit via the steps editor
- Shown on Overview with a progress bar and toggleable checklist
- Only users whose name matches a `responsible` entry can toggle steps; others see a read-only message
- Locked when the task is completed or cancelled
- **Completion drawer**: free-form “what was done” + optional completed-steps list → status `completed`, completion comment, history `task_completed`, tracking cleared

---

## State Management

| Layer | Role |
|-------|------|
| `TasksContext` / `useTasks` | Primary runtime API (CRUD, tracking, comments, notes, expenses) for list, drawer, and Overview |
| `taskService` | In-memory + `localStorage` persistence |
| `useTaskListState` | Filters, sort, pagination, collections UI state |
| `useTaskCollections` | Save/delete collections |
| `useTaskTableColumnVisibility` | Column prefs in `localStorage` |
| Zustand `tasks.store` | Used by the full details page only (`getTasks` / `getTaskById`) |

No real backend. Data is persisted in browser `localStorage` (tasks, comments, history, budget transactions, tracking session, collections, column visibility), seeded from mock data.

---

## UI Building Blocks

**Badges:** status, priority, author, date/time, requires-result-review

**Cards:** status, priority, start date, due date, budget, active tracking, task info (Overview stats)

**Chart:** budget spent vs remaining / utilization

**Drawers:** filter, create/edit, details, complete task

---

## Overview Integration

Overview dashboard cards (total, in progress, open, completed, due today, due this week) deep-link to `/app/tasks` with preset filters. Overview also hosts create-task and active-tracking UI under the same `TasksProvider`.

---

## Not Yet Implemented

- Kanban, Calendar, and List view modes (UI stubs only)
- Documents tab (placeholder empty state)
- Real API / backend persistence
