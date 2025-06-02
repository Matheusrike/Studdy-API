import {
	createQuiz,
	updateQuiz,
	updateQuizVisibility,
	deleteQuiz,
} from '../models/Quiz.js';
import { quizSchema, visibilitySchema } from '../schemas/quiz.schema.js';
import { ZodError } from 'zod/v4';

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

export {
	createQuizController,
	updateQuizController,
	updateQuizVisibilityController,
	deleteQuizController,
};
