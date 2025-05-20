import express from 'express';

// Routes
import authRoute from './routes/loginRoute.js';

// express config
const app = express();
const port = 3000;

// express middlewares
app.use(express.json());

// Login route
app.use('/login', authRoute);

// User route

app.listen(port, () => {
	console.log(`Servidor rodando na porta: http://localhost:${port}`);
});
