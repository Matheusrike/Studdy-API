import prisma from '../../prisma/client.js';
import { createUser, updateUser } from './User.js';
import { formatDateBR } from '../utils/parseDate.js';

async function getAllTeachers() {
	const teachers = await prisma.teacher.findMany({
		select: {
			id: true,
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					birth_date: true,
					cpf: true,
					role: true,
				},
			},
			teacher_subjects: {
				select: {
					subject: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			},
		},
	});

	return teachers.map((teacher) => ({
		...teacher,
		user: {
			...teacher.user,
			birth_date: formatDateBR(teacher.user.birth_date),
		},
	}));
}

async function getTeacherById(teacherId) {
	try {
		const teacher = await prisma.teacher.findUnique({
			where: { id: teacherId },
			select: {
				id: true,
				user: {
					select: {
						name: true,
						email: true,
						birth_date: true,
						cpf: true,
						role: true,
					},
				},
				teacher_subjects: {
					select: {
						subject: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
		});

		return {
			...teacher,
			user: {
				...teacher.user,
				birth_date: formatDateBR(teacher.user.birth_date),
			},
		};
	} catch (error) {
		console.error('Error fetching teacher:', error);
		throw error;
	}
}

async function createTeacher(teacherData) {
	try {
		const { user, teacher } = teacherData;
		const createdTeacher = await prisma.$transaction(async (tx) => {
			if (user.role !== 'Teacher')
				throw new Error('User is not a teacher');

			const createdUser = await createUser(user, tx);
			const user_id = createdUser.id;

			if (!user_id) throw new Error('Error creating user');

			const subjectIds = teacher.subjects.map((subject) => subject.id);

			const createdTeacher = await tx.teacher.create({
				data: { user_id },
			});

			await tx.relationship_teacher_subject.createMany({
				data: subjectIds.map((subject_id) => ({
					teacher_id: createdTeacher.id,
					subject_id,
				})),
			});

			const teacherWithRelations = await tx.teacher.findUnique({
				where: { id: createdTeacher.id },
				select: {
					id: true,
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							cpf: true,
							birth_date: true,
							role: true,
						},
					},
					teacher_subjects: {
						select: {
							subject: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
				},
			});

			return {
				id: teacherWithRelations.id,
				user_id: teacherWithRelations.user_id,
				user: {
					...teacherWithRelations.user,
					birth_date: formatDateBR(
						teacherWithRelations.user.birth_date,
					),
				},
				subjects: teacherWithRelations.teacher_subjects.map(
					(r) => r.subject,
				),
			};
		});

		return createdTeacher;
	} catch (error) {
		if (error.code === 'P2002') {
			const target = error.meta?.target;
			let message = 'Dados duplicados.';

			if (target?.includes('email'))
				message = 'O e-mail informado já está em uso.';
			else if (target?.includes('cpf'))
				message = 'O CPF informado já está em uso.';

			throw new Error(message);
		}
		throw error;
	}
}

async function updateTeacher(teacherId, teacherData) {
	const { user, teacher } = teacherData;

	try {
		if (user.role !== 'Teacher') throw new Error('User is not a teacher');

		const updatedTeacher = await prisma.$transaction(async (tx) => {
			const existingTeacher = await tx.teacher.findUnique({
				where: { id: teacherId },
			});
			if (!existingTeacher) throw new Error('Teacher not found');

			if (user) await updateUser(tx, existingTeacher.user_id, user);

			if (teacher?.subjects) {
				const subjectIds = teacher.subjects.map((s) => s.id);

				await tx.relationship_teacher_subject.deleteMany({
					where: { teacher_id: teacherId },
				});

				await tx.relationship_teacher_subject.createMany({
					data: subjectIds.map((subject_id) => ({
						teacher_id: teacherId,
						subject_id,
					})),
				});
			}

			const teacherWithRelations = await tx.teacher.findUnique({
				where: { id: teacherId },
				select: {
					id: true,
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							cpf: true,
							birth_date: true,
							role: true,
						},
					},
					teacher_subjects: {
						select: {
							subject: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
				},
			});

			return {
				id: teacherWithRelations.id,
				user_id: teacherWithRelations.user_id,
				user: {
					...teacherWithRelations.user,
					birth_date: formatDateBR(
						teacherWithRelations.user.birth_date,
					),
				},
				subjects: teacherWithRelations.teacher_subjects.map(
					(r) => r.subject,
				),
			};
		});
		return updatedTeacher;
	} catch (error) {
		if (error.code === 'P2002') {
			const target = error.meta?.target;
			let message = 'Dados duplicados.';

			if (target?.includes('email'))
				message = 'O e-mail informado já está em uso.';
			else if (target?.includes('cpf'))
				message = 'O CPF informado já está em uso.';

			throw new Error(message);
		}

		throw error;
	}
}

async function deleteTeacher(teacherId) {
	try {
		const teacher = await prisma.teacher.findUnique({
			where: { id: teacherId },
			select: {
				user: {
					select: {
						id: true,
						role: true,
					},
				},
			},
		});

		if (!teacher) throw new Error('Teacher not found');

		return await prisma.user.delete({
			where: { id: teacher.user.id },
		});
	} catch (error) {
		throw error;
	}
}

export {
	getAllTeachers,
	getTeacherById,
	createTeacher,
	updateTeacher,
	deleteTeacher,
};
