import type { Response } from 'express';
import mongoose from 'mongoose';
import { AuthedRequest } from '../middlewares/auth';
import List from '../models/List';

const isId = (id?: string) => !!id && mongoose.Types.ObjectId.isValid(id);

// GET /api/v1/lists/board/:boardId
export async function listsByBoard(req: AuthedRequest, res: Response) {
  const ownerId = req.user!.id;
  const { boardId } = req.params;
  if (!isId(boardId)) return res.status(400).json({ message: 'Invalid board id' });
  const lists = await List.find({ boardId, ownerId }).sort({ position: 1 }).lean();
  res.json({ lists });
}

// POST /api/v1/lists  { boardId, name, position }
export async function createList(req: AuthedRequest, res: Response) {
  const ownerId = req.user!.id;
  const { boardId, name, position } = req.body ?? {};
  if (!isId(boardId)) return res.status(400).json({ message: 'Invalid board id' });
  const n = String(name ?? '').trim();
  if (n.length < 2) return res.status(400).json({ message: 'Name must be at least 2 chars' });

  const list = await List.create({ ownerId, boardId, name: n, position: Number(position) || 1000 });
  res.status(201).json({ list });
}

// PATCH /api/v1/lists/:id  { name }
export async function renameList(req: AuthedRequest, res: Response) {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const n = String((req.body ?? {}).name ?? '').trim();
  if (!isId(id)) return res.status(400).json({ message: 'Invalid list id' });
  if (n.length < 2) return res.status(400).json({ message: 'Name must be at least 2 chars' });

  const list = await List.findOneAndUpdate({ _id: id, ownerId }, { $set: { name: n } }, { new: true }).lean();
  if (!list) return res.status(404).json({ message: 'List not found' });
  res.json({ list });
}

// DELETE /api/v1/lists/:id
export async function removeList(req: AuthedRequest, res: Response) {
  const ownerId = req.user!.id;
  const { id } = req.params;
  if (!isId(id)) return res.status(400).json({ message: 'Invalid list id' });

  const list = await List.findOneAndDelete({ _id: id, ownerId }).lean();
  if (!list) return res.status(404).json({ message: 'List not found' });
  res.json({ ok: true });
}

// PATCH /api/v1/lists/reorder  { boardId, items: [{ listId, position }] }
export async function reorderLists(req: AuthedRequest, res: Response) {
  const ownerId = req.user!.id;
  const { boardId, items } = req.body ?? {};
  if (!isId(boardId)) return res.status(400).json({ message: 'Invalid board id' });
  if (!Array.isArray(items)) return res.status(400).json({ message: 'Items required' });

  const ops = items.map((it: any) => ({
    updateOne: {
      filter: { _id: it.listId, boardId, ownerId },
      update: { $set: { position: Number(it.position) || 1000 } },
    },
  }));
  if (ops.length) await List.bulkWrite(ops);
  res.json({ ok: true });
}
