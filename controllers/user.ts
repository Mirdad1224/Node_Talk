import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import filterObj from "../utils/filterObj";
import FriendRequest from "../models/FriendRequest";

export const updateMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "about",
    "avatar"
  );
  try {
    const userDoc = await User.findByIdAndUpdate(req.user?._id, filteredBody);

    res.status(200).json({
      status: "success",
      data: userDoc,
      message: "User Updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const all_users = await User.find({
      verified: true,
    }).select("firstName lastName _id");

    const this_user = req.user;

    const remaining_users = all_users.filter(
      (user) =>
        !this_user?.friends.includes(user._id) &&
        user._id.toString() !== req.user?._id.toString()
    );

    res.status(200).json({
      status: "success",
      data: remaining_users,
      message: "Users found successfully!",
    });
  } catch (err) {
    next(err);
  }
};

export const getRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requests = await FriendRequest.find({ recipient: req.user?._id })
      .populate("sender")
      .select("_id firstName lastName");

    res.status(200).json({
      status: "success",
      data: requests,
      message: "Requests found successfully!",
    });
  } catch (err) {
    next(err);
  }
};

export const getFriends = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const this_user = await User.findById(req.user?._id).populate(
      "friends",
      "_id firstName lastName"
    );
    res.status(200).json({
      status: "success",
      data: this_user?.friends,
      message: "Friends found successfully!",
    });
  } catch (err) {
    next(err);
  }
};
