const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 });

// 🔄 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // bcrypt saltRounds = 12 (recommended)
  this.password = await bcrypt.hash(this.password, 12);

  // remove confirm field from DB
  this.passwordConfirm = undefined;

  next();
});

// 🔑 Compare passwords
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // bcrypt.compare(plainPassword, hashedPassword)
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
