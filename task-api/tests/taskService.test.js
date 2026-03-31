const taskService = require('../src/services/taskService');

describe('taskService', () => {
  beforeEach(() => {
    taskService._reset();
  });

  test('create() returns task with defaults', () => {
    const task = taskService.create({ title: 'First' });

    expect(task).toMatchObject({
      title: 'First',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      assignee: null,
      completedAt: null,
    });
    expect(task.id).toBeDefined();
    expect(task.createdAt).toBeDefined();
  });

  test('getAll() returns all tasks', () => {
    taskService.create({ title: 'One' });
    taskService.create({ title: 'Two' });

    const tasks = taskService.getAll();
    expect(tasks).toHaveLength(2);
    expect(tasks.map((t) => t.title)).toEqual(['One', 'Two']);
  });

  test('findById() returns the matching task', () => {
    const task = taskService.create({ title: 'Find me' });
    const found = taskService.findById(task.id);

    expect(found).toEqual(task);
  });

  test('getByStatus() returns only matching status', () => {
    taskService.create({ title: 'Todo', status: 'todo' });
    taskService.create({ title: 'In progress', status: 'in_progress' });

    const tasks = taskService.getByStatus('todo');
    expect(tasks).toHaveLength(1);
    expect(tasks[0].status).toBe('todo');
  });

  test('getByStatus() does not match substrings', () => {
    taskService.create({ title: 'Todo', status: 'todo' });
    taskService.create({ title: 'Done', status: 'done' });

    const tasks = taskService.getByStatus('do');
    expect(tasks).toHaveLength(0);
  });

  test('getPaginated() returns first page results', () => {
    taskService.create({ title: 'A' });
    taskService.create({ title: 'B' });
    taskService.create({ title: 'C' });

    const page = taskService.getPaginated(1, 2);
    expect(page.map((t) => t.title)).toEqual(['A', 'B']);
  });

  test('update() merges fields', () => {
    const task = taskService.create({ title: 'Old', priority: 'low' });
    const updated = taskService.update(task.id, { title: 'New', priority: 'high' });

    expect(updated.title).toBe('New');
    expect(updated.priority).toBe('high');
  });

  test('update() returns null for missing task', () => {
    const updated = taskService.update('missing', { title: 'Nope' });

    expect(updated).toBeNull();
  });

  test('remove() deletes existing task', () => {
    const task = taskService.create({ title: 'Delete me' });
    const removed = taskService.remove(task.id);

    expect(removed).toBe(true);
    expect(taskService.getAll()).toHaveLength(0);
  });

  test('remove() returns false for missing task', () => {
    const removed = taskService.remove('missing');

    expect(removed).toBe(false);
  });

  test('completeTask() marks done and sets completedAt', () => {
    const task = taskService.create({ title: 'Finish', priority: 'high' });
    const completed = taskService.completeTask(task.id);

    expect(completed.status).toBe('done');
    expect(completed.completedAt).toBeTruthy();
  });

  test('completeTask() preserves priority', () => {
    const task = taskService.create({ title: 'Keep priority', priority: 'high' });
    const completed = taskService.completeTask(task.id);

    expect(completed.priority).toBe('high');
  });

  test('assignTask() sets assignee', () => {
    const task = taskService.create({ title: 'Assign' });
    const updated = taskService.assignTask(task.id, 'Ava');

    expect(updated.assignee).toBe('Ava');
  });

  test('assignTask() returns null for missing task', () => {
    const updated = taskService.assignTask('missing', 'Ava');

    expect(updated).toBeNull();
  });
});
