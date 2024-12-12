import express from 'express';
import { gameStateController } from '../controllers/gameStateController.js';

const router = express.Router();

router.get('/state', gameStateController.getState);
router.post('/state', gameStateController.updateState);
router.put('/cards/:cardId', gameStateController.updateCardPosition);

export default router;
