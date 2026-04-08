import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, saveDatabase } from '../dataStore.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/** Inscription patient (sans compte pro) — utilisée par le portail patient */
router.post('/register', (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, phone, email, allergies, notes } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'Nom et prénom requis' });
    }

    const allergyText = allergies != null && String(allergies).trim() !== ''
      ? String(allergies).trim()
      : '';
    const notesCombined = [notes && String(notes).trim(), allergyText ? `Allergies: ${allergyText}` : '']
      .filter(Boolean)
      .join('\n');

    const newPatient = {
      id: uuidv4(),
      firstName,
      lastName,
      dateOfBirth: dateOfBirth || null,
      phone: phone || null,
      email: email || null,
      allergies: allergyText,
      notes: notesCombined || '',
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

router.use(authenticate);

router.get('/', (req, res) => {
  return res.json(db.patients);
});

router.post('/', (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, phone, email, notes, allergies } = req.body;

    console.log('Creating patient:', { firstName, lastName, dateOfBirth, phone, email });

    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'Nom et prénom requis' });
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
      email: email || null,
      allergies: allergyText,
      notes: notes || '',
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

  const { firstName, lastName, dateOfBirth, phone, email, notes, allergies } = req.body;

  if (firstName !== undefined) patient.firstName = firstName;
  if (lastName !== undefined) patient.lastName = lastName;
  if (dateOfBirth !== undefined) patient.dateOfBirth = dateOfBirth;
  if (phone !== undefined) patient.phone = phone;
  if (email !== undefined) patient.email = email;
  if (notes !== undefined) patient.notes = notes;
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
