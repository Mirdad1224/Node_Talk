import { Types } from "mongoose";

export default interface IAudio {
  participants: Types.ObjectId[];
  from: Types.ObjectId;
  to: Types.ObjectId;
  verdict: "Accepted" | "Denied" | "Missed" | "Busy";
  status: "Ongoing" | "Ended";
  startedAt: DateConstructor | number;
  endedAt: DateConstructor | number;
}
