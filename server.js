const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PIN = process.env.ADMIN_PIN || '1234';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const usePostgres = Boolean(process.env.DATABASE_URL);
let pgPool = null;
let sqliteDb = null;

async function initDatabase() {
  if (usePostgres) {
    const { Pool } = require('pg');
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        passId TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        protocol TEXT NOT NULL,
        date TEXT NOT NULL,
        slot TEXT NOT NULL,
        notes TEXT,
        fee INTEGER DEFAULT 800,
        status TEXT DEFAULT 'Pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id SERIAL PRIMARY KEY,
        rxId TEXT UNIQUE NOT NULL,
        date TEXT NOT NULL,
        patientName TEXT NOT NULL,
        ageGender TEXT,
        phone TEXT,
        diagnosis TEXT,
        medicationsJson TEXT,
        advice TEXT,
        followUpDate TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Connected to PostgreSQL persistent database.');
  } else {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, 'clinic.db');
    sqliteDb = new sqlite3.Database(dbPath);
    sqliteDb.serialize(() => {
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS appointments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          passId TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          protocol TEXT NOT NULL,
          date TEXT NOT NULL,
          slot TEXT NOT NULL,
          notes TEXT,
          fee INTEGER DEFAULT 800,
          status TEXT DEFAULT 'Pending',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS prescriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          rxId TEXT UNIQUE NOT NULL,
          date TEXT NOT NULL,
          patientName TEXT NOT NULL,
          ageGender TEXT,
          phone TEXT,
          diagnosis TEXT,
          medicationsJson TEXT,
          advice TEXT,
          followUpDate TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    });
    console.log('Connected to local SQLite database (clinic.db).');
  }
}

// Verify Admin PIN via server
app.post('/api/admin/verify', (req, res) => {
  const pin = String(req.body?.pin || '').trim();
  if (pin === String(ADMIN_PIN)) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, error: 'Invalid Admin PIN' });
});

