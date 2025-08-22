import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import {
  getCardsByBoard,   // (was cardsByBoard)
  createCard,
  renameCard,
  removeCard,
  reorderCards,
} from '../controllers/cards.controller';

const router = Router();

router.get('/board/:boardId', requireAuth, getCardsByBoard);
router.post('/', requireAuth, createCard);
router.patch('/:id', requireAuth, renameCard);
router.delete('/:id', requireAuth, removeCard);
router.patch('/reorder', requireAuth, reorderCards);

export default router;
