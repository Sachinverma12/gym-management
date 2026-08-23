import mongoose, { Document, model, types, Schema } from "mongoose";

export interface IAttendance extends Document {
  user: types.ObjectId | string;
  userId: string;
  checkInAt: Date;
  checkOutAt?: Date;
  checkInIp?: string;
  checkInUserAgent?: string;
  branchId: string;
  status: "CHECKED_IN" | "CHECKED_OUT";
}

const AttendanceSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  checkInAt: {
    type: Date,
    default: Date.now,
  },
  checkOutAt: {
    type: Date,
  },
  checkInIp: {
    type: String,
  },
  checkInUserAgent: {
    type: String,
  },
  branchId: {
    type: String,
    default: "default-branch",
  },
  status: {
    type: String,
    enum: ["CHECKED_IN", "CHECKED_OUT"],
    default: "CHECKED_IN",
  },
}, {
  timestamps: true,
});

export default model<IAttendance>("Attendance", AttendanceSchema);