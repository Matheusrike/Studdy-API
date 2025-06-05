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

// Atualiza um quiz existente
async function updateQuiz(quizId, quizData) {
	try {
		// Primeiro, verifica se o quiz existe
		const existingQuiz = await prisma.quiz.findUnique({
			where: { id: quizId },
			include: {
				questions: {
					include: {
						alternatives: true
					}
				}
			}
		});

		if (!existingQuiz) {
			throw new Error('Quiz not found');
		}

		// Atualiza o quiz usando uma transação
		return await prisma.$transaction(async (tx) => {
			// 1. Deleta todas as alternativas existentes
			for (const question of existingQuiz.questions) {
				await tx.alternative.deleteMany({
					where: { question_id: question.id }
				});
			}

			// 2. Deleta todas as questões existentes
			await tx.question.deleteMany({
				where: { quiz_id: quizId }
			});

			// 3. Atualiza os dados básicos do quiz
			const updatedQuiz = await tx.quiz.update({
				where: { id: quizId },
				data: {
					title: quizData.title,
					description: quizData.description,
					icon: quizData.icon,
					duration_minutes: quizData.duration_minutes,
					visibility: quizData.visibility
				}
			});

			// 4. Cria as novas questões e alternativas
			for (const questionData of quizData.questions) {
				const question = await tx.question.create({
					data: {
						statement: questionData.statement,
						points: questionData.points,
						quiz_id: quizId
					}
				});

				// Cria as alternativas para a questão
				await tx.alternative.createMany({
					data: questionData.alternatives.map(alt => ({
						question_id: question.id,
						response: alt.response,
						correct_alternative: alt.correct_alternative
					}))
				});
			}

			// 5. Retorna o quiz atualizado com todas as relações
			return await tx.quiz.findUnique({
				where: { id: quizId },
				include: {
					questions: {
						include: {
							alternatives: true
						}
					}
				}
			});
		});
	} catch (error) {
		console.error('Error updating quiz:', error);
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

			let status = 'in_progress';
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

//finalizar  ja foi finalte uma tentativa em progresso para este aluno neste quiz
		const existingAttempt = await prisma.quiz_attempt.findFirst({
			where: {
				quiz_id: quizId,
				student_id: student.id,
				status: 'in_progress'
			}
		});

		if (existingAttempt) {
			throw new Error('Você já tem uma tentativa em progresso para este quiz.');
		}

		// Verificar o limite máximo de tentativas
		const totalAttempts = await prisma.quiz_attempt.count({
			where: {
				quiz_id: quizId,
				student_id: student.id
			}
		});

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

		// Verificar se o aluno já atingiu o limite máximo de tentativas
		if (quiz.max_attempt && totalAttempts >= quiz.max_attempt) {
			throw new Error(`Você já atingiu o limite máximo de ${quiz.max_attempt} tentativas para este quiz.`);
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
			},
		});

		return { ...quiz, attempt_id: startedAttempt.id };
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
	} catch (error) {
		throw error;
	}
}

