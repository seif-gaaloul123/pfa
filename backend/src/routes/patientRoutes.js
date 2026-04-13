import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db, saveDatabase } from '../dataStore.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/** Inscription patient (sans compte pro) — utilisée par le portail patient */
router.post('/register', (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, phone, email, allergies, notes, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Nom, prénom, email et mot de passe requis' });
    }

    const existingId = db.patients.find(p => p.email && p.email.toLowerCase() === email.toLowerCase());
    if (existingId) {
      return res.status(409).json({ message: 'Un compte avec cet email existe déjà. Veuillez vous connecter.' });
    }

    const allergyText = allergies != null && String(allergies).trim() !== ''
      ? String(allergies).trim()
      : '';
    const notesCombined = [notes && String(notes).trim(), allergyText ? `Allergies: ${allergyText}` : '']
      .filter(Boolean)
      .join('\n');

    const passwordHash = bcrypt.hashSync(password, 10);

    const newPatient = {
      id: uuidv4(),
      firstName,
      lastName,
      dateOfBirth: dateOfBirth || null,
      phone: phone || null,
      email: email.toLowerCase(),
      allergies: allergyText,
      notes: notesCombined || '',
      passwordHash,
      bloodType: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.patients.push(newPatient);
    return res.status(201).json(newPatient);
  } catch (error) {
    console.error('Error registering patient:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de l’inscription' });
  }
});

/** Login patient */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const patient = db.patients.find((p) => p.email && p.email.toLowerCase() === email.toLowerCase());
    if (!patient || !patient.passwordHash) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const isMatch = bcrypt.compareSync(password, patient.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    return res.json(patient);
  } catch (error) {
    console.error('Error logging in patient:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/** PUT patient data without auth from patient profile */
router.put('/profile/:id', (req, res) => {
  const patient = db.patients.find((p) => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ message: 'Patient non trouvé' });
  }

  const { firstName, lastName, phone, email, allergies, bloodType, password } = req.body;

  if (firstName !== undefined) patient.firstName = firstName;
  if (lastName !== undefined) patient.lastName = lastName;
  if (phone !== undefined) patient.phone = phone;
  if (allergies !== undefined) patient.allergies = allergies;
  if (bloodType !== undefined) patient.bloodType = bloodType;
  
  if (email !== undefined) {
    const existing = db.patients.find(p => p.email && p.email.toLowerCase() === email.toLowerCase() && p.id !== patient.id);
    if (existing) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }
    patient.email = email.toLowerCase();
  }

  if (password) {
    patient.passwordHash = bcrypt.hashSync(password, 10);
  }
  
  patient.updatedAt = new Date().toISOString();
  saveDatabase();
  return res.json(patient);
});

/** Public GET patient profile (used by patient portal without JWT) */
router.get('/profile/:id', (req, res) => {
  const patient = db.patients.find((p) => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ message: 'Patient non trouvé' });
  }
  // Return safe subset (exclude passwordHash)
  const { passwordHash, ...safeData } = patient;
  return res.json(safeData);
});

router.use(authenticate);

router.get('/', (req, res) => {
  return res.json(db.patients);
});

router.post('/', (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, phone, email, notes, allergies, bloodType } = req.body;

    console.log('Creating patient:', { firstName, lastName, dateOfBirth, phone, email });

    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'Nom et prénom requis' });
    }

    if (email) {
      const existing = db.patients.find(p => p.email && p.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(200).json(existing);
      }
    }

    const allergyText = allergies != null && String(allergies).trim() !== ''
      ? String(allergies).trim()
      : '';

    const newPatient = {
      id: uuidv4(),
      firstName,
      lastName,
      dateOfBirth: dateOfBirth || null,
      phone: phone || null,
      email: email ? email.toLowerCase() : null,
      allergies: allergyText,
      notes: notes || '',
      bloodType: bloodType || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.patients.push(newPatient);
    console.log('Patient created successfully:', newPatient.id);
    return res.status(201).json(newPatient);
  } catch (error) {
    console.error('Error creating patient:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la création du patient' });
  }
});

router.get('/:id', (req, res) => {
  const patient = db.patients.find((p) => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ message: 'Patient non trouvé' });
  }
  return res.json(patient);
});

router.put('/:id', (req, res) => {
  const patient = db.patients.find((p) => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ message: 'Patient non trouvé' });
  }

  const { firstName, lastName, dateOfBirth, phone, email, notes, allergies, bloodType } = req.body;

  if (firstName !== undefined) patient.firstName = firstName;
  if (lastName !== undefined) patient.lastName = lastName;
  if (dateOfBirth !== undefined) patient.dateOfBirth = dateOfBirth;
  if (phone !== undefined) patient.phone = phone;
  
  if (email !== undefined) {
    if (email) {
      const existing = db.patients.find(p => p.email && p.email.toLowerCase() === email.toLowerCase() && p.id !== patient.id);
      if (existing) {
        return res.status(409).json({ message: 'Cet email est déjà utilisé' });
      }
      patient.email = email.toLowerCase();
    } else {
      patient.email = null;
    }
  }

  if (notes !== undefined) patient.notes = notes;
  if (bloodType !== undefined) patient.bloodType = bloodType;
  if (allergies !== undefined) {
    patient.allergies = allergies != null && String(allergies).trim() !== '' ? String(allergies).trim() : '';
  }
  patient.updatedAt = new Date().toISOString();

  saveDatabase();
  return res.json(patient);
});

router.delete('/:id', (req, res) => {
  const index = db.patients.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Patient non trouvé' });
  }

  const [removed] = db.patients.splice(index, 1);
  return res.json({ message: 'Patient supprimé', patient: removed });
});

export default router;
