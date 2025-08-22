import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import {
  listBoards,
  getBoard,
  createBoard,
  renameBoard,   // <-- PATCH handler
  deleteBoard,
} from '../controllers/boards.controller';

const router = Router();

router.get('/', requireAuth, listBoards);
router.get('/:id', requireAuth, getBoard);
router.post('/', requireAuth, createBoard);
router.patch('/:id', requireAuth, renameBoard); // (was updateBoard)
router.delete('/:id', requireAuth, deleteBoard);

export default router;
