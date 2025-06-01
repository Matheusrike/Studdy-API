import express from 'express';
import {
	getTeacherClassesController,
	getClassSubjectsByTeacherController,
	getSubjectQuizzesController,
} from '../controllers/TeacherController.js';
import { createQuizController } from '../controllers/QuizController.js';

const router = express.Router();

// Rota para obter as turmas de um professor
router.get('/classes', getTeacherClassesController);

// Rota para obter as matérias que ele leciona naquela turma
router.get('/classes/:classId/subjects', getClassSubjectsByTeacherController);

// Rota para obter os quizzes de uma materia
router.get(
	'/classes/:classId/subjects/:subjectId/quizzes',
	getSubjectQuizzesController,
);

// Rota para criar questionários
router.post('/classes/:classId/subjects/:subjectId/quiz', createQuizController);

export default router;
