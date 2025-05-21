import { z } from 'zod/v4';

// Validação de CPF
function validateCPF(rawCPF) {
	if (!rawCPF) {
		return { valid: false };
	}

	const digits = String(rawCPF).replace(/\D/g, '');

	if (!/^\d{11}$/.test(digits)) return { valid: false };

	if (/^(\d)\1{10}$/.test(digits)) return { valid: false };

	const calcCheckDigit = (base, factor) => {
		const total = base
			.split('')
			.reduce((sum, num, i) => sum + Number(num) * (factor - i), 0);
		const remainder = total % 11;
		return remainder < 2 ? 0 : 11 - remainder;
	};

	const baseNine = digits.slice(0, 9);
	const digit1 = calcCheckDigit(baseNine, 10);
	const digit2 = calcCheckDigit(baseNine + digit1, 11);
	const isValid = digits === baseNine + digit1 + digit2;

	return {
		valid: isValid,
		formatted: isValid
			? `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
			: undefined,
	};
}

// Converte uma data de dd/mm/yyyy para DateTime
function parseBRDateToIso(rawDate) {
	const [day, month, year] = rawDate.split('/');
	if (!day || !month || !year) return null;

	const isoString = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
	const date = new Date(isoString);

	// Verifica se a data é válida
	if (isNaN(date.getTime())) return null;

	return date;
}

// Valida se o usuário é maior que seis anos
function isOlderThanSixYears(date) {
	const today = new Date();

	let age = today.getFullYear() - date.getFullYear();
	const monthDiff = today.getMonth() - date.getMonth();
	const dayDiff = today.getDate() - date.getDate();

	if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
		age--;
	}

	return age >= 6;
}

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

export { userSchema };
