import { createStudent } from '../models/Student.js';

async function createStudentController(req, res) {
	try {
		const student = await createStudent(req.body);
		res.status(201).json(student);
	} catch (error) {
		console.error('Error creating student:', error);
		res.status(500).json({ error: 'Error creating student' });
	}
}

export { createStudentController };
