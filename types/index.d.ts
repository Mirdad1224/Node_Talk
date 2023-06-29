import mongoose from "mongoose";
import IUser, { IUserMethods } from "./IUser";

declare global {
  namespace Express {
    export interface Request {
      userId?: string | mongoose.Types.ObjectId;
      user?: mongoose.Document<unknown, any, IUser> & IUser & {
        _id: mongoose.Types.ObjectId;
    } & IUserMethods
    }
  }
}
export {};
