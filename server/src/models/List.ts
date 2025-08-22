import mongoose, { Schema, InferSchemaType } from 'mongoose';

const ListSchema = new Schema(
  {
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    ownerId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    position: { type: Number, required: true, default: 1000, index: true },
  },
  { timestamps: true }
);

export type List = InferSchemaType<typeof ListSchema>;
export default mongoose.model<List>('List', ListSchema);
