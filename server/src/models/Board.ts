import mongoose, { Schema, InferSchemaType } from 'mongoose';

const BoardSchema = new Schema(
  {
    ownerId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export type Board = InferSchemaType<typeof BoardSchema>;
export default mongoose.model<Board>('Board', BoardSchema);
