import { z } from 'zod/v4';
import { validateCPF } from '../utils/validateCPF.js';
import { parseBRDateToIso } from '../utils/parseDate.js';
import { isOlderThanSixYears } from '../utils/validateAge.js';

// Schema de validação de usuário
const userSchema = z.object({
	name: z.string().min(3, { error: 'Invalid Name' }),
	email: z
		.email({ error: 'Invalid e-mail format' })
		.transform((email) => email.toLocaleLowerCase()),
	password: z.string(),
	cpf: z
		.string()
		.refine((cpf) => validateCPF(cpf).valid, {
			message: 'Invalid CPF',
		})
		.transform((cpf) => validateCPF(cpf).formatted),
	birth_date: z
		.string()
		.refine((date) => parseBRDateToIso(date) !== null, {
			error: 'Invalid format, expected: dd/mm/yyyy',
		})
		.transform((date) => parseBRDateToIso(date))
		.refine((date) => isOlderThanSixYears(date), {
			error: 'The user must be a minimum of six years old.',
		}),
	role: z.enum(['Admin', 'Teacher', 'Student'], { error: 'Invalid role' }),
});

// Schema de validação de turma
const classSchema = z.object({
	name: z.string().min(3, { error: 'Invalid class name' }),
	shift: z.enum(['Morning', 'Afternoon', 'Evening', 'Full'], {
		error: 'Invalid shift',
	}),
	course: z.string().min(3, { error: 'Invalid course name' }),
});

// Schema de validação de estudante
const studentSchema = z.object({
	user_id: z.number().int().positive({ error: 'Invalid user id' }),
	class_id: z.number().int().positive({ error: 'Invalid class id' }),
});

// Schema de validação de materias
const subjectListSchema = z
	.array(z.number().int().positive())
	.min(1, { error: 'At least one subject must be provided' })
	.refine((ids) => new Set(ids).size === ids.length, {
		error: 'Subjects IDs must be unique',
	});

// Schema de validação de professor
const teacherSchema = z.object({
	subjects: subjectListSchema,
});

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

export {
	userSchema,
	classSchema,
	studentSchema,
	subjectListSchema,
	teacherSchema,
	alternativeSchema,
	questionSchema,
	quizSchema,
};
