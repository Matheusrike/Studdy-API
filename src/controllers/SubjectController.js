import {
	getAllSubjects,
	getSubjectById,
	createSubject,
	updateSubject,
	deleteSubject,
} from '../models/Subject.js';
import { subjectSchema } from '../schemas/subject.schema.js';

async function getAllSubjectsController(req, res) {
	try {
		const subjects = await getAllSubjects();
		return res.status(200).json(subjects);
	} catch (error) {
		console.error('Error fetching subjects:', error);
		return res.status(500).json({ message: 'Error fetching subjects' });
	}
}

async function getSubjectByIdController(req, res) {
	try {
		const subject = await getSubjectById(parseInt(req.params.subjectId));

		if (!subject) {
			return res.status(404).json({ message: 'Subject not found' });
		}

		return res.status(200).json(subject);
	} catch (error) {
		console.error('Error fetching subject:', error);
		return res.status(500).json({ message: 'Error fetching subject' });
	}
}

async function createSubjectController(req, res) {
	let subjectData;

	// Validação do payload
	try {
		subjectData = subjectSchema.parse(req.body);
	} catch (err) {
		const message =
			err instanceof ZodError
				? err.errors[0].message
				: 'Invalid request body';
		return res.status(400).json({ message });
	}

	// Criação da subject
	try {
		const subject = await createSubject(subjectData);
		return res.status(201).json(subject);
	} catch (err) {
		// Erro de duplicação (Prisma Unique Constraint)
		if (err.code === 'P2002') {
			return res.status(409).json({ message: 'Subject already exists' });
		}
		// Erro genérico
		console.error('Unexpected error:', err);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
}

async function updateSubjectController(req, res) {
	const subject_id = parseInt(req.params.subjectId);
	let subject;

	// Validação do corpo da requisição
	try {
		subject = subjectSchema.parse(req.body);
	} catch (error) {
		const message = error.errors?.[0]?.message || 'Invalid subject data';
		return res.status(400).json({ message });
	}

	// Chamada do serviço
	try {
		const updated = await updateSubject(subject_id, subject);
		return res.status(200).json(updated);
	} catch (error) {
		const status = error.status || 500;
		const message = error.message || 'Internal server error';
		return res.status(status).json({ message });
	}
}

async function deleteSubjectController(req, res) {
	try {
		const subject_id = parseInt(req.params.subjectId);
		const deleted = await deleteSubject(subject_id);
		return res.status(200).json(deleted);
	} catch (error) {
		const status = error.status || 500;
		const message = error.message || 'Internal server error';
		return res.status(status).json({ message });
	}
}

export {
	getAllSubjectsController,
	getSubjectByIdController,
	createSubjectController,
	updateSubjectController,
	deleteSubjectController,
};
