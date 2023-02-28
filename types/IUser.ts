import { Types } from "mongoose";

export default interface IUser {
  email: string;
  password?: string;
  name?: string;
  image?: string;
  phone?: string;
  conversations?: [Types.ObjectId];
  refreshToken?: string;
}
