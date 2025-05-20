import express from 'express';

// Routes
import authRoute from './routes/loginRoute.js';

// express config
const app = express();
const port = 3000;

// express middlewares
app.use(express.json());

app.use('/login', authRoute);

app.listen(port, () => {
	console.log(`Servidor rodando na porta: http://localhost:${port}`);
});
