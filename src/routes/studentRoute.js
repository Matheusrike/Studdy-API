import express from 'express';
import { createStudentController } from '../controllers/StudentController.js';

const router = express.Router();

router.post('/', createStudentController);

export default router;
