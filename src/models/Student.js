import prisma from '../../prisma/client.js';
import { studentSchema } from '../schemas/schemas.js';

async function getAllStudents() {
	try {
		const students = await prisma.student.findMany();
		return students;
	} catch (error) {
		console.error('Error fetching students:', error);
		throw error;
	}
}

async function getStudentById(id) {
	try {
		const student = await prisma.student.findUnique({
			where: { id: id },
		});

		if (!student) {
			console.error('Student not found');
			return null;
		}

		return student;
	} catch (error) {
		console.error('Error fetching student:', error);
		throw error;
	}
}

async function createStudent(studentData) {
	const validStudent = studentSchema.safeParse(studentData);

	try {
		// Verifica se os dados estão corretos
		if (validStudent.success === false) {
			console.error('Invalid student data:', validStudent.error);
			return null;
		}

		// Verifica se o usuário do aluno existe
		const user = await prisma.user.findUnique({
			where: { id: validStudent.data.user_id },
		});

		if (!user) {
			console.error('User not found');
			return null;
		}

		// Verifica se a turma do aluno existe
		const schoolClass = await prisma.class.findUnique({
			where: validStudent.data.class_id,
		});

		if (!schoolClass) {
			console.error('Class not found');
			return null;
		}

		const student = {
			...validStudent.data,
			enrollment: generateEnrollment(),
		};

		await prisma.student.create({
			data: validStudent.data,
		});
	} catch (error) {
		console.error('Error creating student:', error);
		throw error;
	}
}

export { getAllStudents, getStudentById, createStudent };
