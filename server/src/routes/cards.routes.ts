import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { cardsByBoard, createCard, renameCard, removeCard, reorderCards } from '../controllers/cards.controller';

const r = Router();
r.get('/board/:boardId', requireAuth, cardsByBoard);
r.post('/', requireAuth, createCard);
r.patch('/:id', requireAuth, renameCard);
r.delete('/:id', requireAuth, removeCard);
r.patch('/reorder', requireAuth, reorderCards);
export default r;
