import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { initializeDatabase, seedAdminUser, seedDoctors } from './dataStore.js';
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import fileRoutes from './routes/fileRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true
  })
);
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/files', fileRoutes);

// Simple healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize database and seed initial data
initializeDatabase();
seedAdminUser();
seedDoctors();

app.listen(config.port, () => {
  console.log(`Backend API listening on port ${config.port}`);
  console.log(`CORS origin: ${config.corsOrigin}`);
});
