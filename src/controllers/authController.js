import crypto from "crypto";
import jwt from "jsonwebtoken";

import { AppError } from "../utils/AppError.js";
import { sendEmail } from "../utils/email.js";
import { env } from "../config/env.js";
import User from "../models/users.js";

// Helper: Create and sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

// Helper: Send token in response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = "nice-try-hacker-but-this-isn't-a-rom-com";

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

// Register new user
export const register = async (req, res, next) => {
  try {
    const { email, password, passwordConfirm } = req.body;

    // Create user (schema validation handles password match)
    const newUser = await User.create({
      email,
      password,
      passwordConfirm,
    });

    // Send token response
    createSendToken(newUser, 201, res);
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

// Login existing user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if user exists and password is correct
    const user = await User.findOne({ email }).select("+password"); //"+password" allows the password value to be outputed in this function only(true), while false elsewhere

    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new AppError("Incorrect email or password", 401);
    }

    // 2) Send token to client
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// Complete password reset
export const resetPassword = async (req, res, next) => {
  try {
    //   console.log("token",req.params.token);
    // 1) Get user by hashed token and check expiration
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError("Token is invalid or expired", 400);
    }

    // 2) Update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save(); // Runs validators

    // 3) Log user in with new JWT
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

//forget password

export const forgotPassword = async (req, res, next) => {
  try {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      // Don't reveal if email doesn't exist (security best practice)
      return res.status(200).json({
        status: "success",
        message: "If the email exists, a reset token has been sent",
      });
    }

    // 2) Generate random reset token (unhashed)
    const resetToken = user.createPasswordResetToken();

    // 3) Save hashed token and expiry (disable validators)
    await user.save({ validateBeforeSave: false });

    // 4) Send token via email
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/reset/${resetToken}`;

    const message = `Forgot your password? NOTE: This API is for testing/demo purposes only — do NOT use real credentials.\n\nSubmit a PATCH request with your new password to:\n${resetURL}\n\nThis link expires in 10 minutes. If you did not request a reset, you can safely ignore this message.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (valid for 10 min)",
        message,
      });

      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
        token: resetToken,
      });
    } catch (err) {
      // Reset token fields if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      throw new AppError(`Error sending email. Try again later! ${err}`, 500);
    }
  } catch (err) {
    next(err);
  }
};
