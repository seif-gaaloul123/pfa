import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { config } from './config.js';

// In-memory store (simple demo, pas de vraie base de données)
export const db = {
  users: [],
  patients: [],
  appointments: []
};

// Seed admin user at startup
export function seedAdminUser() {
  const existingAdmin = db.users.find(
    (u) => u.email.toLowerCase() === config.adminEmail.toLowerCase()
  );
  if (existingAdmin) return;

  const passwordHash = bcrypt.hashSync(config.adminPassword, 10);
  db.users.push({
    id: uuidv4(),
    email: config.adminEmail,
    passwordHash,
    role: 'admin',
    createdAt: new Date().toISOString()
  });
}
