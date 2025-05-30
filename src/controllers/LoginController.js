import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma/client.js';

async function compare(password, hashedPassword) {
	try {
		return await bcrypt.compare(password, hashedPassword);
	} catch (error) {
		console.error('Error comparing passwords:', error);
		return false;
	}
}

async function loginController(req, res) {
	const SECRET = process.env.JWT_SECRET;

	const { email, password } = req.body;

	if (!email || !password) {
		return res
			.status(400)
			.json({ message: 'Email and password are required' });
	}

	try {
		const user = await prisma.user.findFirst({
			where: {
				email: email,
			},
		});

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const correctPassword = await compare(password, user.hashed_password);

		if (!correctPassword) {
			return res.status(401).json({ message: 'Invalid password' });
		}

		const token = jwt.sign({ user_id: user.id, role: user.role }, SECRET, {
			expiresIn: '2h',
		});

		return res.status(200).json({
			message: 'Login successful',
			token,
			user: { id: user.id, role: user.role },
		});
	} catch (error) {
		console.error('Error fetching users:', error);
		res.status(500).json({ message: 'Internal server error', error });
	}
}

export { loginController };
