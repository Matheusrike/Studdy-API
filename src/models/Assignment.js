import prisma from '../../prisma/client';

// rota GET /admin/classes/:classId/assignments, Ver todas as alocações de professores da turma
async function getAssignmentsByClass(class_id) {
	try {
		const assignments =
			await prisma.relationship_teacher_subject_class.findMany({
				where: {
					class_id: class_id,
				},
				select: {
					id: true,
					teacher_subject: {
						select: {
							id: true,
							teacher: {
								select: {
									user: {
										select: {
											name: true,
										},
									},
								},
							},
							subject: {
								select: {
									name: true,
								},
							},
						},
					},
				},
			});

		if (assignments.length === 0) {
			console.error('No assignments found');
			throw new Error({
				status: 404,
				message: 'No assignments found for this class',
			});
		}

		return assignments;
	} catch (error) {
		console.error('Error getting assignments:', error);
		throw error;
	}
}

async function createAssignment(class_id, teacher_id, subject_id) {
	let teacher_subject;

	try {
		teacher_subject = await prisma.relationship_teacher_subject.findUnique({
			where: {
				teacher_id: teacher_id,
				subject_id: subject_id,
			},
			select: {
				id: true,
			},
		});
	} catch (error) {
		console.error(
			'Error consulting if teacher can lecture this subject:',
			error,
		);
		throw error;
	}

	try {
		return await prisma.relationship_teacher_subject_class.create({
			data: {
				class_id: class_id,
				teacher_subject_id: teacher_subject.id,
			},
			select: {
				id: true,
				teacher_subject: {
					select: {
						id: true,
						teacher: {
							select: {
								user: {
									select: {
										name: true,
									},
								},
							},
						},
						subject: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		});
	} catch (error) {
		console.error('Error creating assignment:', error);
		throw error;
	}
}

async function deleteAssignment(class_id, assignment_id) {
	try {
		return await prisma.relationship_teacher_subject_class.delete({
			where: {
				id: assignment_id,
				class_id: class_id,
			},
		});
	} catch (error) {
		console.error('Error deleting assignment:', error);
		throw error;
	}
}

export { getAssignmentsByClass, createAssignment, deleteAssignment };
