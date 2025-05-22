import express from 'express';

// Routes
import authRoute from './routes/loginRoute.js';
import studentRoute from './routes/studentRoute.js';
import classRoute from './routes/classRoute.js';

// express config
const app = express();
const port = 3000;

// express middlewares
app.use(express.json());

// Login route
app.use('/login', authRoute);

// Student route
app.use('/student', studentRoute);

// Class route
app.use('/class', classRoute);

app.listen(port, () => {
	console.log(`Servidor rodando na porta: http://localhost:${port}`);
});
