# Bug Report

## 1) Pagination skips first page (fixed)
- Location: task-api/src/services/taskService.js, getPaginated()
- Expected: page 1 returns the first "limit" tasks.
- Actual: page 1 starts at index "limit" (skips the first page) because offset uses page * limit.
- Discovered: unit and integration tests for pagination returned the wrong tasks.
- Fix: offset should be (page - 1) * limit. (Fixed in this submission.)

## 2) Status filter matches substrings (fixed)
- Location: task-api/src/services/taskService.js, getByStatus()
- Expected: status filter should return only tasks whose status equals the provided status.
- Actual: uses String.includes, so status=do matches both todo and done, and partial statuses are accepted silently.
- Discovered: code review while writing tests for status filtering.
- Fix: replace includes with strict equality. (Fixed in this submission.)

## 3) Completing a task overwrites priority (fixed)
- Location: task-api/src/services/taskService.js, completeTask()
- Expected: completing a task should not change its priority.
- Actual: priority is forced to "medium".
- Discovered: code review while preparing complete-task tests.
- Fix: remove the priority override so the existing priority is preserved. (Fixed in this submission.)
