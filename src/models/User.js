import prisma from '../../prisma/client.js';
import { userSchema } from '../schemas/schemas.js';

async function getAllUsers() {
	try {
		const users = await prisma.user.findMany();
		return users;
	} catch (error) {
		console.error('Error fetching users:', error);
		throw error;
	}
}

async function getUserById(id) {
	try {
		const user = await prisma.user.findUnique({ where: { id: id } });
		return user;
	} catch (error) {
		console.error('Error fetching user:', error);
		throw error;
	}
}

const user = {
	name: 'Lucas Soalheiro',
	email: 'Soalheiro@gmail.com',
	cpf: '31586415946',
	birth_date: new Date(),
	role: 'Student',
};

async function createUser(userData) {
	const validUser = userSchema.safeParse(userData);
	if (!validUser) {
		console.error('Invalid user data:', validUser.error);
	}
	console.log(validUser);
	// try {
	// 	await prisma.user.create({
	// 		data: { UserData },
	// 	});
	// } catch (error) {}
}

createUser(user);
