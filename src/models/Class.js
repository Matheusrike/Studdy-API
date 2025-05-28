import prisma from '../../prisma/client.js';

async function getAllClasses() {
	return await prisma.class.findMany({
		select: {
			id: true,
			name: true,
			shift: true,
			course: true,
		},
	});
}

async function getClassById(classId) {
	try {
		const schoolClass = await prisma.class.findUnique({
			where: { id: classId },
			select: {
				id: true,
				name: true,
				shift: true,
				course: true,
			},
		});
		return schoolClass;
	} catch (error) {
		throw error;
	}
}

async function createClass(classData) {
	try {
		return await prisma.class.create({
			data: classData,
			select: {
				id: true,
				name: true,
			},
		});
	} catch (error) {
		if (error.message.includes('Invalid enum value')) {
			throw new Error(
				'O turno informado é inválido. Use: Morning, Afternoon ou Evening.',
			);
		}

		throw error;
	}
}

async function updateClass(classId, classData) {
	try {
		const updatedClass = await prisma.class.update({
			where: { id: classId },
			data: classData,
			select: {
				id: true,
				name: true,
				shift: true,
				course: true,
			},
		});
		return updatedClass;
	} catch (error) {
		if (error.code === 'P2025') {
			// ID não encontrado
			throw new Error('Class not found');
		}

		if (error.message.includes('Invalid enum value')) {
			throw new Error(
				'O turno informado é inválido. Use: Morning, Afternoon ou Evening.',
			);
		}

		throw error;
	}
}

async function deleteClass(classId) {
	try {
		// Verifica se há alunos vinculados
		const studentsCount = await prisma.student.count({
			where: { class_id: classId },
		});

		if (studentsCount > 0) {
			const error = new Error('Class has students linked');
			error.code = 'CLASS_HAS_STUDENTS';
			throw error;
		}

		// Remove a turma
		return await prisma.class.delete({
			where: { id: classId },
		});
	} catch (error) {
		throw error;
	}
}

export { getAllClasses, getClassById, createClass, updateClass, deleteClass };
