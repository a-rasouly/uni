const store = require('../models/store');

exports.getAllTasks = (req, res) => {
  const { status, priority, userId } = req.query;
  const tasks = store.findAllTasks({ status, priority, assignedUserId: userId });
  return res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
};

exports.getTaskById = (req, res) => {
  const { id } = req.params;
  const task = store.findTaskById(id);
  if (!task) {
    return res.status(404).json({
      success: false,
      error: `Task with id '${id}' was not found`
    });
  }
  return res.status(200).json({
    success: true,
    data: task
  });
};

exports.createTask = (req, res) => {
  const { title, description, status, priority, assignedUserId, dueDate } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Field "title" is required and must be a non-empty string'
    });
  }

  const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Field "status" must be one of: ${validStatuses.join(', ')}`
    });
  }

  const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({
      success: false,
      error: `Field "priority" must be one of: ${validPriorities.join(', ')}`
    });
  }

  if (assignedUserId) {
    const user = store.findUserById(assignedUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: `Assigned user with id '${assignedUserId}' does not exist`
      });
    }
  }

  const newTask = store.createTask({
    title: title.trim(),
    description: description || '',
    status: status || 'TODO',
    priority: priority || 'MEDIUM',
    assignedUserId: assignedUserId || null,
    dueDate: dueDate || null
  });

  return res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: newTask
  });
};

exports.updateTask = (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, assignedUserId, dueDate } = req.body;

  const existing = store.findTaskById(id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: `Task with id '${id}' was not found`
    });
  }

  if (assignedUserId && assignedUserId !== existing.assignedUserId) {
    const user = store.findUserById(assignedUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: `Assigned user with id '${assignedUserId}' does not exist`
      });
    }
  }

  const updated = store.updateTask(id, {
    title,
    description,
    status,
    priority,
    assignedUserId,
    dueDate
  });

  return res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: updated
  });
};

exports.updateTaskStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const existing = store.findTaskById(id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: `Task with id '${id}' was not found`
    });
  }

  const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Status is required and must be one of: ${validStatuses.join(', ')}`
    });
  }

  const updated = store.updateTask(id, { status });
  return res.status(200).json({
    success: true,
    message: `Task status updated to '${status}'`,
    data: updated
  });
};

exports.deleteTask = (req, res) => {
  const { id } = req.params;
  const deleted = store.deleteTask(id);
  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: `Task with id '${id}' was not found`
    });
  }
  return res.status(204).send();
};
