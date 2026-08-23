import mongoose, { Document, model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  phone: string;
  email: string;
  photo?: string;
  role: "ADMIN" | "MEMBER";
  membershipPlan?: "MONTHLY" | "QUARTERLY" | "YEARLY";
  membershipStart?: Date;
  membershipEnd?: Date;
  feeStatus: "PAID" | "PENDING" | "OVERDUE";
  nextDueDate?: Date;
  lastCheckIn?: Date;
  attendanceCountThisMonth: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, "Phone is required"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  photo: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ["ADMIN", "MEMBER"],
    default: "MEMBER",
  },
  membershipPlan: {
    type: String,
    enum: ["MONTHLY", "QUARTERLY", "YEARLY"],
  },
  membershipStart: {
    type: Date,
  },
  membershipEnd: {
    type: Date,
  },
  feeStatus: {
    type: String,
    enum: ["PAID", "PENDING", "OVERDUE"],
    default: "PENDING",
  },
  nextDueDate: {
    type: Date,
  },
  lastCheckIn: {
    type: Date,
  },
  attendanceCountThisMonth: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default model<IUser>("User", UserSchema);