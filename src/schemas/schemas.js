import { z } from 'zod/v4';

// Schema de validação de alternativa
const alternativeSchema = z.object({
	response: z
		.string()
		.min(3, { error: 'Invalid alternative' })
		.transform((alternative) => alternative.trim()),
	correct_alternative: z.boolean(),
});

// schema de validação de questão
const questionSchema = z.object({
	statement: z
		.string()
		.min(3, { error: 'Invalid statement' })
		.transform((statement) => statement.trim()),
	points: z.number().positive({ error: 'Invalid points' }),
	alternatives: z.array(alternativeSchema).min(2, {
		error: 'At least two alternatives must be provided',
	}),
});

// Schema de validação de questionário
const quizSchema = z.object({
	title: z
		.string()
		.min(3, { error: 'Invalid title' })
		.transform((title) => title.trim()),
	questions: z.array(questionSchema).min(1, {
		error: 'At least one question must be provided',
	}),
	duration_minutes: z.number().positive({ error: 'Invalid duration' }),
	max_attempts: z.number().positive({ error: 'Invalid max attempts' }),
	visibility: z.enum(['draft', 'public', 'archived'], {
		error: 'Invalid visibility',
	}),
});

const assignmentSchema = z.object({
	subject_id: z.number().int().positive({ error: 'Invalid subject id' }),
	teacher_id: z.number().int().positive({ error: 'Invalid teacher id' }),
});

export { alternativeSchema, questionSchema, quizSchema, assignmentSchema };
