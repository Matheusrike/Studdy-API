import { z, ZodError } from 'zod/v4';
import { generateWrongAlternatives } from '../models/Generate.js';

async function generateWrongAlternativesController(req, res) {
	let { question, correct_answer } = req.body;

	try {
		question = z.string().parse(question);
		correct_answer = z.string().parse(correct_answer);
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
		const rawResponse = await generateWrongAlternatives(
			question,
			correct_answer,
		);

		const incorrectAnswers = rawResponse.split('\n').filter(Boolean);

		res.status(200).json({ incorrectAnswers });
	} catch (error) {
		console.error(error);

		return res.status(500).json({ message: error });
	}
}

async function generateResumeController(req, res) {}

export { generateWrongAlternativesController };
