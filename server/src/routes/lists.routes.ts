import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import {
  getListsByBoard,  // (was listsByBoard)
  createList,
  renameList,
  removeList,
  reorderLists,
} from '../controllers/lists.controller';

const router = Router();

router.get('/board/:boardId', requireAuth, getListsByBoard);
router.post('/', requireAuth, createList);
router.patch('/:id', requireAuth, renameList);
router.delete('/:id', requireAuth, removeList);
router.patch('/reorder', requireAuth, reorderLists);

export default router;
