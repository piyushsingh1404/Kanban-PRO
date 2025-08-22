import { Request, Response } from "express";
import mongoose from "mongoose";
import List from "../models/List";

const isId = (id: unknown): id is string =>
  typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

// GET /api/v1/lists/board/:boardId
export async function listsByBoard(req: Request, res: Response) {
  const ownerId = req.userId || req.user?.id;
  if (!ownerId) return res.status(401).json({ message: "Unauthorized" });

  const { boardId } = req.params;
  if (!isId(boardId)) return res.status(400).json({ message: "Invalid board id" });

  const lists = await List.find({ boardId, ownerId })
    .sort({ position: 1 })
    .lean();

  res.json({ lists });
}

// POST /api/v1/lists
export async function createList(req: Request, res: Response) {
  const ownerId = req.userId || req.user?.id;
  if (!ownerId) return res.status(401).json({ message: "Unauthorized" });

  const { boardId, name, position } = req.body ?? {};
  if (!isId(boardId)) return res.status(400).json({ message: "Invalid board id" });

  const n = String(name ?? "").trim();
  if (!n) return res.status(400).json({ message: "Name required" });

  const list = await List.create({
    ownerId,
    boardId,
    name: n,
    position: Number(position) || 1000,
  });

  res.status(201).json({ list });
}
