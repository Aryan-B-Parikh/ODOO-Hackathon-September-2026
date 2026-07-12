import mongoose, { Document, Schema } from 'mongoose';

export interface CounterDocument extends Document<string> {
  _id: string; // The sequence name, e.g., 'assetTag'
  seq: number;
}

const counterSchema = new Schema<CounterDocument>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { _id: false }
);

export const CounterModel = mongoose.model<CounterDocument>('Counter', counterSchema);
