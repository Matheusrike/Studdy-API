import {
	createQuiz,
	updateQuiz,
	updateQuizVisibility,
	deleteQuiz,
	getQuizzesBySubject,
	startAttempt,
	changeAttemptStatus,
} from '../models/Quiz.js';
import { quizSchema, visibilitySchema } from '../schemas/quiz.schema.js';
import { ZodError } from 'zod/v4';

// Controller do /teacher
// Controller para criar um novo quiz
async function createQuizController(req, res) {
	// Valida o corpo da requisição
	let quiz;
	try {
		quiz = quizSchema.parse(req.body);
	} catch (error) {
		if (error instanceof ZodError) {
			const formatted = error['issues'].map((err) => ({
				path: err.path.join('.'),
				message: err.message,
			}));

			return res.status(400).json({
				message: 'Invalid request body',
				errors: formatted,
			});
		}
	}

	// Cria o quiz
	try {
		const created = await createQuiz(
			req.user.id,
			parseInt(req.params.classId),
			parseInt(req.params.subjectId),
			quiz,
		);
		return res.status(201).json(created);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Error creating quiz' });
	}
}

// Controller para atualizar completamente um quiz
async function updateQuizController(req, res) {
	// Valida o corpo da requisição
	let quiz;
	try {
		quiz = quizSchema.parse(req.body);
	} catch (error) {
		if (error instanceof ZodError) {
			const formatted = error['issues'].map((err) => ({
				path: err.path.join('.'),
				message: err.message,
			}));

			return res.status(400).json({
				message: 'Invalid request body',
				errors: formatted,
			});
		}
	}

	try {
		const updated = await updateQuiz(parseInt(req.params.quizId), quiz);
		return res.status(200).json(updated);
	} catch (error) {
		console.error(error);

		if (error.message.includes('not found')) {
			return res.status(404).json({ message: error.message });
		}

		return res.status(500).json({ message: 'Error updating quiz' });
	}
}

// Controller para atualizar a visibilidade de um quiz
async function updateQuizVisibilityController(req, res) {
	// Valida o corpo da requisição
	let visibility;
	try {
		visibility = visibilitySchema.parse(req.body);
	} catch (error) {
		if (error instanceof ZodError) {
			const formatted = error['issues'].map((err) => ({
				path: err.path.join('.'),
				message: err.message,
			}));

			return res.status(400).json({
				message: 'Invalid request body',
				errors: formatted,
			});
		}
	}

	try {
		const updated = await updateQuizVisibility(
			parseInt(req.params.quizId),
			visibility,
		);
		return res.status(200).json(updated);
	} catch (error) {
		console.error(error);

		if (error.message.includes('not found')) {
			return res.status(404).json({ message: error.message });
		}

		return res.status(500).json({ message: 'Error updating quiz' });
	}
}

async function deleteQuizController(req, res) {
	try {
		const quiz_id = parseInt(req.params.quizId);
		await deleteQuiz(quiz_id);
		return res.status(204).send();
	} catch (error) {
		const status = error.status || 500;
		const message = error.message || 'Internal server error';
		return res.status(status).json({ message });
	}
}

// Controllers do /student

// GET /student/subjects/:subjectId/quizzes
async function getQuizzesBySubjectController(req, res) {
	try {
		const { subjectId } = req.params;
		const userId = req.user.id; // Vem do JWT

		// Validar parâmetros
		if (!subjectId || isNaN(parseInt(subjectId))) {
			return res.status(400).json({
				message: 'subjectId is required and must be a number',
			});
		}

		// Buscar simulados
		const result = await getQuizzesBySubject(parseInt(subjectId), userId);

		return res.status(200).json({
			classInfo: result.context.classInfo,
			subjectInfo: result.context.subjectInfo,
			teacherInfo: result.context.teacherInfo,
			quizzes: result.quizzes,
			totalQuizzes: result.quizzes.length,
		});
	} catch (error) {
		console.error('Error fetching quizzes by subject:', error);

		if (error.message.includes('not found')) {
			return res.status(404).json({
				message: error.message,
			});
		}

		return res.status(500).json({
			message: 'Internal server error',
		});
	}
}

// GET /student/subjects/:subjectId/statistics
async function getSubjectStatisticsController(req, res) {
	try {
		const { subjectId } = req.params;
		const userId = req.user.id;

		// Buscar estatísticas gerais da matéria para o estudante
		const result = await getQuizzesBySubject(parseInt(subjectId), userId);

		const statistics = {
			totalQuizzes: result.quizzes.length,
			completedQuizzes: result.quizzes.filter(
				(q) => q.status === 'completed',
			).length,
			inProgressQuizzes: result.quizzes.filter(
				(q) => q.status === 'in_progress',
			).length,
			averageScore: 0,
			totalAttempts: result.quizzes.reduce(
				(sum, q) => sum + q.attempts_count,
				0,
			),
		};

		const completedQuizzes = result.quizzes.filter(
			(q) => q.best_score !== null,
		);
		if (completedQuizzes.length > 0) {
			statistics.averageScore =
				completedQuizzes.reduce((sum, q) => sum + q.best_score, 0) /
				completedQuizzes.length;
		}

		return res.status(200).json({
			...result.context,
			statistics,
		});
	} catch (error) {
		console.error('Error fetching subject statistics:', error);

		return res.status(500).json({
			message: 'Internal server error',
		});
	}
}

// POST /student/subjects/:subjectId/quizzes/:quizId/start
async function startAttemptController(req, res) {
	try {
		const { quizId } = req.params;
		const userId = req.user.id;
		const attempt = await startAttempt(parseInt(quizId), userId);
		return res.status(200).json(attempt);
	} catch (error) {
		console.error('Error starting attempt:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function changeAttemptStatusController(req, res) {
	let { status } = req.body;
	const { attemptId } = req.params;

	if ((status !== 'completed' && status !== 'abandoned') || !status) {
		return res.status(400).json({
			message: 'Invalid status, must be value completed or abandoned',
		});
	}

	try {
		const attempt = await changeAttemptStatus(parseInt(attemptId), status);

		if (!attempt) {
			return res.status(404).json({ message: 'Attempt not found' });
		}

		return res
			.status(200)
			.json({ message: 'Status changed successfully to ' + status });
	} catch (error) {
		console.error('Error changing attempt status:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

export {
	createQuizController,
	updateQuizController,
	updateQuizVisibilityController,
	deleteQuizController,
	getQuizzesBySubjectController,
	getSubjectStatisticsController,
	startAttemptController,
	getQuizDataController,
	changeAttemptStatusController,
};
