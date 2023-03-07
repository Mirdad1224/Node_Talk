import User from "../models/User";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import checkCredential from "../validators/register";
import errorGenerate from "../utils/errorGenerate";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, pwd } = req.body;
  if (!pwd || !email)
    return res
      .status(400)
      .json({ message: "email and password are required." });

  try {
    const checkData = await checkCredential({ email, pwd });
    if (checkData !== true) {
      errorGenerate("Invalid Inputs", 400, checkData);
    }
    const duplicate = await User.findOne({ email }).exec();
    if (duplicate) return res.sendStatus(409); //Conflict

    //encrypt the password
    const hashedPwd = await bcrypt.hash(pwd, 10);

    //create and store the new user
    const result = await User.create({
      email: email,
      password: hashedPwd,
    });

    if (!result) {
      errorGenerate("Users data was not saved.Try again...");
    }
    res.status(201).json({ message: `New user created!`, user: { email } });
  } catch (err) {
    next(err);
  }
};