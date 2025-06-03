import openaiClient from '../config/openai.js';

async function generateWrongAlternatives(question, correct_answer) {
	if (!openaiClient) {
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
			max_tokens: 1500,
		});

		return api_response.choices[0].message.content;
	} catch (error) {
		throw new Error('Failed to generate incorrect alternatives.');
	}
}

async function generateResume(title) {
	if (!openaiClient) {
		throw new Error('OpenAI client not initialized');
	}

	try {
		const api_response = await openai.chat.completions.create({
			model: 'gpt-4',
			messages: [
				{
					role: 'system',
					content:
						'You are a professional summarizer specialized in generating detailed and well-structured summaries based on complex topics or article titles.\nYour task is to create an extensive and comprehensive summary of the topic provided by the user.\n\nPlease follow these instructions carefully:\n- Extract and clearly present the main points, relevant subtopics, and key arguments.\n- Include illustrative examples where appropriate to clarify concepts.\n- Emphasize any important conclusions or implications drawn from the topic.\n- Clearly explain relationships between ideas, if applicable.\n- Organize the information logically and coherently, using proper paragraph structure.\n- Do not invent or assume facts beyond what is implied or typically associated with the subject.\n- Maintain a professional, informative and academic tone.\n- The summary must be extensive, rich in detail, and avoid superficial generalizations.\n\nMost importantly: The entire summary must be written in Brazilian Portuguese (pt-br). Do not use English or any other language in your response.\n\nNow, wait for the user to send the topic or title to summarize.',
				},
				{
					role: 'user',
					content: `Please create a highly detailed, extensive, and informative summary based on the following title or topic:/n/n${title}/n/nFollow these instructions strictly:/n- Extract and clearly present the main topics, key concepts, and central arguments./n- Include relevant examples whenever appropriate to illustrate and reinforce the ideas./n- Highlight important conclusions or significant implications related to the topic./n- Explain the relationships between ideas in a logical and cohesive manner./n- Organize the content into well-structured paragraphs, ensuring clarity and a logical flow of information./n/nThe summary must be rich in detail, avoid superficial generalizations, and maintain a professional, informative tone./n/nAll content must be written exclusively in Brazilian Portuguese (pt-br).`,
				},
			],
			max_tokens: 2000,
			temperature: 0.7,
		});

		return api_response.choices?.[0]?.message?.content;
	} catch (error) {
		throw new Error('Failed to generate resume.');
	}
}

export { generateWrongAlternatives, generateResume };
