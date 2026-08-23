import mongoose, { Document, model, Schema } from "mongoose";

export interface IReferral extends Document {
  referrer: types.ObjectId | string;
  referrerId: string;
  referred: types.ObjectId | string;
  referredId: string;
  rewardGiven: boolean;
  createdAt: Date;
}

const ReferralSchema: Schema = new Schema({
  referrer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  referrerId: {
    type: String,
    required: true,
  },
  referred: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  referredId: {
    type: String,
    required: true,
  },
  rewardGiven: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default model<IReferral>("Referral", ReferralSchema);