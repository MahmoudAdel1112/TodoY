const mongoose = require("mongoose");
const validator = require("validator");
const argon2 = require("argon2");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: "Passwords must match",
    },
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Indexes for performance
userSchema.index({ email: 1 }); // Email is already unique, but explicit index for clarity

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await argon2.hash(this.password);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (userPassword,candidatePassword) {
  return await argon2.verify(userPassword,candidatePassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;

