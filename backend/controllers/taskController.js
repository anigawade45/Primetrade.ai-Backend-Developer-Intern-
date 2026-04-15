const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');

// @desc    Get all user tasks
// @route   GET /api/v1/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, sort } = req.query;
  const query = req.user.role === 'admin' ? {} : { user: req.user.id };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  let sortOptions = { createdAt: -1 };
  if (sort) {
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    const sortOrder = sort.startsWith('-') ? -1 : 1;
    sortOptions = { [sortField]: sortOrder };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const tasks = await Task.find(query)
    .sort(sortOptions)
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Task.countDocuments(query);

  res.json({
    success: true,
    data: {
      tasks,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
    },
  });
});

// @desc    Create a new task
// @route   POST /api/v1/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status } = req.body;

  const task = await Task.create({
    user: req.user.id,
    title,
    description,
    status,
  });

  res.status(201).json({
    success: true,
    data: task,
  });
});

// @desc    Update a task
// @route   PUT /api/v1/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this task');
  }

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: updatedTask,
  });
});

// @desc    Delete a task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this task');
  }

  await task.deleteOne();

  res.json({
    success: true,
    data: { id: req.params.id },
  });
});

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
