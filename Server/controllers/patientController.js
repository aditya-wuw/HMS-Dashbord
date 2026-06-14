import { query } from '../db/index.js';

export const getPatients = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT id, name, age, gender, contact_number AS "contactNumber", email, address,
             blood_group AS "bloodGroup", medical_history AS "medicalHistory",
             emergency_contact AS "emergencyContact", allergies, current_medications AS "currentMedications",
             created_at AS "createdAt", updated_at AS "updatedAt"
      FROM patients
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAdmissions = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT a.id, a.room_number AS "roomNumber", a.bed_number AS "bedNumber",
             a.admission_date AS "admissionDate", a.discharge_date AS "dischargeDate",
             a.diagnosis, a.treatment_plan AS "treatmentPlan", a.status,
             a.created_at AS "createdAt", a.updated_at AS "updatedAt",
             json_build_object('id', p.id, 'name', p.name, 'age', p.age, 'gender', p.gender, 'contactNumber', p.contact_number) AS patient,
             json_build_object('id', s.id, 'name', s.name, 'role', s.role, 'department', s.department) AS "admittedBy"
      FROM admissions a
      JOIN patients p ON a.patient_id = p.id
      JOIN staff s ON a.admitted_by = s.id
      ORDER BY a.admission_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT id, name, age, gender, contact_number AS "contactNumber", email, address,
             blood_group AS "bloodGroup", medical_history AS "medicalHistory",
             emergency_contact AS "emergencyContact", allergies, current_medications AS "currentMedications",
             created_at AS "createdAt", updated_at AS "updatedAt"
      FROM patients
      WHERE id = $1
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPatient = async (req, res) => {
  try {
    const { name, age, gender, contactNumber, email, address, bloodGroup, medicalHistory, emergencyContact, allergies, currentMedications } = req.body;
    const { rows } = await query(`
      INSERT INTO patients (name, age, gender, contact_number, email, address, blood_group, medical_history, emergency_contact, allergies, current_medications)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, name, age, gender, contact_number AS "contactNumber", email, address,
                blood_group AS "bloodGroup", medical_history AS "medicalHistory",
                emergency_contact AS "emergencyContact", allergies, current_medications AS "currentMedications",
                created_at AS "createdAt", updated_at AS "updatedAt"
    `, [name, age, gender, contactNumber, email, address, bloodGroup, medicalHistory || '', emergencyContact, allergies || [], currentMedications || []]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const fields = {
      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
      contact_number: req.body.contactNumber,
      email: req.body.email,
      address: req.body.address,
      blood_group: req.body.bloodGroup,
      medical_history: req.body.medicalHistory,
      emergency_contact: req.body.emergencyContact,
      allergies: req.body.allergies,
      current_medications: req.body.currentMedications
    };
    
    const setClause = [];
    const values = [];
    let index = 1;
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) {
        setClause.push(`${key} = $${index}`);
        values.push(val);
        index++;
      }
    }
    if (setClause.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    values.push(req.params.id);
    
    const { rows } = await query(`
      UPDATE patients SET ${setClause.join(', ')}
      WHERE id = $${index}
      RETURNING id, name, age, gender, contact_number AS "contactNumber", email, address,
                blood_group AS "bloodGroup", medical_history AS "medicalHistory",
                emergency_contact AS "emergencyContact", allergies, current_medications AS "currentMedications",
                created_at AS "createdAt", updated_at AS "updatedAt"
    `, values);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM patients WHERE id = $1', [req.params.id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ message: 'Patient removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientAppointments = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT ap.id, ap.date, ap.time, ap.status, ap.purpose, ap.notes, ap.created_at AS "createdAt", ap.updated_at AS "updatedAt",
             json_build_object('id', s.id, 'name', s.name, 'role', s.role, 'department', s.department) AS doctor
      FROM appointments ap
      JOIN staff s ON ap.doctor_id = s.id
      WHERE ap.patient_id = $1
      ORDER BY ap.date DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientAdmissions = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT ad.id, ad.room_number AS "roomNumber", ad.bed_number AS "bedNumber",
             ad.admission_date AS "admissionDate", ad.discharge_date AS "dischargeDate",
             ad.diagnosis, ad.treatment_plan AS "treatmentPlan", ad.status,
             ad.created_at AS "createdAt", ad.updated_at AS "updatedAt",
             json_build_object('id', s.id, 'name', s.name, 'role', s.role, 'department', s.department) AS "admittedBy"
      FROM admissions ad
      JOIN staff s ON ad.admitted_by = s.id
      WHERE ad.patient_id = $1
      ORDER BY ad.admission_date DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT ap.id, ap.date, ap.time, ap.status, ap.purpose, ap.notes, ap.created_at AS "createdAt", ap.updated_at AS "updatedAt",
             json_build_object('id', p.id, 'name', p.name, 'age', p.age, 'gender', p.gender, 'contactNumber', p.contact_number) AS patient,
             json_build_object('id', s.id, 'name', s.name, 'role', s.role, 'department', s.department) AS doctor
      FROM appointments ap
      JOIN patients p ON ap.patient_id = p.id
      JOIN staff s ON ap.doctor_id = s.id
      ORDER BY ap.date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, time, status, purpose, notes } = req.body;
    const { rows } = await query(`
      INSERT INTO appointments (patient_id, doctor_id, date, time, status, purpose, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, patient_id AS "patientId", doctor_id AS "doctorId", date, time, status, purpose, notes,
                created_at AS "createdAt", updated_at AS "updatedAt"
    `, [patientId, doctorId, date, time, status || 'Scheduled', purpose, notes]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const fields = {
      patient_id: req.body.patientId,
      doctor_id: req.body.doctorId,
      date: req.body.date,
      time: req.body.time,
      status: req.body.status,
      purpose: req.body.purpose,
      notes: req.body.notes
    };
    
    const setClause = [];
    const values = [];
    let index = 1;
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) {
        setClause.push(`${key} = $${index}`);
        values.push(val);
        index++;
      }
    }
    if (setClause.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    values.push(req.params.id);
    
    const { rows } = await query(`
      UPDATE appointments SET ${setClause.join(', ')}
      WHERE id = $${index}
      RETURNING id, patient_id AS "patientId", doctor_id AS "doctorId", date, time, status, purpose, notes,
                created_at AS "createdAt", updated_at AS "updatedAt"
    `, values);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['Scheduled', 'Completed', 'Cancelled', 'No-Show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const { rows } = await query(`
      UPDATE appointments SET status = $1
      WHERE id = $2
      RETURNING id, status, created_at AS "createdAt", updated_at AS "updatedAt"
    `, [status, id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createAdmission = async (req, res) => {
  try {
    const { patientId, doctorId, roomNumber, bedNumber, admissionDate, diagnosis, treatmentPlan, status } = req.body;
    const { rows } = await query(`
      INSERT INTO admissions (patient_id, admitted_by, room_number, bed_number, admission_date, diagnosis, treatment_plan, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, patient_id AS "patientId", admitted_by AS "doctorId", room_number AS "roomNumber", bed_number AS "bedNumber",
                admission_date AS "admissionDate", diagnosis, treatment_plan AS "treatmentPlan", status,
                created_at AS "createdAt", updated_at AS "updatedAt"
    `, [patientId, doctorId, roomNumber, bedNumber, admissionDate || new Date(), diagnosis, treatmentPlan, status || 'Admitted']);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAdmission = async (req, res) => {
  try {
    const fields = {
      patient_id: req.body.patientId,
      admitted_by: req.body.doctorId,
      room_number: req.body.roomNumber,
      bed_number: req.body.bedNumber,
      admission_date: req.body.admissionDate,
      diagnosis: req.body.diagnosis,
      treatment_plan: req.body.treatmentPlan,
      status: req.body.status
    };
    
    const setClause = [];
    const values = [];
    let index = 1;
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) {
        setClause.push(`${key} = $${index}`);
        values.push(val);
        index++;
      }
    }
    if (setClause.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    values.push(req.params.id);
    
    const { rows } = await query(`
      UPDATE admissions SET ${setClause.join(', ')}
      WHERE id = $${index}
      RETURNING id, patient_id AS "patientId", admitted_by AS "doctorId", room_number AS "roomNumber", bed_number AS "bedNumber",
                admission_date AS "admissionDate", diagnosis, treatment_plan AS "treatmentPlan", status,
                created_at AS "createdAt", updated_at AS "updatedAt"
    `, values);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Admission not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const dischargePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { dischargeDate } = req.body;
    const { rows } = await query(`
      UPDATE admissions SET status = 'Discharged', discharge_date = $1
      WHERE id = $2
      RETURNING id, patient_id AS "patientId", admitted_by AS "doctorId", room_number AS "roomNumber", bed_number AS "bedNumber",
                admission_date AS "admissionDate", discharge_date AS "dischargeDate", diagnosis, treatment_plan AS "treatmentPlan", status,
                created_at AS "createdAt", updated_at AS "updatedAt"
    `, [dischargeDate || new Date(), id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Admission not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};