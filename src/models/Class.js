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

				// Alunos da turma
				students: {
					select: {
						id: true,
						enrollment: true,
						user: {
							select: {
								name: true,
								email: true,
							},
						},
					},
				},

				// Professores e matérias
				teacher_subject_classes: {
					select: {
						teacher_subject: {
							select: {
								subject: {
									select: { id: true, name: true },
								},
								teacher: {
									select: {
										id: true,
										user: {
											select: {
												name: true,
												email: true,
											},
										},
									},
								},
							},
						},
					},
				},
			},
		});

		if (!schoolClass) throw new Error('Class not found');

		// Formata os professores
		const teachers = schoolClass.teacher_subject_classes.map((item) => ({
			teacher_id: item.teacher_subject.teacher.id,
			teacher_name: item.teacher_subject.teacher.user.name,
			teacher_email: item.teacher_subject.teacher.user.email,
			subject: item.teacher_subject.subject,
		}));

		// Formata os alunos
		const students = schoolClass.students.map((s) => ({
			student_id: s.id,
			name: s.user.name,
			email: s.user.email,
			enrollment: s.enrollment,
		}));

		return {
			id: schoolClass.id,
			name: schoolClass.name,
			shift: schoolClass.shift,
			course: schoolClass.course,
			students,
			teachers,
		};
	} catch (error) {
		throw error;
	}
}

async function createClass(classData) {
	return await prisma.$transaction(async (tx) => {
		// 1. Cria a turma
		const { name, shift, course, assignments } = classData;
		const newClass = await tx.class.create({
			data: { name, shift, course },
			select: { id: true, name: true, shift: true, course: true },
		});

		// 2. Para cada assignment, valida e insere na tabela de relação
		for (const { teacher_id, subject_id } of assignments) {
			// 2.1 Verifica se o professor leciona essa matéria
			const ts = await tx.relationship_teacher_subject.findFirst({
				where: { teacher_id, subject_id },
				select: { id: true },
			});
			if (!ts) {
				throw new Error(
					`Teacher ${teacher_id} does not teach subject ${subject_id}`,
				);
			}

			// 2.2 Grava na relação class, teacher_subject
			await tx.relationship_teacher_subject_class.create({
				data: {
					class_id: newClass.id,
					teacher_subject_id: ts.id,
				},
			});
		}

		// 3. Retorna a turma criada
		return newClass;
	});
}

async function updateClass(classId, classData) {
	const { name, shift, course, assignments } = classData;

	return await prisma.$transaction(async (tx) => {
		// 1. Atualiza os dados básicos da turma
		const updatedClass = await tx.class.update({
			where: { id: classId },
			data: { name, shift, course },
			select: { id: true, name: true, shift: true, course: true },
		});

		// 2. Se vier lista de assignments, substitui os antigos
		if (Array.isArray(assignments)) {
			// 2.1 Remove todos os relacionamentos antigos dessa turma
			await tx.relationship_teacher_subject_class.deleteMany({
				where: { class_id: classId },
			});

			// 2.2 Insere os novos relacionamentos
			for (const { teacher_id, subject_id } of assignments) {
				// valida se o professor leciona a matéria
				const ts = await tx.relationship_teacher_subject.findFirst({
					where: { teacher_id, subject_id },
					select: { id: true },
				});
				if (!ts) {
					throw new Error(
						`Teacher ${teacher_id} não leciona a subject ${subject_id}`,
					);
				}

				// cria o vínculo turma ↔ teacher_subject
				await tx.relationship_teacher_subject_class.create({
					data: {
						class_id: updatedClass.id,
						teacher_subject_id: ts.id,
					},
				});
			}
		}

		return updatedClass;
	});
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
