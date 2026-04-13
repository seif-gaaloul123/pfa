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

/** Médecins — clinique tunisienne */
export function seedDoctors() {
  const doctors = [
    { email: 'dr.anis.belhaj@clinique.tn', name: 'Dr. Anis Belhaj', specialty: 'Cardiologue' },
    { email: 'dr.selima.bouzidi@clinique.tn', name: 'Dr. Selima Bouzidi', specialty: 'Pédiatre' },
    { email: 'dr.omar.jaziri@clinique.tn', name: 'Dr. Omar Jaziri', specialty: 'Ophtalmologue' },
    { email: 'dr.myriam.bensalem@clinique.tn', name: 'Dr. Myriam Ben Salem', specialty: 'Gynécologue' },
    { email: 'dr.walid.hammami@clinique.tn', name: 'Dr. Walid Hammami', specialty: 'Orthopédiste' }
  ];

  const defaultPassword = 'doctor123';
  const passwordHash = bcrypt.hashSync(defaultPassword, 10);

  doctors.forEach((doctor) => {
    const existing = db.users.find((u) => u.email.toLowerCase() === doctor.email.toLowerCase());
    if (!existing) {
      db.users.push({
        id: `doc_${doctor.name.split(' ')[1].toLowerCase()}`,
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

export function autoUpdateStatuses() {
  const currentMoment = new Date(); // Represents now (e.g. 13 April 2026)
  const todayDateString = '2026-04-13';
  let changed = false;
  
  for (let a of db.appointments) {
    if (!a.date) continue;
    const aptDate = new Date(a.date);
    const aptDateStr = a.date.slice(0, 10);
    
    if (aptDateStr < todayDateString) {
      if (a.status !== 'finished') {
         a.status = 'finished';
         changed = true;
      }
    } else if (aptDateStr === todayDateString) {
      if (aptDate <= currentMoment) {
        if (a.status !== 'in-consultation' && a.status !== 'finished') {
          a.status = 'in-consultation';
          changed = true;
        }
      } else {
        if (a.status !== 'waiting' && a.status !== 'finished') {
          a.status = 'waiting';
          changed = true;
        }
      }
    }
  }
  if (changed) saveDatabase();
}

/** Patients et rendez-vous de démonstration (noms tunisiens) */
export function seedTunisianDemo() {
  const anis = db.users.find((u) => u.email?.toLowerCase() === 'dr.anis.belhaj@clinique.tn');
  const selima = db.users.find((u) => u.email?.toLowerCase() === 'dr.selima.bouzidi@clinique.tn');
  const walid = db.users.find((u) => u.email?.toLowerCase() === 'dr.walid.hammami@clinique.tn');
  if (!anis || !selima || !walid) return;

  const defaultPassword = 'patient123';
  const passwordHash = bcrypt.hashSync(defaultPassword, 10);

  const demoPatients = [
    {
      firstName: 'Khaled',
      lastName: 'Alfessi',
      dateOfBirth: '1985-03-12',
      email: 'khaled.alfessi@patient.tn',
      phone: '98123456',
      allergies: '',
      notes: '',
      bloodType: 'O+',
      passwordHash
    },
    {
      firstName: 'Amira',
      lastName: 'Dridi',
      dateOfBirth: '1990-06-18',
      email: 'amira.dridi@patient.tn',
      phone: '55234567',
      allergies: 'Pénicilline',
      notes: '',
      bloodType: 'A-',
      passwordHash
    },
    {
      firstName: 'Youssef',
      lastName: 'Ennaifer',
      dateOfBirth: '1988-11-03',
      email: 'youssef.ennaifer@patient.tn',
      phone: '22345678',
      allergies: '',
      notes: '',
      bloodType: 'B+',
      passwordHash
    },
    {
      firstName: 'Meriem',
      lastName: 'Toumi',
      dateOfBirth: '1995-02-25',
      email: 'meriem.toumi@patient.tn',
      phone: '99456789',
      allergies: 'Latex',
      notes: '',
      bloodType: 'AB+',
      passwordHash
    },
    {
      firstName: 'Sami',
      lastName: 'Ben Amor',
      dateOfBirth: '1982-09-14',
      email: 'sami.benamor@patient.tn',
      phone: '23567890',
      allergies: 'Asthmatique',
      notes: '',
      bloodType: 'O-',
      passwordHash
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

  const khaled = patientByKey['Khaled_Alfessi'];
  const amira = patientByKey['Amira_Dridi'];
  const youssef = patientByKey['Youssef_Ennaifer'];
  const meriem = patientByKey['Meriem_Toumi'];
  const sami = patientByKey['Sami_Ben Amor'];
  if (!khaled) return;

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

  const addApt = (patientId, doctorId, dateIso, status, notes) => {
    db.appointments.push({
      id: uuidv4(),
      patientId,
      doctorId,
      date: dateIso,
      status,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  // Khaled — 3 RDV (historique + en cours) chez Walid
  addApt(
    khaled.id,
    walid.id,
    isoLocalSlice(twoWeeksAgo, 9),
    'finished',
    '[Démo MedERP Tunis] Consultation : tension artérielle stable. Conseils hygiène de vie et activité physique modérée.'
  );
  addApt(
    khaled.id,
    walid.id,
    isoLocalSlice(lastWeek, 10),
    'finished',
    '[Démo MedERP Tunis] Suivi : bilan glycémique à jeun correct. Rappel des signes d\'alerte.'
  );
  addApt(
    khaled.id,
    walid.id,
    isoLocalSlice(now, 11),
    'in-consultation',
    '[Démo MedERP Tunis] Consultation en cours : examen clinique abdominal, ordonnance en cours d\'édition.'
  );

  // Amira — RDV demain chez Selima (Pédiatre)
  if (amira) {
    addApt(
      amira.id,
      selima.id,
      isoLocalSlice(tomorrow, 10),
      'waiting',
      '[Démo MedERP Tunis] Rendez-vous programmé : contrôle pédiatrique enfant.'
    );
  }

  // Youssef — RDV la semaine dernière (terminé) chez Anis
  if (youssef) {
    addApt(
      youssef.id,
      anis.id,
      isoLocalSlice(lastWeek, 14),
      'finished',
      '[Démo MedERP Tunis] Consultation ophtalmologique — bilan de vision complet.'
    );
  }

  // Meriem — RDV demain chez Selima
  if (meriem) {
    addApt(
      meriem.id,
      selima.id,
      isoLocalSlice(tomorrow, 14),
      'waiting',
      '[Démo MedERP Tunis] Rendez-vous programmé : suivi gynécologique trimestriel.'
    );
  }

  // Sami — RDV passé chez Selima
  if (sami) {
    addApt(
      sami.id,
      selima.id,
      isoLocalSlice(lastWeek, 15),
      'finished',
      '[Démo MedERP Tunis] Visite de contrôle post-opératoire — rééducation en cours.'
    );
  }
}
