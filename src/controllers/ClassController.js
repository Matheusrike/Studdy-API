import {
	getAllClasses,
	getClassById,
	createClass,
	updateClass,
	deleteClass,
} from '../models/Class.js';
import { classSchema } from '../schemas/class.schema.js';

async function getAllClassesController(req, res) {
	try {
		const classes = await getAllClasses();
		return res.status(200).json(classes);
	} catch (error) {
		console.error('Error fetching subjects:', error);
		return res.status(500).json({ message: 'Error fetching subjects' });
	}
}

async function getClassByIdController(req, res) {
	try {
		const schoolClass = await getClassById(parseInt(req.params.classId));

		if (!schoolClass) {
			return res.status(404).json({ message: 'Subject not found' });
		}

		return res.status(200).json(schoolClass);
	} catch (error) {
		console.error('Error fetching subject:', error);
		return res.status(500).json({ message: 'Error fetching subject' });
	}
}

async function createClassController(req, res) {
	let classData;

	// Validação do payload
	try {
		classData = classSchema.parse(req.body);
	} catch (err) {
		return res.status(400).json({ message: 'Invalid request body' });
	}

	// Criação da class
	try {
		const schoolClass = await createClass(classData);
		return res.status(201).json(schoolClass);
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

async function updateClassController(req, res) {
	const classId = parseInt(req.params.classId);
	let classData;

	// Validação do payload com Zod
	try {
		classData = classSchema.parse(req.body);
	} catch (err) {
		return res.status(400).json({ message: 'Invalid request body' });
	}

	// Atualização da turma
	try {
		const updatedClass = await updateClass(classId, classData);
		return res.status(200).json(updatedClass);
	} catch (err) {
		if (err.message === 'Class not found') {
			return res.status(404).json({ message: 'Class not found' });
		}

		if (err.code === 'P2002') {
			return res
				.status(409)
				.json({ message: 'Class with same name already exists' });
		}

		if (err.message.includes('turno')) {
			return res.status(400).json({ message: err.message });
		}

		console.error('Unexpected error:', err);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
}

async function deleteClassController(req, res) {
	const classId = parseInt(req.params.classId);

	try {
		await deleteClass(classId);
		return res.status(204).send();
	} catch (err) {
		if (err.code === 'CLASS_HAS_STUDENTS') {
			return res
				.status(400)
				.json({ message: 'Cannot delete class with linked students' });
		}

		if (err.code === 'P2025') {
			// Turma não encontrada
			return res.status(404).json({ message: 'Class not found' });
		}

		return res.status(500).json({ message: 'Internal Server Error' });
	}
}

export {
	getAllClassesController,
	getClassByIdController,
	createClassController,
	updateClassController,
	deleteClassController,
};
