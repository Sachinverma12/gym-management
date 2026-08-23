import mongoose, { Document, model, Schema } from "mongoose";

export interface IPayment extends Document {
  user: types.ObjectId | string;
  userId: string;
  amount: number;
  paymentDate: Date;
  method: string;
  transactionId?: string;
  notes?: string;
}

const PaymentSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [0, "Amount must be positive"],
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  method: {
    type: String,
    enum: ["cash", "card", "bank_transfer", "upi", "netbanking"],
    default: "cash",
  },
  transactionId: {
    type: String,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

export default model<IPayment>("Payment", PaymentSchema);