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

// Seed doctors at startup (3-4 per specialty)
export function seedDoctors() {
  const doctors = [
    // Cardiology (4 doctors)
    { email: 'dr.smith@hospital.com', name: 'Dr. John Smith', specialty: 'Cardiology' },
    { email: 'dr.anderson@hospital.com', name: 'Dr. Sarah Anderson', specialty: 'Cardiology' },
    { email: 'dr.thompson@hospital.com', name: 'Dr. Robert Thompson', specialty: 'Cardiology' },
    { email: 'dr.white@hospital.com', name: 'Dr. Jennifer White', specialty: 'Cardiology' },
    
    // Neurology (3 doctors)
    { email: 'dr.johnson@hospital.com', name: 'Dr. Emily Johnson', specialty: 'Neurology' },
    { email: 'dr.miller@hospital.com', name: 'Dr. Thomas Miller', specialty: 'Neurology' },
    { email: 'dr.davis@hospital.com', name: 'Dr. Patricia Davis', specialty: 'Neurology' },
    
    // Pediatrics (4 doctors)
    { email: 'dr.williams@hospital.com', name: 'Dr. Michael Williams', specialty: 'Pediatrics' },
    { email: 'dr.moore@hospital.com', name: 'Dr. Linda Moore', specialty: 'Pediatrics' },
    { email: 'dr.taylor@hospital.com', name: 'Dr. James Taylor', specialty: 'Pediatrics' },
    { email: 'dr.clark@hospital.com', name: 'Dr. Barbara Clark', specialty: 'Pediatrics' },
    
    // Orthopedics (3 doctors)
    { email: 'dr.brown@hospital.com', name: 'Dr. Sarah Brown', specialty: 'Orthopedics' },
    { email: 'dr.hall@hospital.com', name: 'Dr. Richard Hall', specialty: 'Orthopedics' },
    { email: 'dr.allen@hospital.com', name: 'Dr. Susan Allen', specialty: 'Orthopedics' },
    
    // Dermatology (3 doctors)
    { email: 'dr.jones@hospital.com', name: 'Dr. David Jones', specialty: 'Dermatology' },
    { email: 'dr.young@hospital.com', name: 'Dr. Margaret Young', specialty: 'Dermatology' },
    { email: 'dr.king@hospital.com', name: 'Dr. Christopher King', specialty: 'Dermatology' },
    
    // General Practice (4 doctors)
    { email: 'dr.wilson@hospital.com', name: 'Dr. James Wilson', specialty: 'General Practice' },
    { email: 'dr.martin@hospital.com', name: 'Dr. Nancy Martin', specialty: 'General Practice' },
    { email: 'dr.garcia@hospital.com', name: 'Dr. Maria Garcia', specialty: 'General Practice' },
    { email: 'dr.lee@hospital.com', name: 'Dr. Lisa Lee', specialty: 'General Practice' }
  ];

  const defaultPassword = 'doctor123';
  const passwordHash = bcrypt.hashSync(defaultPassword, 10);

  doctors.forEach(doctor => {
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
