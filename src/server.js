import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import bcrypt from 'bcrypt';
import authRoutes from './routes/auth.js';
import protectedRoutes from './routes/protected.js';
import { config } from './config.js';
import { users } from './data/users.js';
import { logger } from './logger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
const allowedOrigins = new Set(config.corsOrigins);

app.use(helmet());
app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.has(origin)) return callback(null, true);
  return callback(new Error('Origen no permitido por CORS'));
} }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => res.json({ mensaje:'Hola, servidor corriendo!' }));
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use(notFound);
app.use(errorHandler);

if (config.adminEmail && config.adminPassword) {
  users.push({
    id: users.length + 1,
    name: 'Administrador',
    email: config.adminEmail.toLowerCase(),
    passwordHash: await bcrypt.hash(config.adminPassword, 12),
    role: 'admin',
  });
  logger.info('Administrador inicial creado', { email: config.adminEmail.toLowerCase(), role: 'admin' });
}

app.listen(config.port, () => {
  logger.info(`API ejecutandose en http://localhost:${config.port}`);
});
