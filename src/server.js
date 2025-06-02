import express from 'express';
import cors from 'cors';

// Routes
import authRoute from './routes/authRoute.js';
import adminRoute from './routes/adminRoute.js';
import teacherRoute from './routes/teacherRoute.js';

// express config
const app = express();
const port = 3000;

// express middlewares
app.use(express.json());
app.use(
	cors({
		origin: `http://localhost:3001`,
		credentials: true,
	}),
);

// Login route
app.use('/login', authRoute);

// Me route
app.use('/me', authRoute);

// Admin route
app.use('/admin', adminRoute);

// Teacher route
app.use('/teacher', teacherRoute);

app.listen(port, () => {
	console.log(`Servidor rodando na porta: http://localhost:${port}`);
});
