// server/src/routes/cards.routes.ts
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import {
  getCardsByBoard,
  createCard,
  renameCard,
  removeCard,
  reorderCards,
} from '../controllers/cards.controller';

const router = Router();

// GET cards for a board
router.get('/board/:boardId', requireAuth, getCardsByBoard);

// CRUD + reorder
router.post('/', requireAuth, createCard);
router.patch('/:id', requireAuth, renameCard);
router.delete('/:id', requireAuth, removeCard);
router.patch('/reorder', requireAuth, reorderCards);

export default router;
