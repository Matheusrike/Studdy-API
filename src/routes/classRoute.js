import express from 'express';
import { createClassController } from '../controllers/ClassController.js';

const router = express.Router();

router.post('/', createClassController);

export default router;
