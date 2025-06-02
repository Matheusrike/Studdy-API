import express from 'express';
import {
	generateResumeController,
	generateWrongAlternativesController,
} from '../controllers/GenerateController.js';
import authenticated from '../middlewares/authenticated.js';
import authorizeRole from '../middlewares/authorizeRole.js';

const router = express.Router();

// Rota para gerar resumos
router.post(
	'/resume',
	authenticated,
	authorizeRole('teacher'),
	generateResumeController,
);

// Rota para gerar alternativas erradas
router.post(
	'/wrong-alternatives',
	authenticated,
	authorizeRole('teacher'),
	generateWrongAlternativesController,
);
export default router;
