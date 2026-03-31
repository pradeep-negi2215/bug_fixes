const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('tasks routes', () => {
  beforeEach(() => {
    taskService._reset();
  });

  test('GET /tasks returns all tasks', async () => {
    taskService.create({ title: 'One' });
    taskService.create({ title: 'Two' });

    const response = await request(app).get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  test('POST /tasks creates a task', async () => {
    const response = await request(app).post('/tasks').send({ title: 'Write tests', priority: 'high' });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Write tests');
    expect(response.body.priority).toBe('high');
    expect(response.body.status).toBe('todo');
  });

  test('POST /tasks rejects missing title', async () => {
    const response = await request(app).post('/tasks').send({ priority: 'high' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeTruthy();
  });

  test('POST /tasks rejects invalid status', async () => {
    const response = await request(app).post('/tasks').send({ title: 'Bad', status: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeTruthy();
  });

  test('GET /tasks?status=todo filters tasks', async () => {
    taskService.create({ title: 'Todo', status: 'todo' });
    taskService.create({ title: 'In progress', status: 'in_progress' });

    const response = await request(app).get('/tasks?status=todo');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].status).toBe('todo');
  });

  test('GET /tasks?status=do does not match substrings', async () => {
    taskService.create({ title: 'Todo', status: 'todo' });
    taskService.create({ title: 'Done', status: 'done' });

    const response = await request(app).get('/tasks?status=do');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });

  test('GET /tasks?status=invalid returns empty list', async () => {
    taskService.create({ title: 'Todo', status: 'todo' });
    taskService.create({ title: 'Done', status: 'done' });

    const response = await request(app).get('/tasks?status=invalid');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });

  test('GET /tasks?page=1&limit=2 returns first page', async () => {
    taskService.create({ title: 'A' });
    taskService.create({ title: 'B' });
    taskService.create({ title: 'C' });

    const response = await request(app).get('/tasks?page=1&limit=2');

    expect(response.status).toBe(200);
    expect(response.body.map((task) => task.title)).toEqual(['A', 'B']);
  });

  test('PUT /tasks/:id updates a task', async () => {
    const task = taskService.create({ title: 'Old' });

    const response = await request(app).put(`/tasks/${task.id}`).send({ title: 'New', status: 'in_progress' });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('New');
    expect(response.body.status).toBe('in_progress');
  });

  test('PUT /tasks/:id returns 404 for missing task', async () => {
    const response = await request(app).put('/tasks/missing').send({ title: 'New' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBeTruthy();
  });

  test('PUT /tasks/:id rejects invalid status', async () => {
    const task = taskService.create({ title: 'Bad status' });

    const response = await request(app).put(`/tasks/${task.id}`).send({ status: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeTruthy();
  });

  test('DELETE /tasks/:id deletes a task', async () => {
    const task = taskService.create({ title: 'Delete' });

    const response = await request(app).delete(`/tasks/${task.id}`);

    expect(response.status).toBe(204);
    expect(taskService.getAll()).toHaveLength(0);
  });

  test('DELETE /tasks/:id returns 404 for missing task', async () => {
    const response = await request(app).delete('/tasks/missing');

    expect(response.status).toBe(404);
    expect(response.body.error).toBeTruthy();
  });

  test('DELETE /tasks/:id returns 404 when deleting twice', async () => {
    const task = taskService.create({ title: 'Delete twice' });

    await request(app).delete(`/tasks/${task.id}`);
    const response = await request(app).delete(`/tasks/${task.id}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBeTruthy();
  });

  test('PATCH /tasks/:id/complete marks task done', async () => {
    const task = taskService.create({ title: 'Finish', priority: 'high' });

    const response = await request(app).patch(`/tasks/${task.id}/complete`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('done');
    expect(response.body.completedAt).toBeTruthy();
    expect(response.body.priority).toBe('high');
  });

  test('PATCH /tasks/:id/complete returns 404 for missing task', async () => {
    const response = await request(app).patch('/tasks/missing/complete');

    expect(response.status).toBe(404);
    expect(response.body.error).toBeTruthy();
  });

  test('PATCH /tasks/:id/complete handles already done tasks', async () => {
    const task = taskService.create({ title: 'Already done', status: 'done' });

    const response = await request(app).patch(`/tasks/${task.id}/complete`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('done');
    expect(response.body.completedAt).toBeTruthy();
  });

  test('GET /tasks/stats returns counts and overdue', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    taskService.create({ title: 'Past due', status: 'todo', dueDate: yesterday });
    taskService.create({ title: 'In progress', status: 'in_progress' });
    taskService.create({ title: 'Done', status: 'done', dueDate: yesterday });

    const response = await request(app).get('/tasks/stats');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      todo: 1,
      in_progress: 1,
      done: 1,
      overdue: 1,
    });
  });

  test('GET /tasks/stats returns zeros when empty', async () => {
    const response = await request(app).get('/tasks/stats');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      todo: 0,
      in_progress: 0,
      done: 0,
      overdue: 0,
    });
  });

  test('GET /tasks/stats ignores unknown statuses', async () => {
    taskService.create({ title: 'Todo', status: 'todo' });
    taskService.create({ title: 'Blocked', status: 'blocked' });

    const response = await request(app).get('/tasks/stats');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      todo: 1,
      in_progress: 0,
      done: 0,
      overdue: 0,
    });
  });

  test('PATCH /tasks/:id/assign sets assignee', async () => {
    const task = taskService.create({ title: 'Assign me' });

    const response = await request(app).patch(`/tasks/${task.id}/assign`).send({ assignee: 'Sam' });

    expect(response.status).toBe(200);
    expect(response.body.assignee).toBe('Sam');
  });

  test('PATCH /tasks/:id/assign rejects empty assignee', async () => {
    const task = taskService.create({ title: 'Assign me' });

    const response = await request(app).patch(`/tasks/${task.id}/assign`).send({ assignee: '   ' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeTruthy();
  });

  test('PATCH /tasks/:id/assign returns 404 for missing task', async () => {
    const response = await request(app).patch('/tasks/missing/assign').send({ assignee: 'Sam' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBeTruthy();
  });
});
