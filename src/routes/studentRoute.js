import express from 'express';
import {
	getStudentClassController,
	getStudentSubjectsController,
	getStudentQuizzesController,
} from '../controllers/StudentController.js';
import {
	getQuizzesBySubjectController,
	getSubjectStatisticsController,
	startAttemptController,
	changeAttemptStatusController,
	submitQuizController,
	getQuizAttemptResponsesController,
} from '../controllers/QuizController.js';

const router = express.Router();

// Rota para obter as informações da turma do aluno
router.get('/class', getStudentClassController);

// Rota para obter as matérias da turma do aluno
router.get('/subjects', getStudentSubjectsController);

// Rota para obter todos os quizzes
router.get('/quizzes', getStudentQuizzesController);

// Rota para obter os quizzes de uma materia
router.get('/subjects/:subjectId/quizzes', getQuizzesBySubjectController);

// Rota para obter as estatísticas de uma materia
router.get('/subjects/:subjectId/statistics', getSubjectStatisticsController);

// Rota para iniciar uma tentativa
router.post(
	'/subjects/:subjectId/quizzes/:quizId/start',
	startAttemptController,
);

// rota para atualizar o status da tentativa
router.put('/attempt/:attemptId', changeAttemptStatusController);

// rota para enviar respostas
router.post('/attempt/:attemptId/submit', submitQuizController);

// rota para obter as respostas de uma tentativa
router.get('/attempt/:attemptId/responses', getQuizAttemptResponsesController);

export default router;
