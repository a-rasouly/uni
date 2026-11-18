const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');

let server;
let baseUrl;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (options.body) {
      reqOptions.headers['Content-Type'] = 'application/json';
    }

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          if (data) json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

describe('Task Management API Test Suite', () => {
  before((_, done) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      done();
    });
  });

  after((_, done) => {
    server.close(done);
  });

  describe('Health Endpoint', () => {
    test('GET /health returns 200 and status UP', async () => {
      const res = await request('/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'UP');
      assert.equal(res.body.service, 'task-manager-backend');
    });
  });

  describe('Users API Endpoints', () => {
    test('GET /api/v1/users returns user list', async () => {
      const res = await request('/api/v1/users');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.count >= 2);
    });

    test('GET /api/v1/users/:id returns user by id', async () => {
      const res = await request('/api/v1/users/usr-101');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.id, 'usr-101');
    });

    test('GET /api/v1/users/:id returns 404 for non-existent user', async () => {
      const res = await request('/api/v1/users/non-existent-user');
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    test('POST /api/v1/users creates a new user', async () => {
      const payload = {
        name: 'New Developer',
        email: 'developer@example.com',
        role: 'member'
      };
      const res = await request('/api/v1/users', { method: 'POST', body: payload });
      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.email, 'developer@example.com');
      assert.ok(res.body.data.id.startsWith('usr-'));
    });

    test('POST /api/v1/users returns 409 for duplicate email', async () => {
      const payload = {
        name: 'Duplicate Test',
        email: 'developer@example.com'
      };
      const res = await request('/api/v1/users', { method: 'POST', body: payload });
      assert.equal(res.status, 409);
      assert.equal(res.body.success, false);
    });

    test('POST /api/v1/users returns 400 for invalid email', async () => {
      const payload = { name: 'Invalid User', email: 'invalid-email' };
      const res = await request('/api/v1/users', { method: 'POST', body: payload });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    test('PUT /api/v1/users/:id updates user details', async () => {
      const payload = { name: 'Arash R. Updated' };
      const res = await request('/api/v1/users/usr-101', { method: 'PUT', body: payload });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.name, 'Arash R. Updated');
    });
  });

  describe('Tasks API Endpoints', () => {
    let createdTaskId;

    test('GET /api/v1/tasks returns list of tasks', async () => {
      const res = await request('/api/v1/tasks');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.count >= 3);
    });

    test('GET /api/v1/tasks?status=DONE filters tasks by status', async () => {
      const res = await request('/api/v1/tasks?status=DONE');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      res.body.data.forEach(task => {
        assert.equal(task.status, 'DONE');
      });
    });

    test('POST /api/v1/tasks creates a new task', async () => {
      const payload = {
        title: 'Complete Chapter 4 Homework',
        description: 'Verify docker container execution',
        status: 'TODO',
        priority: 'HIGH',
        assignedUserId: 'usr-101'
      };
      const res = await request('/api/v1/tasks', { method: 'POST', body: payload });
      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.title, 'Complete Chapter 4 Homework');
      createdTaskId = res.body.data.id;
    });

    test('POST /api/v1/tasks returns 404 if assigned user does not exist', async () => {
      const payload = {
        title: 'Invalid User Task',
        assignedUserId: 'non-existing-user-999'
      };
      const res = await request('/api/v1/tasks', { method: 'POST', body: payload });
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    test('PATCH /api/v1/tasks/:id/status updates task status', async () => {
      const res = await request(`/api/v1/tasks/${createdTaskId}/status`, {
        method: 'PATCH',
        body: { status: 'DONE' }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, 'DONE');
    });

    test('DELETE /api/v1/tasks/:id deletes task', async () => {
      const res = await request(`/api/v1/tasks/${createdTaskId}`, { method: 'DELETE' });
      assert.equal(res.status, 204);

      const check = await request(`/api/v1/tasks/${createdTaskId}`);
      assert.equal(check.status, 404);
    });
  });
});
