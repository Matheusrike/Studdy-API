import prisma from '../../prisma/client.js';
import { studentSchema } from '../schemas/schemas.js';
import { createUser } from './User.js';
import { generateEnrollment } from '../utils/generateEnrollment.js';

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
	try {
		const { user, student } = studentData;
		await prisma.$transaction(async (tx) => {
			// 1. Cria o usuário
			const user_id = await createUser(user, tx).then(
				(createdUser) => createdUser.id,
			);

			if (!user_id) {
				console.error('Error creating user while creating student');
				throw new Error('Error creating user while creating student');
			}

			// 2. valida os dados
			const validStudent = studentSchema.safeParse({
				user_id,
				class_id: student.class_id,
			});

			if (!validStudent.success) {
				console.error('Invalid student data:', validStudent.error);
				throw new Error('Invalid student data:', validStudent.error);
			}

			// 3. Verifica se a turma do aluno existe
			const schoolClass = await tx.class.findUnique({
				where: { id: validStudent.data.class_id },
			});

			if (!schoolClass) {
				console.error('Class not found while creating student');
				throw new Error('Class not found while creating student');
			}

			// 4. Cria o aluno
			const studentData = {
				...validStudent.data,
				enrollment: generateEnrollment(validStudent.data.user_id),
			};

			await tx.student.create({
				data: studentData,
			});
		});
	} catch (error) {
		console.error('Error creating student:', error);
		throw error;
	}
}

export { getAllStudents, getStudentById, createStudent };
