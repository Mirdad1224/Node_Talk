import { Types } from "mongoose";

interface Message {
  to: Types.ObjectId;
  from: Types.ObjectId;
  type: "Text" | "Media" | "Document" | "Link";
  created_at: DateConstructor | number;
  text?: string;
  file?: string;
}

export default interface IOneToOneMessage {
  participants: Types.ObjectId[];
  messages: Message[];
}
