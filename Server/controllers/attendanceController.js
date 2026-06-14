import { query } from '../db/index.js';

export const getAllAttendance = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT a.id, a.date, a.check_in AS "checkIn", a.check_out AS "checkOut", a.status, a.notes,
             a.created_at AS "createdAt", a.updated_at AS "updatedAt",
             json_build_object('id', s.id, 'name', s.name, 'staffId', s.staff_id, 'role', s.role, 'department', s.department) AS "staffId"
      FROM attendance a
      JOIN staff s ON a.staff_id = s.id
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching attendance records' });
  }
};

export const getAttendanceByDate = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT a.id, a.date, a.check_in AS "checkIn", a.check_out AS "checkOut", a.status, a.notes,
             a.created_at AS "createdAt", a.updated_at AS "updatedAt",
             json_build_object('id', s.id, 'name', s.name, 'staffId', s.staff_id, 'role', s.role, 'department', s.department) AS "staffId"
      FROM attendance a
      JOIN staff s ON a.staff_id = s.id
      WHERE a.date = $1::date
    `, [req.params.date]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching attendance records by date' });
  }
};

export const getStaffAttendance = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT a.id, a.date, a.check_in AS "checkIn", a.check_out AS "checkOut", a.status, a.notes,
             a.created_at AS "createdAt", a.updated_at AS "updatedAt",
             json_build_object('id', s.id, 'name', s.name, 'staffId', s.staff_id, 'role', s.role, 'department', s.department) AS "staffId"
      FROM attendance a
      JOIN staff s ON a.staff_id = s.id
      WHERE a.staff_id = $1
      ORDER BY a.date DESC
    `, [req.params.staffId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching staff attendance' });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const staffRes = await query('SELECT id FROM staff WHERE id = $1', [req.body.staffId]);
    if (staffRes.rows.length === 0) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    const { staffId, date, checkIn, checkOut, status, notes } = req.body;

    const existRes = await query('SELECT * FROM attendance WHERE staff_id = $1 AND date = $2::date', [staffId, date]);
    if (existRes.rows.length > 0) {
      const existing = existRes.rows[0];
      const nextCheckIn = checkIn || existing.check_in;
      const nextCheckOut = checkOut || existing.check_out;
      const nextStatus = status || existing.status;
      const nextNotes = notes || existing.notes;
      
      const updateRes = await query(`
        UPDATE attendance SET check_in = $1, check_out = $2, status = $3, notes = $4
        WHERE staff_id = $5 AND date = $6::date
        RETURNING id, staff_id AS "staffId", date, check_in AS "checkIn", check_out AS "checkOut", status, notes,
                  created_at AS "createdAt", updated_at AS "updatedAt"
      `, [nextCheckIn, nextCheckOut, nextStatus, nextNotes, staffId, date]);
      return res.json(updateRes.rows[0]);
    }

    const insertRes = await query(`
      INSERT INTO attendance (staff_id, date, check_in, check_out, status, notes)
      VALUES ($1, $2::date, $3, $4, $5, $6)
      RETURNING id, staff_id AS "staffId", date, check_in AS "checkIn", check_out AS "checkOut", status, notes,
                created_at AS "createdAt", updated_at AS "updatedAt"
    `, [staffId, date, checkIn, checkOut, status || 'Present', notes]);
    res.status(201).json(insertRes.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error while marking attendance' });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const fields = {
      staff_id: req.body.staffId,
      date: req.body.date,
      check_in: req.body.checkIn,
      check_out: req.body.checkOut,
      status: req.body.status,
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
      UPDATE attendance SET ${setClause.join(', ')}
      WHERE id = $${index}
      RETURNING id, staff_id AS "staffId", date, check_in AS "checkIn", check_out AS "checkOut", status, notes,
                created_at AS "createdAt", updated_at AS "updatedAt"
    `, values);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating attendance' });
  }
};