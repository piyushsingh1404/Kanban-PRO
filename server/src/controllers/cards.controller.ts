// server/src/controllers/cards.controller.ts
import type { Response } from 'express';
import { AuthedRequest } from '../middlewares/auth';
import Card from '../models/Card';

// GET /api/v1/cards/board/:boardId -> { cards }
export async function getCardsByBoard(req: AuthedRequest, res: Response) {
  const ownerId = req.user?.id || req.userId!;
  const { boardId } = req.params;
  const cards = await Card.find({ boardId, ownerId }).sort({ position: 1 }).lean();
  res.json({ cards });
}

// POST /api/v1/cards -> { card }
export async function createCard(req: AuthedRequest, res: Response) {
  const ownerId = req.user?.id || req.userId!;
  const { boardId, listId, title, position } = req.body ?? {};
  const card = await Card.create({
    boardId,
    listId,
    title: String(title || '').trim(),
    position: Number(position) || 1000,
    ownerId,
  });
  res.status(201).json({ card: card.toObject() });
}

// PATCH /api/v1/cards/:id -> { card }
export async function renameCard(req: AuthedRequest, res: Response) {
  const ownerId = req.user?.id || req.userId!;
  const { id } = req.params;
  const title = String(req.body?.title || '').trim();
  const card = await Card.findOneAndUpdate({ _id: id, ownerId }, { $set: { title } }, { new: true }).lean();
  if (!card) return res.status(404).json({ message: 'Card not found' });
  res.json({ card });
}

// DELETE /api/v1/cards/:id -> { ok: true }
export async function removeCard(req: AuthedRequest, res: Response) {
  const ownerId = req.user?.id || req.userId!;
  const { id } = req.params;
  const ok = await Card.findOneAndDelete({ _id: id, ownerId }).lean();
  if (!ok) return res.status(404).json({ message: 'Card not found' });
  res.json({ ok: true });
}

// PATCH /api/v1/cards/reorder -> { ok: true }
export async function reorderCards(req: AuthedRequest, res: Response) {
  const ownerId = req.user?.id || req.userId!;
  const { boardId, items } = req.body as {
    boardId: string;
    items: Array<{ cardId: string; listId: string; position: number }>;
  };

  const ops = items.map(({ cardId, listId, position }) =>
    Card.updateOne({ _id: cardId, ownerId, boardId }, { $set: { listId, position } })
  );
  await Promise.all(ops);
  res.json({ ok: true });
}