async function submitAnswer(attemptId, responses, userId) {
	try {
		const result = await prisma.$transaction(async (tx) => {
			// Buscar o aluno pelo userId
			const student = await tx.student.findUnique({
				where: { user_id: userId },
				select: { id: true }
			});

			if (!student) {
				throw new Error('Aluno não encontrado.');
			}

			const attempt = await tx.quiz_attempt.findUnique({
				where: { id: Number(attemptId) },
				include: { quiz: { include: { questions: true } } },
			});

			if (!attempt) {
				throw new Error('Tentativa não encontrada.');
			}

			// Verificar se a tentativa pertence ao estudante atual
			if (attempt.student_id !== student.id) {
				console.log(`Tentativa ${attemptId} pertence ao student ${attempt.student_id}, mas usuário atual é student ${student.id}`);
				throw new Error('Você não tem permissão para finalizar esta tentativa.');
			}

			if (attempt.status !== 'in_progress') {
				throw new Error('Essa tentativa já foi finalizada.');
			}

			const summary = {
				totalScore: 0,
				correctAnswers: 0,
				totalQuestions: responses.length,
				details: [],
			};

			for (const { questionId, markedAlternativeId } of responses) {
				const markedAlternative = await tx.alternative.findUnique({
					where: { id: markedAlternativeId },
					select: {
						id: true,
						response: true,
						question_id: true,
						correct_alternative: true,
						question: {
							select: {
								id: true,
								statement: true,
								points: true,
								alternatives: {
									where: { correct_alternative: true },
									select: { id: true, response: true },
								},
							},
						},
					},
				});

				if (
					!markedAlternative ||
					markedAlternative.question_id !== questionId
				) {
					throw new Error(
						`Alternativa ${markedAlternativeId} inválida para a questão ${questionId}.`,
					);
				}

				const isCorrect = markedAlternative.correct_alternative;
				const pointsEarned = isCorrect
					? Number(markedAlternative.question.points)
					: 0;

				await tx.question_response.create({
					data: {
						question_id: questionId,
						marked_alternative_id: markedAlternativeId,
						quiz_attempt_id: Number(attemptId),
						is_correct: isCorrect,
						points_earned: pointsEarned,
					},
				});

				if (isCorrect) summary.correctAnswers += 1;
				summary.totalScore += pointsEarned;

				summary.details.push({
					questionId,
					question: markedAlternative.question.question,
					isCorrect,
					pointsEarned,
					markedAlternative: {
						id: markedAlternative.id,
						description: markedAlternative.response,
					},
					correctAlternative: markedAlternative.question
						.alternatives[0]
						? {
								id: markedAlternative.question.alternatives[0]
									.id,
								description:
									markedAlternative.question.alternatives[0]
										.response,
							}
						: null,
				});
			}

			await tx.quiz_attempt.update({
				where: { id: Number(attemptId) },
				data: {
					status: 'completed',
					finished_at: new Date(),
					total_score: summary.totalScore,
				},
			});

			return summary;
		});

		return result;
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
				teacher_subject_class: {
					select: {
						teacher_subject: {
							select: {
								subject: {
									select: {
										id: true,
										name: true
									}
								}
							}
						},
						class: {
							select: {
								id: true,
								name: true,
								shift: true,
								course: true
							}
						}
					}
				},
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

		// Reorganizar o objeto para um formato mais amigável
		return {
			...quiz,
			subject: quiz.teacher_subject_class.teacher_subject.subject,
			class: quiz.teacher_subject_class.class,
			teacher_subject_class: undefined // Remove o campo original
		};
	} catch (error) {
		throw error;
	}
}

// Busca todos os quizzes disponíveis para um estudante
async function getAllQuizzesForStudent(studentId) {
	try {
		// Primeiro, busca o estudante e sua turma
		const student = await prisma.student.findUnique({
			where: { id: studentId },
			select: {
				class_id: true
			}
		});

		if (!student) {
			throw new Error('Student not found');
		}

		// Busca todos os quizzes da turma do estudante
		const quizzes = await prisma.quiz.findMany({
			where: {
				teacher_subject_class: {
					class_id: student.class_id
				},
				visibility: 'public'
			},
			select: {
				id: true,
				title: true,
				description: true,
				icon: true,
				duration_minutes: true,
				visibility: true,
				teacher_subject_class: {
					select: {
						teacher_subject: {
							select: {
								subject: {
									select: {
										id: true,
										name: true
									}
								}
							}
						},
						class: {
							select: {
								id: true,
								name: true,
								shift: true,
								course: true
							}
						}
					}
				},
				questions: {
					select: {
						id: true,
						statement: true,
						points: true,
						alternatives: {
							select: {
								id: true,
								response: true,
								correct_alternative: true
							}
						}
					}
				}
			}
		});

		// Reorganiza o objeto para um formato mais amigável
		return quizzes.map(quiz => ({
			...quiz,
			subject: quiz.teacher_subject_class.teacher_subject.subject,
			class: quiz.teacher_subject_class.class,
			teacher_subject_class: undefined
		}));
	} catch (error) {
		console.error('Error fetching student quizzes:', error);
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
		allQuizzes.sort(
			(a, b) => new Date(b.created_at) - new Date(a.created_at),
		);

		return allQuizzes;
	} catch (error) {
		throw error;
	}
}

