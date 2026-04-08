import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../dataStore.js';
import { config } from '../config.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      ...(user.name ? { name: user.name } : {}),
      ...(user.specialty ? { specialty: user.specialty } : {})
    }
  });
});

// Admin crée d’autres utilisateurs (médecin, assistant, admin)
router.post('/users', authenticate, authorize('admin'), (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, mot de passe et rôle requis' });
  }

  if (!['admin', 'medecin', 'assistant'].includes(role)) {
    return res.status(400).json({ message: 'Rôle invalide' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ message: 'Utilisateur déjà existant' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = {
    id: uuidv4(),
    email,
    passwordHash,
    role,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);

  return res.status(201).json({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role
  });
});

// Get all doctors (public or authenticated route)
router.get('/doctors', (req, res) => {
  const doctors = db.users.filter((u) => u.role === 'medecin');
  const doctorList = doctors.map(doc => ({
    id: doc.id,
    email: doc.email,
    name: doc.name,
    specialty: doc.specialty,
    createdAt: doc.createdAt
  }));
  return res.json(doctorList);
});

export default router;
