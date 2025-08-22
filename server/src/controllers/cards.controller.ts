import type { Response } from 'express';
import mongoose from 'mongoose';
import { AuthedRequest } from '../middlewares/auth';
import Card from '../models/Card';

const isId = (id?: string) => !!id && mongoose.Types.ObjectId.isValid(id);

// GET /api/v1/cards/board/:boardId
export async function cardsByBoard(req: AuthedRequest, res: Response) {
  const ownerId = req.user!.id;
  const { boardId } = req.params;
  if (!isId(boardId)) return res.status(400).json({ message: 'Invalid board id' });
  const cards = await Card.find({ boardId, ownerId }).sort({ position: 1 }).lean();
  res.json({ cards });
}

// POST /api/v1/cards  { boardId, listId, title, position }
export async function createCard(req: AuthedRequest, res: Response) {
  const ownerId = req.user!.id;
  const { boardId, listId, title, position } = req.body ?? {};
  if (!isId(boardId) || !isId(listId)) return res.status(400).json({ message: 'Invalid ids' });
  const t = String(title ?? '').trim();
  if (!t) return res.status(400).json({ message: 'Title required' });

  const card = await Card.create({ ownerId, boardId, listId, title: t, position: Number(position) || 1000 });
  res.status(201).json({ card });
}

// PATCH /api/v1/cards/:id  { title }
export async function renameCard(req: AuthedRequest, res: Response) {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const t = String((req.body ?? {}).title ?? '').trim();
  if (!isId(id)) return res.status(400).json({ message: 'Invalid card id' });
  if (!t) return res.status(400).json({ message: 'Title required' });

  const card = await Card.findOneAndUpdate({ _id: id, ownerId }, { $set: { title: t } }, { new: true }).lean();
  if (!card) return res.status(404).json({ message: 'Card not found' });
  res.json({ card });
}

// DELETE /api/v1/cards/:id
export async function removeCard(req: AuthedRequest, res: Response) {
  const ownerId = req.user!.id;
  const { id } = req.params;
  if (!isId(id)) return res.status(400).json({ message: 'Invalid card id' });

  const card = await Card.findOneAndDelete({ _id: id, ownerId }).lean();
  if (!card) return res.status(404).json({ message: 'Card not found' });
  res.json({ ok: true });
}

// PATCH /api/v1/cards/reorder  { boardId, items: [{ cardId, listId, position }] }
export async function reorderCards(req: AuthedRequest, res: Response) {
  const ownerId = req.user!.id;
  const { boardId, items } = req.body ?? {};
  if (!isId(boardId)) return res.status(400).json({ message: 'Invalid board id' });
  if (!Array.isArray(items)) return res.status(400).json({ message: 'Items required' });

  const ops = items.map((it: any) => ({
    updateOne: {
      filter: { _id: it.cardId, ownerId },
      update: { $set: { listId: it.listId, position: Number(it.position) || 1000, boardId } },
    },
  }));
  if (ops.length) await Card.bulkWrite(ops);
  res.json({ ok: true });
}
