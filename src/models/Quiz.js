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

export { createQuiz, getQuizzesOfTeacher };
