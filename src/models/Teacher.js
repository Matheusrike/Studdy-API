import prisma from '../../prisma/client.js';
import { teacherSchema, subjectListSchema } from '../schemas/schemas.js';
import { createUser } from './User.js';

async function getAllTeachers() {
	return await prisma.teacher.findMany({
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
			subjects: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});
}

async function getTeacherById(teacher_id) {
	try {
		return await prisma.teacher.findUnique({
			where: { id: teacher_id },
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
				subjects: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});
	} catch (error) {
		console.error('Error fetching teacher:', error);
		throw error;
	}
}

async function createTeacher(teacherData) {
	try {
		const { user, teacher } = teacherData;
		const createdTeacher = await prisma.$transaction(async (tx) => {
			// 1. Cria o usuário
			const createdUser = await createUser(user, tx);
			const user_id = createdUser.id;

			if (!user_id) {
				console.error('Error creating user while creating teacher');
				throw new Error('Error creating user while creating teacher');
			}

			const subjectIds = teacher.subjects.map((subject) => subject.id);

			// 2. Cria o professor
			const createdTeacher = await tx.teacher.create({
				data: { user_id },
			});

			// 3. Define os relacionamentos entre professor e matérias
			const teacherSubjectData = subjectIds.map((subject_id) => ({
				teacher_id: createdTeacher.id,
				subject_id,
			}));
			await tx.relationship_teacher_subject.createMany({
				data: teacherSubjectData,
			});

			// 4. Busca o professor com usuário e matérias associadas para retorno
			const teacherWithRelations = await tx.teacher.findUnique({
				where: { id: createdTeacher.id },
				select: {
					id: true,
					user_id: true,
					user: {
						select: {
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

			// 5. Formatar o retorno para ficar mais limpo (matérias apenas como array simples)
			return {
				id: teacherWithRelations.id,
				user_id: teacherWithRelations.user_id,
				user: teacherWithRelations.user,
				subjects: teacherWithRelations.teacher_subjects.map(
					(r) => r.subject,
				),
			};
		});

		return createdTeacher;
	} catch (error) {
		throw error;
	}
}

//TODO: Refatorar o update para atualizar os dados do usuário também
async function updateTeacher(teacher_id, teacherData) {
	const { subjects } = teacherData;
	try {
		return await prisma.$transaction(async (tx) => {
			// 1. Verifica se o professor existe
			const teacher = await tx.teacher.findUnique({
				where: { id: teacher_id },
				select: { id: true },
			});
			if (!teacher) {
				throw new Error('Teacher not found');
			}

			// 2. Valida o array de IDs
			const valid = subjectListSchema.safeParse(subjects);
			if (!valid.success) {
				throw new Error(valid.error.message);
			}
			const subjectIds = valid.data;

			// 3. Confere existência das matérias no banco
			const found = await tx.subject.findMany({
				where: { id: { in: subjectIds } },
				select: { id: true },
			});
			const foundIds = found.map((s) => s.id);
			if (foundIds.length !== subjectIds.length) {
				const missing = subjectIds.filter(
					(id) => !foundIds.includes(id),
				);
				throw new Error(`Invalid subject(s): ${missing.join(', ')}`);
			}

			// 4) Relações atuais
			const current = await tx.relationship_teacher_subject.findMany({
				where: { teacher_id },
				select: { subject_id: true },
			});
			const currentIds = current.map((r) => r.subject_id);

			// 5) Calcula diferenças
			const toAdd = subjectIds.filter((id) => !currentIds.includes(id));
			const toRemove = currentIds.filter(
				(id) => !subjectIds.includes(id),
			);

			// 6) Aplica remoções e inserções
			if (toRemove.length) {
				await tx.relationship_teacher_subject.deleteMany({
					where: {
						teacher_id,
						subject_id: { in: toRemove },
					},
				});
			}
			if (toAdd.length) {
				const data = toAdd.map((subject_id) => ({
					teacher_id,
					subject_id,
				}));
				await tx.relationship_teacher_subject.createMany({ data });
			}

			return { added: toAdd, removed: toRemove };
		});
	} catch (err) {
		console.error('Error updating teacher subjects:', err);
		throw err;
	}
}

async function deleteTeacherAccount(user_id) {
	try {
		const user = await prisma.user.findUnique({
			where: { id: user_id },
			select: { id: true, role: true },
		});

		if (!user) {
			console.error('User not found');
			throw new Error('User not found');
		}

		if (user.role !== 'Teacher') {
			console.error('User is not a teacher');
			throw new Error('User is not a teacher');
		}

		return await prisma.user.delete({
			where: { id: user_id },
		});
	} catch (error) {
		console.error('Error deleting user:', error);
		throw error;
	}
}

export {
	getAllTeachers,
	getTeacherById,
	createTeacher,
	updateTeacher,
	deleteTeacherAccount,
};
