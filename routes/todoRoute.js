const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todoController");
const todoMiddleware = require("../middleware/todo.middleware");
const authMiddleware = require("../middleware/auth.middleware");

// Apply the protect middleware to ALL routes in this router
router.use(authMiddleware.protect);

// Now every route below this line is automatically protected
// and req.user will be available

router
  .route("/")
  .get(todoController.getAllTodos)
  .post(todoMiddleware.checkBody, todoController.createTodo);

router
  .route("/:id")
  .get(todoController.getTodoById)
  .patch(todoController.updateTodo)
  .delete(todoController.deleteTodo);

module.exports = router;