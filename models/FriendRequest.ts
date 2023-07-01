import mongoose from "mongoose";
import IFriendRequest from "../types/IFriendRequest";

const requestSchema = new mongoose.Schema<IFriendRequest>({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export default mongoose.model<IFriendRequest>("FriendRequest", requestSchema);
