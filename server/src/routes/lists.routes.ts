import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { listsByBoard, createList, renameList, removeList, reorderLists } from '../controllers/lists.controller';

const r = Router();
r.get('/board/:boardId', requireAuth, listsByBoard);
r.post('/', requireAuth, createList);
r.patch('/:id', requireAuth, renameList);
r.delete('/:id', requireAuth, removeList);
r.patch('/reorder', requireAuth, reorderLists);
export default r;
