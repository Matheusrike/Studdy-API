import {
	getAllClasses,
	getClassById,
	createClass,
	updateClass,
} from '../models/Class.js';

async function getAllClassesController(req, res) {
	try {
		const classes = await getAllClasses();
		return res.status(200).json(classes);
	} catch (error) {
		console.error('Error fetching classes:', error);
		return res.status(500).json({ message: 'Error fetching classes' });
	}
}

async function getClassByIdController(req, res) {
	try {
		const schoolClass = await getClassById(parseInt(req.params.id));

		if (!schoolClass) {
			return res.status(404).json({ message: 'Class not found' });
		}

		return res.status(200).json(schoolClass);
	} catch (error) {
		console.error('Error fetching class:', error);
		return res.status(500).json({ message: 'Error fetching class' });
	}
}

async function createClassController(req, res) {
	try {
		const schoolClass = await createClass(req.body);
		return res.status(201).json(schoolClass);
	} catch (error) {
		console.error('Error creating class:', error);
		return res.status(500).json({ message: 'Error creating class' });
	}
}

async function updateClassController(req, res) {
	try {
		const schoolClass = await updateClass(
			parseInt(req.params.id),
			req.body,
		);

		return res.status(200).json(schoolClass);
	} catch (error) {
		console.error('Error updating class:', error);
		return res.status(500).json({ message: 'Error updating class' });
	}
}

async function deleteClassController(req, res) {
	try {
		await deleteClass(parseInt(req.params.id));
		return res.status(204).json({ message: 'Class deleted successfully' });
	} catch (error) {
		console.error('Error deleting class:', error);
		return res.status(500).json({ message: 'Error deleting class' });
	}
}

export {
	getAllClassesController,
	getClassByIdController,
	createClassController,
	updateClassController,
	deleteClassController,
};
