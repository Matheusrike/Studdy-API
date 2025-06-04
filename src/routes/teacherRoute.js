import express from 'express';
import {
	getTeacherClassesController,
	getClassSubjectsByTeacherController,
	getSubjectQuizzesController,
} from '../controllers/TeacherController.js';
import {
	createQuizController,
	updateQuizController,
	updateQuizVisibilityController,
	deleteQuizController,
} from '../controllers/QuizController.js';
import {
	createVideoController,
	getAllVideosController,
	getVideoByIdController,
	updateVideoController,
	deleteVideoController,
} from '../controllers/VideoController.js';


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

// Rota para atualizar questionários
router.put(
	'/classes/:classId/subjects/:subjectId/quiz/:quizId',
	updateQuizController,
);

// Rota para atualizar a visibilidade de um questionário
router.patch('/quiz/:quizId/visibility', updateQuizVisibilityController);

// Rota para Deletar um questionário
router.delete('/quiz/:quizId', deleteQuizController);

// Rota para criar vídeos
router.post('/videos', createVideoController);

// Rota para obter todos os vídeos
router.get('/videos', getAllVideosController);

// Rota para obter um vídeo pelo ID
router.get('/videos/:videoId', getVideoByIdController);

// Rota para atualizar um vídeo
router.put('/videos/:videoId', updateVideoController);

// Rota para deletar um vídeo
router.delete('/videos/:videoId', deleteVideoController);

export default router;
