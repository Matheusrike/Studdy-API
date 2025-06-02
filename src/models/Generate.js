import openaiClient from '../config/openai.js';

async function generateWrongAlternatives(question, correct_answer) {
	if (!openai) {
		throw new Error('OpenAI client not initialized');
	}

	try {
		const api_response = await openaiClient.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				// Contexto do sistema
				{
					role: 'system',
					content: `You are a specialized generator of incorrect answer choices for multiple-choice questions in educational quizzes. Your task is to produce 3 incorrect but highly plausible alternatives for the given question. The incorrect options must:\n- Be relevant to the topic of the question, but logically incorrect\n- Avoid absurd or obviously false mistakes\n- Be written clearly, in natural language appropriate to the educational level of the question\n- Never include the correct answer\n\nImportant - The incorrect alternatives must be written in the same language as the expected answers in the question's context. For example, if the quiz is in English but refers to vocabulary in Spanish, the question will be in English and the alternatives must be in Spanish.\n\nYou must return only the incorrect alternatives, following the requested format.`,
				},
				// Contexto da pergunta
				{
					role: 'user',
					content: `question: ${question}\ncorrectAnswer: ${correct_answer}\n\nGenerate 3 plausible, relevant but incorrect alternatives. Do not include the correct answer. Return only the alternatives, without explanations or numbering.`,
				},
			],
			temperature: 0.7,
			max_tokens: 150,
		});

		return api_response.choices[0].message.content;
	} catch (error) {
		throw new Error('Failed to generate incorrect alternatives.');
	}
}

export { generateWrongAlternatives };
