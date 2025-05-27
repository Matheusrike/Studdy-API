import { z } from 'zod';
import {
	getAssignmentsByClass,
	createAssignment,
	deleteAssignment,
} from '../models/Assignment.js';
import { assignmentSchema } from '../schemas/schemas.js';

// GET /admin/classes/:classId/assignments
async function getAssignmentsByClassController(req, res) {
	let classId;

	try {
		classId = z.number().int().positive().parse(req.params.classId);
	} catch (error) {
		console.error('Error parsing classId:', error);
		return res.status(400).json({ message: 'Error parsing classId' });
	}

	try {
		const assignments = await getAssignmentsByClass(parseInt(classId));
		return res.status(200).json(assignments);
	} catch (error) {
		if (error.status === 404) {
			console.error('Class not found:', error.message);
			return res.status(error.status).json({ message: error.message });
		}

		console.error('Internal Server Error:', error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
}

// POST /admin/classes/:classId/assignments
async function createAssignmentController(req, res) {
	let assignment;

	try {
		assignment = assignmentSchema.parse(req.body);
	} catch (error) {
		console.error('Error validating assignment:', error);
		return res.status(400).json({ message: 'Error validating assignment' });
	}

	try {
		assignment = await createAssignment(
			parseInt(req.params.classId),
			req.body,
		);
		return res.status(201).json(assignment);
	} catch (error) {
		console.error('Error creating assignment:', error);
		return res.status(500).json({ message: 'Error creating assignment' });
	}
}

export { getAssignmentsByClassController, createAssignmentController };
