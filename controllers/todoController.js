// Propagate controller errors – refactor controllers/todoController.js so that the async handlers no longer swallow errors with try/catch, instead throwing AppError-style objects (or rethrowing native errors) for missing resources/invalid input so that Express 5 will forward rejections into the global handlers.

const todoModel = require("../schemas/todo.schema");
const AppError = require("../classes/AppError");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/ApiFeatures");

class TodoController {
  getAllTodos = catchAsync(async (req, res) => {
    // Add userId filter to ensure users only see their own todos
    const baseFilter = { userId: req.user._id };

    // 1️⃣ Build query with base filter (userId) and apply advanced features
    const features = new ApiFeatures(todoModel, req.query, baseFilter)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // 2️⃣ Validate pagination if page is provided
    if (req.query.page) {
      const queryObj = { ...req.query };
      const excludedFields = ["sort", "page", "limit", "fields"];
      excludedFields.forEach((el) => delete queryObj[el]);
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
      const queryFilter = JSON.parse(queryStr);
      const countFilter = { ...baseFilter, ...queryFilter };
      const numTodos = await todoModel.countDocuments(countFilter);
      if (features.skip >= numTodos) {
        throw new AppError("This page does not exist", 404);
      }
    }

    // 3️⃣ Execute query
    const todos = await features.query;

    // 4️⃣ Send response
    res.status(200).json({
      status: "success",
      results: todos.length,
      data: {
        todos,
      },
    });
  });

  createTodo = catchAsync(async (req, res) => {
    req.body.userId = req.user._id;

    if (!req.body.title) {
      throw new AppError("Title is required", 400);
    }

    const newTodo = await todoModel.create(req.body);
    return res.status(201).json({
      status: "success",
      data: {
        todo: newTodo,
      },
    });
  });

  getTodoById = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const todoId = req.params.id;

    const todo = await todoModel.findOne({
      _id: todoId,
      userId, // assuming your todo has a 'user' field referencing the owner
    });

    if (!todo) {
      throw new AppError("No todo found with that ID", 404);
    }

    return res.status(200).json({
      status: "success",
      data: {
        todo,
      },
    });
  });

  updateTodo = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const todoId = req.params.id;

    const updatedTodo = await todoModel.findOneAndUpdate(
      {
        _id: todoId, // the todo's document ID
        userId, // MUST belong to the logged-in user
      },
      req.body,
      {
        new: true, // return the updated document
        runValidators: true, // validate the update against schema
      }
    );

    if (!updatedTodo) {
      throw new AppError("No todo found with that ID", 404);
    }

    return res.status(200).json({
      status: "success",
      data: {
        todo: updatedTodo,
      },
    });
  });

  deleteTodo = catchAsync(async (req, res) => {
    const deletedTodo = await todoModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deletedTodo) {
      throw new AppError(
        "No todo found with that ID or you are not the owner",
        404
      );
    }

    return res.status(204).end();
  });
}

module.exports = new TodoController();
