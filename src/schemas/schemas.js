import { z } from 'zod/v4';
import { validateCPF, parseBRDateToIso, isOlderThanSixYears } from './utils.js';
import { error } from 'zod/v4/locales/ar.js';

// Schema de validação de usuário
const userSchema = z.object({
	name: z.string().min(3, { error: 'Invalid Name' }),
	email: z
		.email({ error: 'Invalid e-mail format' })
		.transform((email) => email.toLocaleLowerCase()),
	password: z.string(),
	cpf: z
		.string()
		.refine((cpf) => validateCPF(cpf).formatted, { error: 'Invalid CPF' }),
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

const classSchema = z.object({
	name: z.string().min(3, { error: 'Invalid class name' }),
	shift: z.enum(['Morning', 'Afternoon', 'Evening', 'Full'], {
		error: 'Invalid shift',
	}),
	course: z.string().min(3, { error: 'Invalid course name' }),
});

const studentSchema = z.object({
	user_id: z.number().int().positive({ error: 'Invalid user id' }),
	class_id: z.number().int().positive({ error: 'Invalid class id' }),
});

export { userSchema, classSchema };
