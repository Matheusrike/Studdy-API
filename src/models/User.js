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

async function createUser(userData, tx = prisma) {
	try {
		// 1. Faz o hash da senha
		const hashed_password = await generateHashPassword(userData.password);

		userData.password = hashed_password;

		// 2. Substitui o password pelo hashed_password
		const { password, ...rest } = userData;
		const user = { ...rest, hashed_password: password };

		// 3. Cria o usuário no banco de dados
		const createdUser = await tx.user.create({
			data: user,
		});

		return createdUser;
	} catch (error) {
		throw error;
	}
}

export { getAllUsers, getUserById, createUser };
