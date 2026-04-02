# Work Log

## What I changed
- Added unit tests for taskService and integration tests for the API routes (37 tests).
- Fixed pagination offset in getPaginated().
- Fixed status filtering to require exact matches (no substring matches).
- Preserved task priority when marking a task complete.
- Added PATCH /tasks/:id/assign with validation and assignee support in the task model.
- Added edge-case coverage to satisfy the assignment requirement.

## How to run tests
```bash
cd task-api
npm test
npm run coverage
```

## Coverage summary (npm run coverage)
```
-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------|---------|----------|---------|---------|-------------------
All files        |   94.19 |    87.35 |   93.33 |   93.61 |                   
 src             |   69.23 |       75 |       0 |   69.23 |                   
  app.js         |   69.23 |       75 |       0 |   69.23 | 10-11,17-18       
 src/routes      |     100 |    91.66 |     100 |     100 |                   
  tasks.js       |     100 |    91.66 |     100 |     100 | 20-21             
 src/services    |     100 |      100 |     100 |     100 |                   
  taskService.js |     100 |      100 |     100 |     100 |                   
 src/utils       |   81.48 |    79.48 |     100 |   81.48 |                   
  validators.js  |   81.48 |    79.48 |     100 |   81.48 | 12,15,22,28,31    
-----------------|---------|----------|---------|---------|-------------------
```

## Bug report
See [BUG_REPORT.md](./BUG_REPORT.md) for details on all bugs found and the fix applied.

## Assign endpoint decisions
- Validation: assignee must be a non-empty string after trimming whitespace.
- Behavior: allows re-assignment; sending the same name is effectively idempotent.
- Storage: assignee is stored on the task and defaults to null on creation.

## Notes
- Added brief inline comments to clarify 1-based pagination, priority preservation on completion, and reassignment behavior.

## What I would test next
- Query validation for pagination params (negative, zero, non-numeric).
- Strict validation for status filters and clearer error responses.
- Concurrency or race conditions if a persistent store is added.

## Surprises
- The README uses different status names (pending/in-progress/completed) than the code (todo/in_progress/done).
- Completing a task resets priority to medium, which feels unintended.

## Questions before production
- Should invalid status filters return 400 instead of empty lists?
- Should completed tasks be immutable, or should PUT/PATCH still allow edits?
- Should PUT require a full resource replacement rather than partial updates?
