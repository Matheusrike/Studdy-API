import { z } from 'zod/v4';

// Schema de validação de usuário
const userSchema = z.object({
	name: z.string(),
	email: z.email(),
	cpf: z
		.string()
		.regex(/^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})$/, 'invalid CPF format'),
	birth_date: z.date(),
	role: z.enum(['Admin', 'Teacher', 'Student']),
});

export { userSchema };
