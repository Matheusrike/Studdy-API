import prisma from '../../prisma/client.js';

async function averageCorrectResponses(student) {
	try {
		const attempts = await prisma.quiz_attempt.findMany({
			where: {
				student_id: student.id,
				status: 'completed',
			},
			include: {
				question_responses: true,
			},
		});

		const total = attempts.flatMap((a) => a.question_responses).length;
		const correct = attempts
			.flatMap((a) => a.question_responses)
			.filter((r) => r.is_correct).length;

		const accuracy = total > 0 ? (correct / total) * 100 : 0;
		return Math.round(accuracy * 100) / 100; // Arredondar para 2 casas decimais
	} catch (error) {
		throw error;
	}
}

async function availableQuizzesXCompletedQuizzes(student) {
	try {
		const availableQuizzes = await prisma.quiz.count({
			where: {
				visibility: 'public',
				teacher_subject_class: { class_id: student.class_id },
			},
		});

		const completedQuizzes = await prisma.quiz_attempt.count({
			where: {
				student_id: student.id,
				status: 'completed',
			},
		});

		return { completedQuizzes, availableQuizzes };
	} catch (error) {
		throw error;
	}
}

async function completedQuizzesBySubject(studentId) {
	try {
		const student = await prisma.student.findUnique({
			where: { id: studentId },
			select: { class_id: true },
		});

		if (!student) {
			throw new Error('Student not found');
		}

		// Buscar todas as matérias disponíveis para a turma
		const subjectsWithQuizzes =
			await prisma.relationship_teacher_subject_class.findMany({
				where: {
					class_id: student.class_id,
				},
				include: {
					teacher_subject: {
						include: {
							subject: true,
						},
					},
					quizzes: {
						where: {
							visibility: 'public',
						},
					},
				},
			});

		// Buscar quizzes completados pelo estudante
		const completedQuizzes = await prisma.quiz_attempt.findMany({
			where: {
				student_id: studentId,
				status: 'completed',
			},
			include: {
				quiz: {
					include: {
						teacher_subject_class: {
							include: {
								teacher_subject: {
									include: {
										subject: true,
									},
								},
							},
						},
					},
				},
			},
		});

		// Calcular estatísticas por matéria
		const subjectStats = subjectsWithQuizzes.map((relationshipClass) => {
			const subject = relationshipClass.teacher_subject.subject;
			const availableQuizzes = relationshipClass.quizzes.length;

			const completedQuizzesCount = completedQuizzes.filter(
				(attempt) =>
					attempt.quiz.teacher_subject_class.teacher_subject.subject
						.id === subject.id,
			).length;

			const completionPercentage =
				availableQuizzes > 0
					? Math.round(
							(completedQuizzesCount / availableQuizzes) *
								100 *
								100,
						) / 100
					: 0;

			return {
				subjectName: subject.name,
				completedQuizzes: completedQuizzesCount,
				availableQuizzes: availableQuizzes,
				completionPercentage: completionPercentage,
			};
		});

		return subjectStats;
	} catch (error) {
		throw error;
	}
}

async function timeSpentOnQuizzes(studentId) {
	try {
		const attempts = await prisma.quiz_attempt.findMany({
			where: {
				student_id: studentId,
				status: 'completed',
			},
			select: {
				started_at: true,
				finished_at: true,
			},
		});

		const totalMinutes = attempts.reduce((total, attempt) => {
			if (attempt.started_at && attempt.finished_at) {
				const startTime = new Date(attempt.started_at);
				const endTime = new Date(attempt.finished_at);
				const durationMinutes = Math.floor(
					(endTime - startTime) / (1000 * 60),
				);
				return total + (durationMinutes > 0 ? durationMinutes : 0);
			}
			return total;
		}, 0);

		return totalMinutes;
	} catch (error) {
		throw error;
	}
}

async function lastsCompletedQuizzes(studentId, limit = 5) {
	try {
		const attempts = await prisma.quiz_attempt.findMany({
			where: {
				student_id: studentId,
				status: 'completed',
			},
			include: {
				quiz: {
					include: {
						teacher_subject_class: {
							include: {
								teacher_subject: {
									include: {
										subject: true,
									},
								},
							},
						},
					},
				},
			},
			orderBy: {
				finished_at: 'desc',
			},
			take: limit,
		});

		return attempts.map((attempt) => {
			const timeSpent =
				attempt.started_at && attempt.finished_at
					? Math.floor(
							(new Date(attempt.finished_at) -
								new Date(attempt.started_at)) /
								(1000 * 60),
						)
					: 0;

			return {
				quizId: attempt.quiz.id,
				quizTitle: attempt.quiz.title,
				subjectName:
					attempt.quiz.teacher_subject_class.teacher_subject.subject
						.name,
				score: parseFloat(attempt.total_score),
				maxScore: parseFloat(attempt.quiz.max_points),
				scorePercentage:
					attempt.quiz.max_points > 0
						? Math.round(
								(attempt.total_score /
									attempt.quiz.max_points) *
									100 *
									100,
							) / 100
						: 0,
				completedAt: attempt.finished_at,
				timeSpentMinutes: timeSpent,
			};
		});
	} catch (error) {
		throw error;
	}
}

export {
	averageCorrectResponses,
	availableQuizzesXCompletedQuizzes,
	completedQuizzesBySubject,
	timeSpentOnQuizzes,
	lastsCompletedQuizzes,
};
