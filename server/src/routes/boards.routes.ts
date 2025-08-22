import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { listBoards, getBoard, createBoard, updateBoard, deleteBoard } from '../controllers/boards.controller';

const r = Router();
r.get('/', requireAuth, listBoards);
r.get('/:id', requireAuth, getBoard);      // ← add this
r.post('/', requireAuth, createBoard);
r.patch('/:id', requireAuth, updateBoard);
r.delete('/:id', requireAuth, deleteBoard);
export default r;
