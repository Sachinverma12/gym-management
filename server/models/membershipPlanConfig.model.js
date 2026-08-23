import mongoose, { Document, model, Schema } from "mongoose";

export interface IMembershipPlanConfig extends Document {
  name: string;
  description: string;
  price: number;
  duration: string;
  durationNum: number;
  durationUnit: "month" | "quarter" | "year";
  isActive: boolean;
  createdAt: Date;
}

const MembershipPlanConfigSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, "Plan name is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price must be positive"],
  },
  duration: {
    type: String,
    required: [true, "Duration is required"],
    trim: true,
  },
  durationNum: {
    type: Number,
    required: [true, "Duration number is required"],
    min: [1, "Duration number must be positive"],
  },
  durationUnit: {
    type: String,
    enum: ["month", "quarter", "year"],
    required: [true, "Duration unit is required"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default model<IMembershipPlanConfig>("MembershipPlanConfig", MembershipPlanConfigSchema);