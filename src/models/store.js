/**
 * In-memory data store with simulated persistence and seed data.
 */
class DataStore {
  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.seed();
  }

  seed() {
    // Seed initial Users
    const initialUsers = [
      {
        id: 'usr-101',
        name: 'Arash Rasouli',
        email: 'arash@example.com',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-102',
        name: 'Ali Rezaei',
        email: 'ali@example.com',
        role: 'member',
        createdAt: new Date().toISOString()
      }
    ];

    initialUsers.forEach(u => this.users.set(u.id, u));

    // Seed initial Tasks
    const initialTasks = [
      {
        id: 'tsk-201',
        title: 'Initialize Git Repository',
        description: 'Set up remote repository, branching workflow, and initial project structure',
        status: 'DONE',
        priority: 'HIGH',
        assignedUserId: 'usr-101',
        dueDate: '2026-11-20T23:59:59.000Z',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'tsk-202',
        title: 'Design API Contract',
        description: 'Specify Users and Tasks endpoints, HTTP methods, and status codes',
        status: 'DONE',
        priority: 'HIGH',
        assignedUserId: 'usr-101',
        dueDate: '2026-11-22T23:59:59.000Z',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'tsk-203',
        title: 'Build Docker Container',
        description: 'Create Dockerfile, .dockerignore, and configure port mapping for containerized service',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignedUserId: 'usr-102',
        dueDate: '2026-11-25T23:59:59.000Z',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    initialTasks.forEach(t => this.tasks.set(t.id, t));
  }

  // Users Operations
  findAllUsers() {
    return Array.from(this.users.values());
  }

  findUserById(id) {
    return this.users.get(id) || null;
  }

  findUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  createUser(userData) {
    const id = `usr-${Date.now()}`;
    const newUser = {
      id,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'member',
      createdAt: new Date().toISOString()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  updateUser(id, updateData) {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = {
      ...user,
      name: updateData.name !== undefined ? updateData.name : user.name,
      email: updateData.email !== undefined ? updateData.email : user.email,
      role: updateData.role !== undefined ? updateData.role : user.role
    };
    this.users.set(id, updated);
    return updated;
  }

  deleteUser(id) {
    if (!this.users.has(id)) return false;
    this.users.delete(id);
    // Unassign tasks assigned to deleted user
    for (const task of this.tasks.values()) {
      if (task.assignedUserId === id) {
        task.assignedUserId = null;
        task.updatedAt = new Date().toISOString();
      }
    }
    return true;
  }

  // Tasks Operations
  findAllTasks(filters = {}) {
    let list = Array.from(this.tasks.values());
    if (filters.status) {
      list = list.filter(t => t.status === filters.status);
    }
    if (filters.priority) {
      list = list.filter(t => t.priority === filters.priority);
    }
    if (filters.assignedUserId) {
      list = list.filter(t => t.assignedUserId === filters.assignedUserId);
    }
    return list;
  }

  findTaskById(id) {
    return this.tasks.get(id) || null;
  }

  createTask(taskData) {
    const id = `tsk-${Date.now()}`;
    const newTask = {
      id,
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'TODO',
      priority: taskData.priority || 'MEDIUM',
      assignedUserId: taskData.assignedUserId || null,
      dueDate: taskData.dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  updateTask(id, updateData) {
    const task = this.tasks.get(id);
    if (!task) return null;
    const updated = {
      ...task,
      title: updateData.title !== undefined ? updateData.title : task.title,
      description: updateData.description !== undefined ? updateData.description : task.description,
      status: updateData.status !== undefined ? updateData.status : task.status,
      priority: updateData.priority !== undefined ? updateData.priority : task.priority,
      assignedUserId: updateData.assignedUserId !== undefined ? updateData.assignedUserId : task.assignedUserId,
      dueDate: updateData.dueDate !== undefined ? updateData.dueDate : task.dueDate,
      updatedAt: new Date().toISOString()
    };
    this.tasks.set(id, updated);
    return updated;
  }

  deleteTask(id) {
    return this.tasks.delete(id);
  }

  reset() {
    this.users.clear();
    this.tasks.clear();
    this.seed();
  }
}

module.exports = new DataStore();
