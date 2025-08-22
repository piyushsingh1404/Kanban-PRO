import { Request, Response } from "express";
import mongoose from "mongoose";
import Card from "../models/Card";

const isId = (id: unknown): id is string =>
  typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

// GET /api/v1/cards/board/:boardId
export async function cardsByBoard(req: Request, res: Response) {
  const ownerId = req.userId || req.user?.id;
  if (!ownerId) return res.status(401).json({ message: "Unauthorized" });

  const { boardId } = req.params;
  if (!isId(boardId)) return res.status(400).json({ message: "Invalid board id" });

  const cards = await Card.find({ boardId, ownerId })
    .sort({ position: 1 })
    .lean();

  res.json({ cards });
}

// POST /api/v1/cards
export async function createCard(req: Request, res: Response) {
  const ownerId = req.userId || req.user?.id;
  if (!ownerId) return res.status(401).json({ message: "Unauthorized" });

  const { boardId, listId, title, position } = req.body ?? {};
  if (!isId(boardId) || !isId(listId)) {
    return res.status(400).json({ message: "Invalid ids" });
  }

  const t = String(title ?? "").trim();
  if (!t) return res.status(400).json({ message: "Title required" });

  const card = await Card.create({
    ownerId,
    boardId,
    listId,
    title: t,
    position: Number(position) || 1000,
  });

  res.status(201).json({ card });
}
