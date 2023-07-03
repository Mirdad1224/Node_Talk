import mongoose from "mongoose";
import IOneToOneMessage from "../types/IOneToOneMessage";

const oneToOneMessageSchema = new mongoose.Schema<IOneToOneMessage>({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  messages: [
    {
      to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      type: {
        type: String,
        enum: ["Text", "Media", "Document", "Link"],
      },
      created_at: {
        type: Date,
        default: Date.now(),
      },
      text: {
        type: String,
      },
      file: {
        type: String,
      },
    },
  ],
});

export default mongoose.model<IOneToOneMessage>(
  "OneToOneMessage",
  oneToOneMessageSchema
);
