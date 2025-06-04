import prisma from '../../prisma/client.js';
import { createQuestion } from './Question.js';

// Busca os quizzes relacionados ao professor, turma e disciplina
async function getQuizzesOfTeacher(userId, classId, subjectId) {
	try {
		const teacher = await prisma.teacher.findUnique({
			where: { user_id: userId },
			select: { id: true },
		});

		if (!teacher) {
			throw new Error('Teacher not found');
		}

		// Busca os quizzes relacionados ao professor, turma e disciplina
		const quizzes = await prisma.quiz.findMany({
			where: {
				teacher_subject_class: {
					class: { id: classId },
					teacher_subject: {
						subject: { id: subjectId },
						teacher_id: teacher.id,
					},
				},
			},
			select: {
				id: true,
				title: true,
				description: true,
				icon: true,
				duration_minutes: true,
				visibility: true,
			},
		});

		return quizzes;
	} catch (error) {
		throw error;
	}
}

// Cria um novo quiz
async function createQuiz(userId, classId, subjectId, quizData) {
	try {
		const teacher = await prisma.teacher.findUnique({
			where: { user_id: userId },
			select: { id: true },
		});

		if (!teacher) {
			throw new Error('Teacher not found');
		}

		// Adiciona o professor, turma e disciplina ao objeto quiz
		const quiz = {
			...quizData,
			teacher_subject_class_id:
				await prisma.relationship_teacher_subject_class
					.findFirst({
						where: {
							class_id: classId,
							teacher_subject: {
								subject_id: subjectId,
								teacher_id: teacher.id,
							},
						},
						select: { id: true },
					})
					.then((result) => result.id),
		};

		// Realiza uma transação para criar o quiz
		return await prisma.$transaction(async (tx) => {
			// Calcula o total de pontos com base nos pontos das questões
			let totalPoints = 0;
			quiz.questions.forEach((question) => {
				totalPoints += question.points;
			});

			// Cria o quiz na tabela Quiz
			const createdQuiz = await tx.quiz.create({
				data: {
					title: quiz.title,
					description: quiz.description,
					icon: quiz.icon,
					duration_minutes: quiz.duration_minutes,
					max_points: totalPoints,
					max_attempt: quiz.max_attempts,
					visibility: quiz.visibility || 'draft',
					teacher_subject_class_id: quiz.teacher_subject_class_id,
				},
			});

			// Para cada questão, cria a questão na tabela Question
			for (const questionData of quiz.questions) {
				await createQuestion(tx, questionData, createdQuiz.id);
			}

			// Retorna o quiz criado
			return createdQuiz;
		});
	} catch (error) {
		console.log(error);
		throw error;
	}
}

// Atualiza completamente um quiz
async function updateQuiz(quizId, quizData) {
	try {
		const quiz = await prisma.quiz.findUnique({
			where: { id: quizId },
			select: { id: true },
		});

		if (!quiz) {
			throw new Error('Quiz not found');
		}

		return await prisma.$transaction(async (tx) => {
			// 1. Coleta IDs das questões antigas
			const oldQuestions = await tx.question.findMany({
				where: { quiz_id: quizId },
				select: { id: true },
			});

			// 2. Apaga todas as alternativas associadas
			for (const question of oldQuestions) {
				await tx.alternative.deleteMany({
					where: { question_id: question.id },
				});
			}

			// 3. Apaga todas as questões antigas
			await tx.question.deleteMany({
				where: { quiz_id: quizId },
			});

			// 4. Recalcula total de pontos
			const totalPoints = quizData.questions.reduce(
				(sum, q) => sum + q.points,
				0,
			);

			// 5. Atualiza apenas os campos mutáveis do quiz
			const updatedQuiz = await tx.quiz.update({
				where: { id: quizId },
				data: {
					title: quizData.title,
					description: quizData.description,
					icon: quizData.icon,
					duration_minutes: quizData.duration_minutes,
					max_points: totalPoints,
					max_attempt: quizData.max_attempts,
					visibility: quizData.visibility || 'draft',
				},
			});

			// 6. Insere as novas questões e alternativas
			for (const questionData of quizData.questions) {
				await createQuestion(tx, questionData, updatedQuiz.id);
			}

			return updatedQuiz;
		});
	} catch (error) {
		throw error;
	}
}

