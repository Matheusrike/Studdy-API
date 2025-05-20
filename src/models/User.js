import prisma from '../../prisma/client.js';
import { userSchema } from '../schemas/schemas.js';
import { generateHashPassword } from '../utils/hash.js';

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

async function createUser(userData) {
	const validUser = userSchema.safeParse(userData);

	if (validUser.success === false) {
		console.error('Invalid user data:', validUser.error);
		return null;
	}

	try {
		const hashed_password = await generateHashPassword(
			validUser.data.password,
		);
		validUser.data.password = hashed_password;

		const { password, ...rest } = validUser.data;
		const user = { ...rest, hashed_password: password };

		await prisma.user.create({
			data: user,
		});
	} catch (error) {
		console.error('Error creating user:', error);
		throw error;
	}
}

createUser(user);
