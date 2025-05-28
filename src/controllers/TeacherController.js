import {
	getAllTeachers,
	getTeacherById,
	createTeacher,
	updateTeacher,
	deleteTeacher,
} from '../models/Teacher.js';
import { teacherSchema } from '../schemas/teacher.schema.js';

async function getAllTeachersController(req, res) {
	try {
		const teachers = await getAllTeachers();
		return res.status(200).json(teachers);
	} catch (error) {
		console.error('Error fetching teachers:', error);
		return res.status(500).json({ message: 'Error fetching teachers' });
	}
}

async function getTeacherByIdController(req, res) {
	try {
		const teacher = await getTeacherById(parseInt(req.params.teacherId));

		if (!teacher) {
			return res.status(404).json({ message: 'Teacher not found' });
		}

		return res.status(200).json(teacher);
	} catch (error) {
		console.error('Error fetching teacher:', error);
		return res.status(500).json({ message: 'Error fetching teacher' });
	}
}

async function createTeacherController(req, res) {
	let teacher;

	try {
		teacher = teacherSchema.parse(req.body);
	} catch (error) {
		return res.status(400).json({ message: 'Invalid request body' });
	}

	try {
		const created = await createTeacher(teacher);
		return res.status(201).json(created);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
}

async function updateTeacherController(req, res) {
	let teacher;

	try {
		teacher = teacherSchema.parse(req.body);
	} catch (error) {
		return res.status(400).json({ message: 'Invalid request body' });
	}

	try {
		const updated = await updateTeacher(
			parseInt(req.params.teacherId),
			teacher,
		);
		return res.status(200).json(updated);
	} catch (error) {
		console.error('Error updating teacher:', error);
		return res.status(500).json({ message: 'Error updating teacher' });
	}
}

async function deleteTeacherController(req, res) {
	const id = req.params.teacherId;

	try {
		// Verifica se o id é número válido
		const teacherId = parseInt(id);
		if (isNaN(teacherId) || teacherId <= 0) {
			return res.status(400).json({ error: 'ID do professor inválido.' });
		}

		// Executa a deleção no model
		await deleteTeacher(teacherId);

		// Retorna sucesso
		return res
			.status(200)
			.json({ message: 'Professor deletado com sucesso.' });
	} catch (error) {
		console.error('Erro no deleteTeacherController:', error);

		// Erro customizado para professor não encontrado
		if (error.message.includes('não encontrado')) {
			return res.status(404).json({ error: error.message });
		}

		// Erro de usuário não ser professor
		if (error.message.includes('não é um professor')) {
			return res.status(400).json({ error: error.message });
		}

		// Erros inesperados
		return res.status(500).json({ error: 'Erro interno no servidor.' });
	}
}

export {
	getAllTeachersController,
	getTeacherByIdController,
	createTeacherController,
	updateTeacherController,
	deleteTeacherController,
};
