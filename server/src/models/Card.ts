import mongoose, { Schema, InferSchemaType } from 'mongoose';

const CardSchema = new Schema(
  {
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    listId:  { type: Schema.Types.ObjectId, ref: 'List',  required: true, index: true },
    ownerId: { type: String, required: true, index: true },
    title:   { type: String, required: true, trim: true },
    position:{ type: Number, required: true, default: 1000, index: true },
  },
  { timestamps: true }
);

export type Card = InferSchemaType<typeof CardSchema>;
export default mongoose.model<Card>('Card', CardSchema);
