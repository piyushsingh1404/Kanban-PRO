import type { Response } from 'express';
import mongoose from 'mongoose';
import { AuthedRequest } from '../middlewares/auth';
import Board from '../models/Board';

function isId(id: string | undefined) {
  return !!id && mongoose.Types.ObjectId.isValid(id);
}

// GET /api/v1/boards
export async function listBoards(req: AuthedRequest, res: Response) {
  try {
    const ownerId = req.user!.id;
    const boards = await Board.find({ ownerId }).sort({ updatedAt: -1 }).lean();
    res.json({ boards });
  } catch (e) {
    res.status(500).json({ message: 'Failed to list boards' });
  }
}

// GET /api/v1/boards/:id
export async function getBoard(req: AuthedRequest, res: Response) {
  try {
    const ownerId = req.user!.id;
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ message: 'Invalid board id' });
    const board = await Board.findOne({ _id: id, ownerId }).lean();
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.json({ board });
  } catch {
    res.status(500).json({ message: 'Failed to get board' });
  }
}

// POST /api/v1/boards { title }
export async function createBoard(req: AuthedRequest, res: Response) {
  try {
    const ownerId = req.user!.id;
    const { title } = req.body ?? {};
    const t = String(title ?? '').trim();
    if (t.length < 2) return res.status(400).json({ message: 'Title must be at least 2 characters.' });

    const board = await Board.create({ ownerId, title: t });
    res.status(201).json({ board });
  } catch {
    res.status(500).json({ message: 'Failed to create board' });
  }
}

// PATCH /api/v1/boards/:id { title }
export async function updateBoard(req: AuthedRequest, res: Response) {
  try {
    const ownerId = req.user!.id;
    const { id } = req.params;
    const t = String((req.body ?? {}).title ?? '').trim();
    if (!isId(id)) return res.status(400).json({ message: 'Invalid board id' });
    if (t.length < 2) return res.status(400).json({ message: 'Title must be at least 2 characters.' });

    const board = await Board.findOneAndUpdate(
      { _id: id, ownerId },
      { $set: { title: t } },
      { new: true }
    ).lean();

    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.json({ board });
  } catch {
    res.status(500).json({ message: 'Failed to update board' });
  }
}

// DELETE /api/v1/boards/:id
export async function deleteBoard(req: AuthedRequest, res: Response) {
  try {
    const ownerId = req.user!.id;
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ message: 'Invalid board id' });

    const ok = await Board.findOneAndDelete({ _id: id, ownerId }).lean();
    if (!ok) return res.status(404).json({ message: 'Board not found' });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: 'Failed to delete board' });
  }
}
