import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { config } from './config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'database.json');

// In-memory store with persistent backup
export const db = {
  users: [],
  patients: [],
  appointments: []
};

// Load database from file
export function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const loaded = JSON.parse(data);
      db.users = loaded.users || [];
      db.patients = loaded.patients || [];
      db.appointments = loaded.appointments || [];
      console.log('Database loaded from file');
    }
  } catch (error) {
    console.error('Error loading database:', error);
  }
}

// Save database to file
export function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Auto-save database whenever data changes
function createAutoSaveProxy(target) {
  return new Proxy(target, {
    set(obj, prop, value) {
      obj[prop] = value;
      saveDatabase();
      return true;
    }
  });
}

// Wrap arrays with auto-save functionality
export function initializeDatabase() {
  loadDatabase();
  
  // Intercept array operations to trigger saves
  const originalPush = Array.prototype.push;
  const originalSplice = Array.prototype.splice;
  
  db.users.push = function(...args) {
    const result = originalPush.apply(this, args);
    saveDatabase();
    return result;
  };
  
  db.patients.push = function(...args) {
    const result = originalPush.apply(this, args);
    saveDatabase();
    return result;
  };
  
  db.appointments.push = function(...args) {
    const result = originalPush.apply(this, args);
    saveDatabase();
    return result;
  };
  
  db.users.splice = function(...args) {
    const result = originalSplice.apply(this, args);
    saveDatabase();
    return result;
  };
  
  db.patients.splice = function(...args) {
    const result = originalSplice.apply(this, args);
    saveDatabase();
    return result;
  };
  
  db.appointments.splice = function(...args) {
    const result = originalSplice.apply(this, args);
    saveDatabase();
    return result;
  };
}

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

/** Médecins — clinique tunisienne (noms locaux uniquement) */
export function seedDoctors() {
  const doctors = [
    { email: 'dr.anis.belhaj@clinique.tn', name: 'Dr. Anis Belhaj', specialty: 'Médecine générale' },
    { email: 'dr.selima.bouzidi@clinique.tn', name: 'Dr. Selima Bouzidi', specialty: 'Cardiologie' },
    { email: 'dr.omar.trabelsi@clinique.tn', name: 'Dr. Omar Trabelsi', specialty: 'Pédiatrie' },
    { email: 'dr.amel.sassi@clinique.tn', name: 'Dr. Amel Sassi', specialty: 'Dermatologie' },
    { email: 'dr.nizar.bensalah@clinique.tn', name: 'Dr. Nizar Ben Salah', specialty: 'Rhumatologie' }
  ];

  const defaultPassword = 'doctor123';
  const passwordHash = bcrypt.hashSync(defaultPassword, 10);

  doctors.forEach((doctor) => {
    const existing = db.users.find((u) => u.email.toLowerCase() === doctor.email.toLowerCase());
    if (!existing) {
      db.users.push({
        id: uuidv4(),
        email: doctor.email,
        passwordHash,
        role: 'medecin',
        name: doctor.name,
        specialty: doctor.specialty,
        createdAt: new Date().toISOString()
      });
    }
  });
}

function isoLocalSlice(date, hour) {
  const d = new Date(date);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

/** Patients et rendez-vous de démonstration (noms tunisiens) */
export function seedTunisianDemo() {
  const anis = db.users.find((u) => u.email?.toLowerCase() === 'dr.anis.belhaj@clinique.tn');
  if (!anis) return;

  const demoPatients = [
    {
      firstName: 'Khaled',
      lastName: 'Al-Fessi',
      dateOfBirth: '1985-03-12',
      email: 'khaled.alfessi@patient.tn',
      phone: '+216 98 123 456',
      allergies: 'Pénicilline',
      notes: ''
    },
    {
      firstName: 'Yassine',
      lastName: 'Mansour',
      dateOfBirth: '1992-07-21',
      email: 'yassine.mansour@patient.tn',
      phone: '+216 22 987 654',
      allergies: '',
      notes: ''
    },
    {
      firstName: 'Fatma',
      lastName: 'Hadded',
      dateOfBirth: '1978-11-05',
      email: 'fatma.hadded@patient.tn',
      phone: '+216 55 111 222',
      allergies: '',
      notes: ''
    }
  ];

  const patientByKey = {};
  for (const row of demoPatients) {
    let p = db.patients.find(
      (x) =>
        x.email?.toLowerCase() === row.email.toLowerCase() ||
        (x.firstName === row.firstName && x.lastName === row.lastName)
    );
    if (!p) {
      p = {
        id: uuidv4(),
        ...row,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.patients.push(p);
    }
    patientByKey[`${row.firstName}_${row.lastName}`] = p;
  }

  const khaled = patientByKey['Khaled_Al-Fessi'];
  const yassine = patientByKey['Yassine_Mansour'];
  const fatma = patientByKey['Fatma_Hadded'];
  if (!khaled || !yassine || !fatma) return;

  const alreadyDemo = db.appointments.some(
    (a) => a.notes && String(a.notes).includes('[Démo MedERP Tunis]')
  );
  if (alreadyDemo) return;

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 5);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const addApt = (patientId, dateIso, status, notes) => {
    db.appointments.push({
      id: uuidv4(),
      patientId,
      doctorId: anis.id,
      date: dateIso,
      status,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  addApt(
    khaled.id,
    isoLocalSlice(twoWeeksAgo, 9),
    'finished',
    '[Démo MedERP Tunis] Consultation : tension artérielle stable. Conseils hygiène de vie et activité physique modérée.'
  );
  addApt(
    khaled.id,
    isoLocalSlice(lastWeek, 10),
    'finished',
    '[Démo MedERP Tunis] Suivi : bilan glycémique à jeun correct. Rappel des signes d’alerte.'
  );
  addApt(
    khaled.id,
    isoLocalSlice(now, 11),
    'in-consultation',
    '[Démo MedERP Tunis] Consultation en cours : examen clinique abdominal, ordonnance en cours d’édition.'
  );

  addApt(
    yassine.id,
    isoLocalSlice(tomorrow, 10),
    'waiting',
    '[Démo MedERP Tunis] Rendez-vous programmé : première visite — motif douleurs articulaires.'
  );

  addApt(
    fatma.id,
    isoLocalSlice(lastWeek, 15),
    'finished',
    '[Démo MedERP Tunis] Visite de contrôle post-opératoire — cicatrisation satisfaisante.'
  );
}
