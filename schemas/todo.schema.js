const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  priority: { type: Number, required: false, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

// Indexes for performance
// todoSchema.index({ userId: 1 }); // Index for filtering todos by user
// todoSchema.index({ userId: 1, createdAt: -1 }); // Compound index for user's todos sorted by date

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