async function getQuizzesByStudent(userId) {
	try {
		// Primeiro, busca a turma do estudante usando o user_id
		const student = await prisma.student.findUnique({
			where: { user_id: userId },
			select: { 
				id: true,
				class_id: true,
				class: {
					select: {
						id: true,
						name: true
					}
				}
			}
		});

		if (!student) {
			throw new Error('Student not found');
		}

		// Busca os quizzes da turma do estudante
		const quizzes = await prisma.quiz.findMany({
			where: {
				teacher_subject_class: {
					class_id: student.class_id
				},
				visibility: 'public'
			},
			select: {
				id: true,
				title: true,
				description: true,
				icon: true,
				duration_minutes: true,
				visibility: true,
				teacher_subject_class: {
					select: {
						teacher_subject: {
							select: {
								subject: {
									select: {
										id: true,
										name: true
									}
								}
							}
						}
					}
				},
				quiz_attempts: {
					where: {
						student_id: student.id
					},
					orderBy: {
						created_at: 'desc'
					}
				}
			}
		});

		// Formata os dados para retornar
		return {
			class: student.class,
			quizzes: quizzes.map(quiz => {
				const attempts = quiz.quiz_attempts;
				const completedAttempts = attempts.filter(
					(attempt) => attempt.status === 'completed'
				);
				const inProgressAttempt = attempts.find(
					(attempt) => attempt.status === 'in_progress'
				);

				// Quiz status logic: in_progress by default, completed if actually completed
				let status = 'in_progress';
				if (inProgressAttempt) {
					status = 'in_progress';
				} else if (completedAttempts.length > 0) {
					status = 'completed';
				}

				const bestScore = completedAttempts.length > 0
					? Math.max(...completedAttempts.map(attempt => parseFloat(attempt.total_score)))
					: null;

				return {
					id: quiz.id,
					title: quiz.title,
					description: quiz.description,
					icon: quiz.icon,
					duration_minutes: quiz.duration_minutes,
					visibility: quiz.visibility,
					subject: quiz.teacher_subject_class.teacher_subject.subject,
					status: status,
					attempts_count: attempts.length,
					completed_attempts_count: completedAttempts.length,
					best_score: bestScore,
					in_progress_attempt_id: inProgressAttempt?.id || null,
					attempt_id: inProgressAttempt?.id || (completedAttempts.length > 0 ? completedAttempts[0].id : null)
				};
			})
		};
	} catch (error) {
		console.error('Error in getQuizzesByStudent:', error);
		throw error;
	}
}

async function getQuizAttemptResponses(attemptId, userId) {
	const attempt = await prisma.quiz_attempt.findUnique({
		where: { id: Number(attemptId) },
		include: {
			student: { select: { user_id: true } },
			question_responses: {
				include: {
					question: {
						include: {
							alternatives: {
								select: { id: true, response: true, correct_alternative: true }
							}
						}
					},
					marked_alternative: { select: { id: true, response: true, correct_alternative: true } }
				}
			},
			quiz: { select: { id: true, title: true, description: true } }
		}
	});

	if (!attempt) throw new Error('Tentativa não encontrada');
	if (attempt.student.user_id !== userId) throw new Error('Sem permissão');

	return {
		quiz: attempt.quiz,
		status: attempt.status,
		total_score: attempt.total_score,
		started_at: attempt.started_at,
		finished_at: attempt.finished_at,
		responses: attempt.question_responses.map(response => ({
			question: response.question,
			marked_alternative: response.marked_alternative,
			is_correct: response.is_correct,
			points_earned: response.points_earned,
			alternatives: response.question.alternatives
		}))
	};
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
	submitAnswer,
	getQuizWithQuestions,
	getQuizById,
	getAllQuizzesForStudent,
	getAllQuizzesForTeacher,
	getQuizzesByStudent,
	getQuizAttemptResponses
};