// Atualiza a visibilidade de um quiz
async function updateQuizVisibility(quizId, visibility) {
	try {
		const updated = await prisma.quiz.update({
			where: { id: quizId },
			data: { visibility: visibility.visibility },
			select: {
				id: true,
				title: true,
				duration_minutes: true,
				visibility: true,
			},
		});

		if (!updated) {
			throw new Error('Quiz not found');
		}

		return updated;
	} catch (error) {
		throw error;
	}
}

// Deleta um quiz
async function deleteQuiz(quizId) {
	try {
		const deleted = await prisma.quiz.delete({
			where: { id: quizId },
		});

		return deleted;
	} catch (error) {
		throw error;
	}
}

// Consumir quizzes (Estudante)
// Buscar informações de contexto (turma, matéria, professor)
async function getStudentSubjectClassContext(subjectId, userId) {
	try {
		const context = await prisma.student.findUnique({
			where: { user_id: userId },
			include: {
				class: {
					include: {
						teacher_subject_classes: {
							where: {
								teacher_subject: {
									subject_id: subjectId,
								},
							},
							include: {
								teacher_subject: {
									include: {
										subject: true,
										teacher: {
											include: {
												user: {
													select: {
														name: true,
													},
												},
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

		if (!context || context.class.teacher_subject_classes.length === 0) {
			return null;
		}

		const teacherSubjectClass = context.class.teacher_subject_classes[0];

		return {
			classInfo: {
				id: context.class.id,
				name: context.class.name,
				shift: context.class.shift,
				course: context.class.course,
			},
			subjectInfo: {
				id: teacherSubjectClass.teacher_subject.subject.id,
				name: teacherSubjectClass.teacher_subject.subject.name,
			},
			teacherInfo: {
				id: teacherSubjectClass.teacher_subject.teacher.id,
				name: teacherSubjectClass.teacher_subject.teacher.user.name,
			},
			teacherSubjectClassId: teacherSubjectClass.id,
		};
	} catch (error) {
		throw new Error(
			`Error getting student subject class context: ${error.message}`,
		);
	}
}

// Buscar todos os simulados de uma matéria para um estudante
async function getQuizzesBySubject(subjectId, userId) {
	try {
		// Primeiro, encontrar o teacher_subject_class_id
		const context = await getStudentSubjectClassContext(subjectId, userId);

		if (!context) {
			throw new Error('Student not found on this subject');
		}

		const student = await prisma.student.findUnique({
			where: { user_id: userId },
		});

		// Buscar simulados com informações agregadas
		const quizzes = await prisma.quiz.findMany({
			where: {
				teacher_subject_class_id: context.teacherSubjectClassId,
				visibility: 'public',
			},
			include: {
				_count: {
					select: {
						questions: true,
					},
				},
				quiz_attempts: {
					where: {
						student_id: student.id,
					},
					orderBy: {
						created_at: 'desc',
					},
				},
			},
			orderBy: {
				created_at: 'desc',
			},
		});

		// Processar dados dos simulados com status do estudante
		const processedQuizzes = quizzes.map((quiz) => {
			const attempts = quiz.quiz_attempts;
			const completedAttempts = attempts.filter(
				(attempt) => attempt.status === 'completed',
			);
			const inProgressAttempt = attempts.find(
				(attempt) => attempt.status === 'in_progress',
			);

			let status = 'available';
			if (inProgressAttempt) {
				status = 'in_progress';
			} else if (completedAttempts.length > 0) {
				status = 'completed';
			}

			const bestScore =
				completedAttempts.length > 0
					? Math.max(
							...completedAttempts.map((attempt) =>
								parseFloat(attempt.total_score),
							),
						)
					: null;

			const lastAttemptDate =
				attempts.length > 0
					? attempts[0].finished_at || attempts[0].started_at
					: null;

			return {
				id: quiz.id,
				title: quiz.title,
				description: quiz.description,
				icon: quiz.icon,
				duration_minutes: quiz.duration_minutes,
				max_points: parseFloat(quiz.max_points),
				max_attempt: quiz.max_attempt,
				total_questions: quiz._count.questions,
				created_at: quiz.created_at,
				// Status do estudante
				attempts_count: attempts.length,
				completed_attempts_count: completedAttempts.length,
				best_score: bestScore,
				last_attempt_date: lastAttemptDate,
				status: status,
				in_progress_attempt_id: inProgressAttempt?.id || null,
			};
		});

		return {
			context,
			quizzes: processedQuizzes,
		};
	} catch (error) {
		throw new Error(`Error getting student quizzes: ${error.message}`);
	}
}

// inicia uma tentativa
async function startAttempt(quizId, userId) {
	try {
		const student = await prisma.student.findUnique({
			where: { user_id: userId },
		});

		if (!student) {
			throw new Error('Student not found');
		}

		const quiz = await prisma.quiz.findUnique({
			where: { id: quizId },
			select: {
				id: true,
				title: true,
				description: true,
				icon: true,
				duration_minutes: true,
				max_points: true,
				max_attempt: true,
				questions: {
					select: {
						id: true,
						statement: true,
						points: true,
						alternatives: {
							select: {
								id: true,
								response: true,
							},
						},
					},
				},
			},
		});

		if (!quiz) {
			throw new Error('Quiz not found');
		}

		const startedAttempt = await prisma.quiz_attempt.create({
			data: {
				quiz_id: quizId,
				student_id: student.id,
				total_score: 0,
				status: 'in_progress',
			},
			select: {
				id: true,
				quiz_id: true,
				student_id: true,
				status: true,
			},
		});

		return quiz;
	} catch (error) {
		throw error;
	}
}

async function changeAttemptStatus(attemptId, status) {
	try {
		const updatedAttempt = await prisma.quiz_attempt.update({
			where: { id: attemptId },
			data: { status: status },
		});
		return updatedAttempt;
	} catch (error) {
		throw error;
	}
}

// Busca um quiz específico com suas questões e alternativas
async function getQuizWithQuestions(userId, classId, subjectId, quizId) {
	try {
		const teacher = await prisma.teacher.findUnique({
			where: { user_id: userId },
			select: { id: true },
		});

		if (!teacher) {
			throw new Error('Teacher not found');
		}

		// Busca o quiz específico com suas questões e alternativas
		const quiz = await prisma.quiz.findFirst({
			where: {
				id: quizId,
				teacher_subject_class: {
					class: { id: classId },
					teacher_subject: {
						subject: { id: subjectId },
						teacher_id: teacher.id,
					},
				},
			},
			select: {
				id: true,
				title: true,
				description: true,
				icon: true,
				duration_minutes: true,
				visibility: true,
				questions: {
					select: {
						id: true,
						statement: true,
						points: true,
						alternatives: {
							select: {
								id: true,
								response: true,
								correct_alternative: true,
							},
						},
					},
				},
			},
		});

		if (!quiz) {
			throw new Error('Quiz not found');
		}

		return quiz;
	} catch (error) {
		throw error;
	}
}

// Busca um quiz específico por ID (para acesso geral)
async function getQuizById(quizId) {
	try {
		const quiz = await prisma.quiz.findUnique({
			where: { id: quizId },
			select: {
				id: true,
				title: true,
				description: true,
				icon: true,
				duration_minutes: true,
				visibility: true,
				questions: {
					select: {
						id: true,
						statement: true,
						points: true,
						alternatives: {
							select: {
								id: true,
								response: true,
								correct_alternative: true,
							},
						},
					},
				},
			},
		});

		if (!quiz) {
			throw new Error('Quiz not found');
		}

		return quiz;
	} catch (error) {
		throw error;
	}
}

// Buscar todos os quizzes da turma do aluno
async function getAllQuizzesForStudent(userId) {
	try {
		// Primeiro, buscar o student para obter o ID
		const student = await prisma.student.findUnique({
			where: { user_id: userId },
			select: { id: true },
		});

		if (!student) {
			throw new Error('Student not found');
		}

		// Agora buscar os dados completos com o student.id
		const studentWithClass = await prisma.student.findUnique({
			where: { user_id: userId },
			include: {
				class: {
					include: {
						teacher_subject_classes: {
							include: {
								teacher_subject: {
									include: {
										subject: true,
										teacher: {
											include: {
												user: {
													select: {
														name: true,
													},
												},
											},
										},
									},
								},
								quizzes: {
									where: {
										visibility: 'public',
									},
									include: {
										_count: {
											select: {
												questions: true,
											},
										},
										quiz_attempts: {
											where: {
												student_id: student.id,
											},
											orderBy: {
												created_at: 'desc',
											},
										},
									},
									orderBy: {
										created_at: 'desc',
									},
								},
							},
						},
					},
				},
			},
		});

		// Coletar todos os quizzes de todas as matérias da turma
		const allQuizzes = [];
		studentWithClass.class.teacher_subject_classes.forEach((tsc) => {
			tsc.quizzes.forEach((quiz) => {
				const attempts = quiz.quiz_attempts;
				const completedAttempts = attempts.filter(
					(attempt) => attempt.status === 'completed',
				);
				const inProgressAttempts = attempts.filter(
					(attempt) => attempt.status === 'in_progress',
				);

				let status = 'not_started';
				let lastAttempt = null;

				if (inProgressAttempts.length > 0) {
					status = 'in_progress';
					lastAttempt = inProgressAttempts[0];
				} else if (completedAttempts.length > 0) {
					status = 'completed';
					lastAttempt = completedAttempts[0];
				}

				allQuizzes.push({
					id: quiz.id,
					title: quiz.title,
					description: quiz.description,
					icon: quiz.icon,
					duration_minutes: quiz.duration_minutes,
					visibility: quiz.visibility,
					question_count: quiz._count.questions,
					status: status,
					last_attempt: lastAttempt,
					subject: {
						id: tsc.teacher_subject.subject.id,
						name: tsc.teacher_subject.subject.name,
					},
					teacher: {
						id: tsc.teacher_subject.teacher.id,
						name: tsc.teacher_subject.teacher.user.name,
					},
					created_at: quiz.created_at,
				});
			});
		});

		// Ordenar por data de criação (mais recentes primeiro)
		allQuizzes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

		return allQuizzes;
	} catch (error) {
		throw error;
	}
}

// Buscar todos os quizzes do professor
async function getAllQuizzesForTeacher(userId) {
	try {
		const teacher = await prisma.teacher.findUnique({
			where: { user_id: userId },
			include: {
				teacher_subjects: {
					include: {
						subject: true,
						teacher_subject_classes: {
							include: {
								class: true,
								quizzes: {
									include: {
										_count: {
											select: {
												questions: true,
											},
										},
									},
									orderBy: {
										created_at: 'desc',
									},
								},
							},
						},
					},
				},
			},
		});

		if (!teacher) {
			throw new Error('Teacher not found');
		}

		// Coletar todos os quizzes de todas as turmas/matérias do professor
		const allQuizzes = [];
		teacher.teacher_subjects.forEach((ts) => {
			ts.teacher_subject_classes.forEach((tsc) => {
				tsc.quizzes.forEach((quiz) => {
					allQuizzes.push({
						id: quiz.id,
						title: quiz.title,
						description: quiz.description,
						icon: quiz.icon,
						duration_minutes: quiz.duration_minutes,
						visibility: quiz.visibility,
						question_count: quiz._count.questions,
						subject: {
							id: ts.subject.id,
							name: ts.subject.name,
						},
						class: {
							id: tsc.class.id,
							name: tsc.class.name,
						},
						created_at: quiz.created_at,
					});
				});
			});
		});

		// Ordenar por data de criação (mais recentes primeiro)
		allQuizzes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

		return allQuizzes;
	} catch (error) {
		throw error;
	}
}

export {
	getQuizzesOfTeacher,
	createQuiz,
	updateQuiz,
	updateQuizVisibility,
	deleteQuiz,
	getQuizzesBySubject,
	startAttempt,
	changeAttemptStatus,
	getQuizWithQuestions,
	getQuizById,
	getAllQuizzesForStudent,
	getAllQuizzesForTeacher,
};
