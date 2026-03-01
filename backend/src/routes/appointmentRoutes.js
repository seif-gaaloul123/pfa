import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, saveDatabase } from '../dataStore.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res) => {
  return res.json(db.appointments);
});

router.post('/', (req, res) => {
  const { patientId, doctorId, date, notes } = req.body;
  if (!patientId || !doctorId || !date) {
    return res.status(400).json({ message: 'patientId, doctorId et date requis' });
  }

  const patient = db.patients.find((p) => p.id === patientId);
  if (!patient) {
    return res.status(400).json({ message: 'Patient introuvable' });
  }

  const doctor = db.users.find((u) => u.id === doctorId && u.role === 'medecin');
  if (!doctor) {
    return res.status(400).json({ message: 'Médecin introuvable' });
  }

  // Check if the doctor already has an appointment at this exact time
  const conflictingAppointment = db.appointments.find(
    (a) => a.doctorId === doctorId && a.date === date
  );
  
  if (conflictingAppointment) {
    const conflictingPatient = db.patients.find((p) => p.id === conflictingAppointment.patientId);
    const patientName = conflictingPatient 
      ? `${conflictingPatient.firstName} ${conflictingPatient.lastName}` 
      : 'un autre patient';
    return res.status(409).json({ 
      message: `Ce médecin a déjà un rendez-vous avec ${patientName} à cette date et heure. Veuillez choisir un autre créneau.` 
    });
  }

  const newAppointment = {
    id: uuidv4(),
    patientId,
    doctorId,
    date,
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.appointments.push(newAppointment);
  console.log('Appointment created successfully:', newAppointment.id);
  return res.status(201).json(newAppointment);
});

router.put('/:id', (req, res) => {
  const appointment = db.appointments.find((a) => a.id === req.params.id);
  if (!appointment) {
    return res.status(404).json({ message: 'Rendez-vous non trouvé' });
  }

  const { patientId, doctorId, date, notes } = req.body;

  if (patientId !== undefined) {
    const patient = db.patients.find((p) => p.id === patientId);
    if (!patient) {
      return res.status(400).json({ message: 'Patient introuvable' });
    }
    appointment.patientId = patientId;
  }

  if (doctorId !== undefined) {
    const doctor = db.users.find((u) => u.id === doctorId && u.role === 'medecin');
    if (!doctor) {
      return res.status(400).json({ message: 'Médecin introuvable' });
    }
    appointment.doctorId = doctorId;
  }

  // If date or doctorId is being changed, check for conflicts
  if (date !== undefined || doctorId !== undefined) {
    const newDate = date !== undefined ? date : appointment.date;
    const newDoctorId = doctorId !== undefined ? doctorId : appointment.doctorId;
    
    // Check if another appointment exists for this doctor at this time (excluding current appointment)
    const conflictingAppointment = db.appointments.find(
      (a) => a.id !== req.params.id && a.doctorId === newDoctorId && a.date === newDate
    );
    
    if (conflictingAppointment) {
      const conflictingPatient = db.patients.find((p) => p.id === conflictingAppointment.patientId);
      const patientName = conflictingPatient 
        ? `${conflictingPatient.firstName} ${conflictingPatient.lastName}` 
        : 'un autre patient';
      return res.status(409).json({ 
        message: `Ce médecin a déjà un rendez-vous avec ${patientName} à cette date et heure. Veuillez choisir un autre créneau.` 
      });
    }
  }

  if (date !== undefined) appointment.date = date;
  if (notes !== undefined) appointment.notes = notes;
  appointment.updatedAt = new Date().toISOString();

  saveDatabase();
  console.log('Appointment updated successfully:', appointment.id);
  return res.json(appointment);
});

router.delete('/:id', (req, res) => {
  const index = db.appointments.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Rendez-vous non trouvé' });
  }

  const [removed] = db.appointments.splice(index, 1);
  return res.json({ message: 'Rendez-vous supprimé', appointment: removed });
});

export default router;
