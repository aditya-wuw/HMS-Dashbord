import { query } from '../db/index.js';

export const getAllStaff = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT id, name, staff_id AS "staffId", role, department, contact_number AS "contactNumber", email,
             joining_date AS "joiningDate", qualification, schedule, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM staff
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStaffByDepartment = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT id, name, staff_id AS "staffId", role, department, contact_number AS "contactNumber", email,
             joining_date AS "joiningDate", qualification, schedule, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM staff
      WHERE department = $1
    `, [req.params.department]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStaffByRole = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT id, name, staff_id AS "staffId", role, department, contact_number AS "contactNumber", email,
             joining_date AS "joiningDate", qualification, schedule, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM staff
      WHERE role = $1
    `, [req.params.role]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStaffById = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT id, name, staff_id AS "staffId", role, department, contact_number AS "contactNumber", email,
             joining_date AS "joiningDate", qualification, schedule, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM staff
      WHERE id = $1
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { name, staffId, role, department, contactNumber, email, joiningDate, qualification, schedule } = req.body;
    const { rows } = await query(`
      INSERT INTO staff (name, staff_id, role, department, contact_number, email, joining_date, qualification, schedule)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, name, staff_id AS "staffId", role, department, contact_number AS "contactNumber", email,
                joining_date AS "joiningDate", qualification, schedule, created_at AS "createdAt", updated_at AS "updatedAt"
    `, [name, staffId, role, department, contactNumber, email, joiningDate || new Date(), qualification, JSON.stringify(schedule || [])]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const fields = {
      name: req.body.name,
      staff_id: req.body.staffId,
      role: req.body.role,
      department: req.body.department,
      contact_number: req.body.contactNumber,
      email: req.body.email,
      joining_date: req.body.joiningDate,
      qualification: req.body.qualification,
      schedule: req.body.schedule ? JSON.stringify(req.body.schedule) : undefined
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
      UPDATE staff SET ${setClause.join(', ')}
      WHERE id = $${index}
      RETURNING id, name, staff_id AS "staffId", role, department, contact_number AS "contactNumber", email,
                joining_date AS "joiningDate", qualification, schedule, created_at AS "createdAt", updated_at AS "updatedAt"
    `, values);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM staff WHERE id = $1', [req.params.id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.json({ message: 'Staff removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT ap.id, ap.date, ap.time, ap.status, ap.purpose, ap.notes, ap.created_at AS "createdAt", ap.updated_at AS "updatedAt",
             json_build_object('id', p.id, 'name', p.name, 'age', p.age, 'gender', p.gender, 'contactNumber', p.contact_number) AS patient
      FROM appointments ap
      JOIN patients p ON ap.patient_id = p.id
      WHERE ap.doctor_id = $1
      ORDER BY ap.date DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStaffSchedule = async (req, res) => {
  try {
    const { rows } = await query('SELECT schedule FROM staff WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.json(rows[0].schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};