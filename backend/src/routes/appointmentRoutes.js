import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, saveDatabase, autoUpdateStatuses } from '../dataStore.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

function createAppointment(req, res) {
  const { patientId, doctorId, date, notes, status } = req.body;
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

  const allowedStatus = ['waiting', 'in-consultation', 'finished'];
  const initialStatus =
    status && allowedStatus.includes(status) ? status : 'waiting';

  const newAppointment = {
    id: uuidv4(),
    patientId,
    doctorId,
    date,
    notes: notes || '',
    status: initialStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.appointments.push(newAppointment);
  console.log('Appointment created successfully:', newAppointment.id);
  return res.status(201).json(newAppointment);
}

/** Créneaux déjà réservés pour un médecin et un jour (YYYY-MM-DD) — sans auth */
router.get('/slots', (req, res) => {
  const { doctorId, day } = req.query;
  if (!doctorId || !day) {
    return res.status(400).json({ message: 'doctorId et day (YYYY-MM-DD) requis' });
  }
  const booked = db.appointments
    .filter((a) => a.doctorId === doctorId && String(a.date).startsWith(day))
    .map((a) => a.date);
  return res.json(booked);
});

/** Prise de RDV depuis le portail patient (sans JWT) */
router.post('/book', createAppointment);

/** Récupération des RDV pour un patient spécifique (sans JWT, utile pour portail patient) */
router.get('/patient/:patientId', (req, res) => {
  autoUpdateStatuses();
  const { patientId } = req.params;
  const list = db.appointments
    .filter((a) => a.patientId === patientId)
    .map((a) => ({
      ...a,
      status: a.status || 'waiting'
    }));
  return res.json(list);
});

router.use(authenticate);

router.get('/', (req, res) => {
  autoUpdateStatuses();
  const list = db.appointments.map((a) => ({
    ...a,
    status: a.status || 'waiting'
  }));
  return res.json(list);
});

router.post('/', createAppointment);

router.put('/:id', (req, res) => {
  const appointment = db.appointments.find((a) => a.id === req.params.id);
  if (!appointment) {
    return res.status(404).json({ message: 'Rendez-vous non trouvé' });
  }

  const { patientId, doctorId, date, notes, status } = req.body;
  const allowedStatus = ['waiting', 'in-consultation', 'finished'];

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

  if (date !== undefined || doctorId !== undefined) {
    const newDate = date !== undefined ? date : appointment.date;
    const newDoctorId = doctorId !== undefined ? doctorId : appointment.doctorId;

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
  if (status !== undefined) {
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }
    appointment.status = status;
  }
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
