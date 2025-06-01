import { createQuiz } from '../models/Quiz.js';
import { quizSchema } from '../schemas/quiz.schema.js';

async function createQuizController(req, res) {
	let quiz;

	// Valida o corpo da requisição
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

export { createQuizController };
