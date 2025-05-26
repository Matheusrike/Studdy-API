import express from 'express';
import cors from 'cors';

// Routes
import authRoute from './routes/loginRoute.js';
import studentRoute from './routes/studentRoute.js';
import classRoute from './routes/classRoute.js';
import subjectRoute from './routes/subjectRoute.js';
import teacherRoute from './routes/teacherRoute.js';
import quizRoute from './routes/quizRoute.js';

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

// Student route
app.use('/student', studentRoute);

// Class route
app.use('/class', classRoute);

// Subject route
app.use('/subject', subjectRoute);

// Teacher route
app.use('/teacher', teacherRoute);

// Quiz route
app.use('/quiz', quizRoute);

app.listen(port, () => {
	console.log(`Servidor rodando na porta: http://localhost:${port}`);
});
