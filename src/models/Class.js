import prisma from '../../prisma/client.js';
import { classSchema } from '../schemas/schemas.js';

async function getAllClasses() {
	try {
		const classes = await prisma.class.findMany();
		return classes;
	} catch (error) {
		console.error('Error fetching classes:', error);
		throw error;
	}
}

async function getClassById(id) {
	try {
		const schoolClass = await prisma.class.findUnique({
			where: { id: id },
		});
		return schoolClass;
	} catch (error) {
		console.error('Error fetching class:', error);
		throw error;
	}
}

async function createClass(classData) {
	const validClass = classSchema.safeParse(classData);

	if (validClass.success === false) {
		console.error('Invalid class data:', validClass.error);
		throw new Error('Invalid class data');
	}

	try {
		await prisma.class.create({
			data: validClass.data,
		});
	} catch (error) {
		console.error('Error creating class:', error);
		throw error;
	}
}

async function updateClass(class_id, classData) {
	let schoolClass, classId;

	try {
		classId = z.number().int().positive().parse(class_id);
		schoolClass = classSchema.parse(classData);
	} catch (error) {
		console.error('Invalid request data:', error);
		throw new Error('Invalid request data');
	}

	const existingClass = await prisma.class.findUnique({
		where: { id: classId },
	});

	if (!existingClass) {
		throw new Error(`Class with ID ${classId} not found`);
	}

	try {
		const updatedClass = await prisma.class.update({
			where: { id: classId },
			data: schoolClass,
		});

		return updatedClass;
	} catch (error) {
		console.error('Error updating class:', error);
		throw error;
	}
}

async function deleteClass(class_id) {
	let classId;

	try {
		classId = z.number().int().positive().parse(class_id);
	} catch (error) {
		console.error('Invalid request data:', error);
		throw new Error('Invalid request data');
	}

	try {
		return await prisma.class.delete({
			where: { id: classId },
		});
	} catch (error) {
		console.error('Error deleting class:', error);
		throw error;
	}
}

export { getAllClasses, getClassById, createClass, updateClass };
