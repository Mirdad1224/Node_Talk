import crypto from "crypto";
import jwt, { JwtPayload } from "jsonwebtoken";
import otpGenerator from "otp-generator";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import sendEmail from "../services/mailer";
import filterObj from "../utils/filterObj";
import otp from "../templates/mail/otp";
import resetPasswordTemplate from "../templates/mail/resetPassword";
import errorGenerate from "../utils/errorGenerate";
import { jwtVerify } from "../utils/jwtVerify";

const signToken = (userId: mongoose.Types.ObjectId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET!);

// Register New User
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { firstName, lastName, email, password } = req.body;

  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "email",
    "password"
  );
  try {
    const existing_user = await User.findOne({ email: email });

    if (existing_user && existing_user.verified) {
      return res.status(400).json({
        status: "error",
        message: "Email already in use, Please login.",
      });
    } else if (existing_user) {
      await User.findOneAndUpdate({ email: email }, filteredBody, {
        new: true,
        validateModifiedOnly: true,
      });
      // generate an otp and send to email
      req.userId = existing_user._id;
      next();
    } else {
      // if user is not created before than create a new one
      const new_user = await User.create(filteredBody);
      // generate an otp and send to email
      req.userId = new_user._id;
      next();
    }
  } catch (err) {
    next(err);
  }
};

export const sendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const new_otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  console.log(new_otp);

  const otp_expiry_time = Date.now() + 10 * 60 * 1000; // 10 Mins after otp is sent
  try {
    const user = await User.findByIdAndUpdate(userId, {
      otp_expiry_time: otp_expiry_time,
    });
    if (user) {
      user.otp = new_otp.toString();

      await user.save({ validateModifiedOnly: true });

      sendEmail({
        from: "ali.mirdad75@gmail.com",
        to: user.email,
        subject: "Verification OTP",
        html: otp(user.firstName, new_otp),
        attachments: [],
      });

      res.status(200).json({
        status: "success",
        message: "OTP Sent Successfully!",
      });
    } else {
      errorGenerate("user not found", 404);
    }
  } catch (err) {
    next(err);
  }
};

export const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // verify otp and update user accordingly
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({
      email,
      otp_expiry_time: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Email is invalid or OTP expired",
      });
    }

    if (user.verified) {
      return res.status(400).json({
        status: "error",
        message: "Email is already verified",
      });
    }

    if (!(await user.correctOTP(otp, user.otp!))) {
      errorGenerate("OTP is incorrect", 400);
      return;
    }
    // OTP is correct
    user.verified = true;
    user.otp = undefined;
    await user.save({ validateModifiedOnly: true });

    const token = signToken(user._id);

    res.status(200).json({
      status: "success",
      message: "OTP verified Successfully!",
      token,
      user_id: user._id,
    });
  } catch (err) {
    next(err);
  }
};

// User Login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  // console.log(email, password);

  if (!email || !password) {
    res.status(400).json({
      status: "error",
      message: "Both email and password are required",
    });
    return;
  }

  try {
    const user = await User.findOne({ email: email }).select("+password");

    if (!user || !user.password) {
      res.status(400).json({
        status: "error",
        message: "Incorrect password",
      });

      return;
    }

    if (!user || !(await user.correctPassword(password, user.password))) {
      res.status(400).json({
        status: "error",
        message: "Email or password is incorrect",
      });

      return;
    }

    const token = signToken(user._id);

    res.status(200).json({
      status: "success",
      message: "Logged in successfully!",
      token,
      user_id: user._id,
    });
  } catch (err) {
    next(err);
  }
};

// Protect
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1) Getting token and check if it's there
  let token: string | undefined = undefined;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    errorGenerate("You are not logged in! Please log in to get access.", 401);
    return;
  }

  try {
    // 2) Verification of token
    // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET!);
    const decoded: JwtPayload = await jwtVerify(token, process.env.JWT_SECRET!);

    // 3) Check if user still exists

    const this_user = await User.findById(decoded.userId);
    if (!this_user) {
      return res.status(401).json({
        message: "The user belonging to this token does no longer exists.",
      });
    }
    // 4) Check if user changed password after the token was issued
    if (this_user.changedPasswordAfter(decoded.iat!)) {
      return res.status(401).json({
        message: "User recently changed password! Please log in again.",
      });
    }
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = this_user;
    next();
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1) Get user based on POSTed email
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      errorGenerate("There is no user with this email address.", 404);
      return;
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    try {
      const resetURL = `http://localhost:8000/auth/new-password?token=${resetToken}`;
      console.log(resetURL);
      sendEmail({
        from: "shreyanshshah242@gmail.com",
        to: user.email,
        subject: "Reset Password",
        html: resetPasswordTemplate(user.firstName, resetURL),
        attachments: [],
      });

      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        message: "There was an error sending the email. Try again later!",
      });
    }
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.body.token)
    .digest("hex");

  try {
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      errorGenerate("Token is Invalid or Expired", 400);
      return;
    }
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    const token = signToken(user._id);
    res.status(200).json({
      status: "success",
      message: "Password Reseted Successfully",
      token,
    });
  } catch (err) {
    next(err);
  }
};
