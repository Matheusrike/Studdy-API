import { createClass } from '../models/Class.js';

export async function createClassController(req, res) {
	try {
		const schoolClass = await createClass(req.body);
		res.status(201).json(schoolClass);
	} catch (error) {
		console.error('Error creating class:', error);
		res.status(500).json({ error: 'Error creating class' });
	}
}
