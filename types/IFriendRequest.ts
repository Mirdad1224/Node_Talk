import { Types } from "mongoose";

export default interface IFriendRequest {
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  createdAt: DateConstructor | number;
}
