// server/src/controllers/boards.controller.ts
import type { Response } from 'express';
import { AuthedRequest } from '../middlewares/auth';
import Board from '../models/Board';

// GET /api/v1/boards
export async function listBoards(req: AuthedRequest, res: Response) {
  const ownerId = req.user?.id || req.userId!;
  const boards = await Board.find({ ownerId }).sort({ updatedAt: -1 }).lean();
  res.json({ boards });
}

// GET /api/v1/boards/:id
export async function getBoard(req: AuthedRequest, res: Response) {
  const ownerId = req.user?.id || req.userId!;
  const { id } = req.params;
  const board = await Board.findOne({ _id: id, ownerId }).lean();
  if (!board) return res.status(404).json({ message: 'Board not found' });
  res.json({ board });
}

// POST /api/v1/boards
export async function createBoard(req: AuthedRequest, res: Response) {
  const ownerId = req.user?.id || req.userId!;
  const title = String(req.body?.title || '').trim();
  if (title.length < 2) return res.status(400).json({ message: 'Title must be at least 2 characters.' });
  const board = await Board.create({ ownerId, title });
  res.status(201).json({ board: board.toObject() });
}

// PATCH /api/v1/boards/:id
export async function renameBoard(req: AuthedRequest, res: Response) {
  const ownerId = req.user?.id || req.userId!;
  const { id } = req.params;
  const title = String(req.body?.title || '').trim();
  if (title.length < 2) return res.status(400).json({ message: 'Title must be at least 2 characters.' });

  const board = await Board.findOneAndUpdate(
    { _id: id, ownerId },
    { $set: { title } },
    { new: true }
  ).lean();
  if (!board) return res.status(404).json({ message: 'Board not found' });
  res.json({ board });
}

// DELETE /api/v1/boards/:id
export async function deleteBoard(req: AuthedRequest, res: Response) {
  const ownerId = req.user?.id || req.userId!;
  const { id } = req.params;
  const ok = await Board.findOneAndDelete({ _id: id, ownerId }).lean();
  if (!ok) return res.status(404).json({ message: 'Board not found' });
  res.json({ ok: true });
}