// Get all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    if (usePostgres) {
      const { rows } = await pgPool.query('SELECT passid AS "passId", name, phone, protocol, date, slot, notes, fee, status FROM appointments ORDER BY id DESC');
      return res.json(rows);
    }
    sqliteDb.all('SELECT passId, name, phone, protocol, date, slot, notes, fee, status FROM appointments ORDER BY id DESC', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update appointment
app.post('/api/appointments', async (req, res) => {
  const { passId, name, phone, protocol, date, slot, notes, fee, status } = req.body;
  if (!passId || !name || !phone || !protocol) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const cleanDate = date || new Date().toISOString().split('T')[0];
  const cleanSlot = slot || 'Morning Suite';
  const cleanFee = Number(fee) || 800;
  const cleanStatus = status || 'Pending';

  try {
    if (usePostgres) {
      await pgPool.query(
        `INSERT INTO appointments (passId, name, phone, protocol, date, slot, notes, fee, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (passId) DO UPDATE SET
           name = EXCLUDED.name,
           phone = EXCLUDED.phone,
           protocol = EXCLUDED.protocol,
           date = EXCLUDED.date,
           slot = EXCLUDED.slot,
           notes = EXCLUDED.notes,
           fee = EXCLUDED.fee,
           status = EXCLUDED.status`,
        [passId, name, phone, protocol, cleanDate, cleanSlot, notes || '', cleanFee, cleanStatus]
      );
      return res.status(201).json({ success: true, passId });
    }

    sqliteDb.run(
      `INSERT INTO appointments (passId, name, phone, protocol, date, slot, notes, fee, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(passId) DO UPDATE SET
         name = excluded.name,
         phone = excluded.phone,
         protocol = excluded.protocol,
         date = excluded.date,
         slot = excluded.slot,
         notes = excluded.notes,
         fee = excluded.fee,
         status = excluded.status`,
      [passId, name, phone, protocol, cleanDate, cleanSlot, notes || '', cleanFee, cleanStatus],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ success: true, passId });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update appointment status
app.patch('/api/appointments/:passId/status', async (req, res) => {
  const { status } = req.body;
  const { passId } = req.params;
  if (!status) return res.status(400).json({ error: 'Missing status' });

  try {
    if (usePostgres) {
      await pgPool.query('UPDATE appointments SET status = $1 WHERE passId = $2', [status, passId]);
      return res.json({ success: true });
    }
    sqliteDb.run('UPDATE appointments SET status = ? WHERE passId = ?', [status, passId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete appointment
app.delete('/api/appointments/:passId', async (req, res) => {
  const { passId } = req.params;
  try {
    if (usePostgres) {
      await pgPool.query('DELETE FROM appointments WHERE passId = $1', [passId]);
      return res.json({ success: true });
    }
    sqliteDb.run('DELETE FROM appointments WHERE passId = ?', [passId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all prescriptions
app.get('/api/prescriptions', async (req, res) => {
  try {
    if (usePostgres) {
      const { rows } = await pgPool.query(
        'SELECT rxid AS "rxId", date, patientname AS "patientName", agegender AS "ageGender", phone, diagnosis, medicationsjson AS "medicationsJson", advice, followupdate AS "followUpDate" FROM prescriptions ORDER BY id DESC'
      );
      return res.json(rows.map((r) => ({ ...r, medications: JSON.parse(r.medicationsJson || '[]') })));
    }

    sqliteDb.all('SELECT * FROM prescriptions ORDER BY id DESC', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows.map((r) => ({
        rxId: r.rxId,
        date: r.date,
        patientName: r.patientName,
        ageGender: r.ageGender,
        phone: r.phone,
        diagnosis: r.diagnosis,
        medications: JSON.parse(r.medicationsJson || '[]'),
        advice: r.advice,
        followUpDate: r.followUpDate
      })));
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save or update prescription
app.post('/api/prescriptions', async (req, res) => {
  const { rxId, date, patientName, ageGender, phone, diagnosis, medications, advice, followUpDate } = req.body;
  if (!rxId || !patientName) return res.status(400).json({ error: 'Missing rxId or patientName' });

  const cleanDate = date || new Date().toISOString().split('T')[0];
  const medJson = JSON.stringify(Array.isArray(medications) ? medications : []);

  try {
    if (usePostgres) {
      await pgPool.query(
        `INSERT INTO prescriptions (rxId, date, patientName, ageGender, phone, diagnosis, medicationsJson, advice, followUpDate)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (rxId) DO UPDATE SET
           date = EXCLUDED.date,
           patientName = EXCLUDED.patientName,
           ageGender = EXCLUDED.ageGender,
           phone = EXCLUDED.phone,
           diagnosis = EXCLUDED.diagnosis,
           medicationsJson = EXCLUDED.medicationsJson,
           advice = EXCLUDED.advice,
           followUpDate = EXCLUDED.followUpDate`,
        [rxId, cleanDate, patientName, ageGender || '—', phone || '—', diagnosis || 'Dermatology Evaluation', medJson, advice || '', followUpDate || '']
      );
      return res.status(201).json({ success: true, rxId });
    }

    sqliteDb.run(
      `INSERT INTO prescriptions (rxId, date, patientName, ageGender, phone, diagnosis, medicationsJson, advice, followUpDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(rxId) DO UPDATE SET
         date = excluded.date,
         patientName = excluded.patientName,
         ageGender = excluded.ageGender,
         phone = excluded.phone,
         diagnosis = excluded.diagnosis,
         medicationsJson = excluded.medicationsJson,
         advice = excluded.advice,
         followUpDate = excluded.followUpDate`,
      [rxId, cleanDate, patientName, ageGender || '—', phone || '—', diagnosis || 'Dermatology Evaluation', medJson, advice || '', followUpDate || ''],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ success: true, rxId });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Siya Cosmoderma Hub Clinic server running on http://localhost:${PORT}`);
  });
});