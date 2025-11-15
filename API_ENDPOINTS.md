# Task API Endpoints

## Base URL: `/api/tasks`

### Core CRUD Operations

#### Get All Tasks
```
GET /api/tasks
```
Returns all tasks in the system.

#### Create Task
```
POST /api/tasks
Body: { "title": "Task name" }
```
Creates a new task with `done: false` and `createdAt` timestamp.

#### Update Task
```
PATCH /api/tasks/:id
Body: { "title": "New title", "done": true }
```
Updates title and/or done status. Both fields are optional.

#### Delete Task
```
DELETE /api/tasks/:id
```
Removes a task by ID.

---

### Filtering & Search

#### Get Completed Tasks
```
GET /api/tasks/completed
```
Returns only tasks where `done: true`.

#### Get Pending Tasks
```
GET /api/tasks/pending
```
Returns only tasks where `done: false`.

#### Search Tasks
```
GET /api/tasks/search?q=query
```
Searches tasks by title (case-insensitive).

---

### Bulk Operations

#### Create Multiple Tasks
```
POST /api/tasks/bulk
Body: { "tasks": ["Task 1", "Task 2", "Task 3"] }
```
Creates multiple tasks at once.

#### Complete All Tasks
```
PATCH /api/tasks/complete-all
```
Marks all tasks as done.

#### Uncomplete All Tasks
```
PATCH /api/tasks/uncomplete-all
```
Marks all tasks as not done.

#### Delete All Completed Tasks
```
DELETE /api/tasks/completed
```
Removes all completed tasks from the system.

---

### Task Management

#### Duplicate Task
```
POST /api/tasks/:id/duplicate
```
Creates a copy of an existing task with "(copy)" appended to the title.

#### Reorder Tasks
```
PATCH /api/tasks/reorder
Body: { "order": [3, 1, 2, 4] }
```
Reorders tasks based on provided array of task IDs.

---

### Statistics

#### Get Task Stats
```
GET /api/tasks/stats
```
Returns statistics:
```json
{
  "total": 10,
  "completed": 6,
  "pending": 4,
  "completionRate": 60.00
}
```

---

## Example Usage

### Create a task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries"}'
```

### Mark task as complete
```bash
curl -X PATCH http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"done": true}'
```

### Search for tasks
```bash
curl http://localhost:3000/api/tasks/search?q=groceries
```

### Get statistics
```bash
curl http://localhost:3000/api/tasks/stats
```

### Create multiple tasks
```bash
curl -X POST http://localhost:3000/api/tasks/bulk \
  -H "Content-Type: application/json" \
  -d '{"tasks": ["Task 1", "Task 2", "Task 3"]}'
```

### Complete all tasks
```bash
curl -X PATCH http://localhost:3000/api/tasks/complete-all
```

### Delete completed tasks
```bash
curl -X DELETE http://localhost:3000/api/tasks/completed
```

