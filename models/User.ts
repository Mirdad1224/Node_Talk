import mongoose from "mongoose";
import IUser from "../types/IUser";

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 8,
      maxlength: 255,
    },
    name: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 255,
    },
    image: {
      type: String,
    },
    phone: { type: String, minlength: 10 },
    conversations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
      },
    ],
    refreshToken: String,
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
