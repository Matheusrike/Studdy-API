import express from 'express';
import {
	getStudentClassController,
	getStudentSubjectsController,
} from '../controllers/StudentController.js';

const router = express.Router();

// Rota para obter as informações da turma do aluno
router.get('/class', getStudentClassController);

// Rota para obter as matérias da turma do aluno
router.get('/subjects', getStudentSubjectsController);

export default router;
