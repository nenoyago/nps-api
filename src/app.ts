import express from 'express';
import 'express-async-errors';
import cors from 'cors';

import 'reflect-metadata';
import createConection from './database';

import routes from './routes';
import errorHandler from './errors/handler';

createConection();
const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

app.use(errorHandler);

export default app;