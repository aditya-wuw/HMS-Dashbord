import { query } from '../db/index.js';

export const getAllBills = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT b.id, b.bill_type AS "billType", b.items, b.payments, b.total_amount AS "totalAmount",
             b.paid_amount AS "paidAmount", b.payment_status AS "paymentStatus", b.payment_method AS "paymentMethod",
             b.bill_date AS "billDate", b.due_date AS "dueDate", b.created_at AS "createdAt", b.updated_at AS "updatedAt",
             json_build_object('id', p.id, 'name', p.name, 'contactNumber', p.contact_number) AS patient
      FROM bills b
      JOIN patients p ON b.patient_id = p.id
      ORDER BY b.bill_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBillById = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT b.id, b.bill_type AS "billType", b.items, b.payments, b.total_amount AS "totalAmount",
             b.paid_amount AS "paidAmount", b.payment_status AS "paymentStatus", b.payment_method AS "paymentMethod",
             b.bill_date AS "billDate", b.due_date AS "dueDate", b.created_at AS "createdAt", b.updated_at AS "updatedAt",
             json_build_object('id', p.id, 'name', p.name, 'contactNumber', p.contact_number, 'email', p.email) AS patient,
             CASE WHEN b.admission_id IS NOT NULL THEN json_build_object('id', ad.id, 'admissionDate', ad.admission_date, 'dischargeDate', ad.discharge_date) ELSE NULL END AS admission,
             CASE WHEN b.appointment_id IS NOT NULL THEN json_build_object('id', ap.id, 'date', ap.date, 'time', ap.time, 'purpose', ap.purpose) ELSE NULL END AS appointment
      FROM bills b
      JOIN patients p ON b.patient_id = p.id
      LEFT JOIN admissions ad ON b.admission_id = ad.id
      LEFT JOIN appointments ap ON b.appointment_id = ap.id
      WHERE b.id = $1
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const extractId = (val) => {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'object') {
    return val.id || val._id || undefined;
  }
  return val;
};

export const createBill = async (req, res) => {
  try {
    const { patientId, admissionId, appointmentId, billType, items, totalAmount, paidAmount, paymentStatus, paymentMethod, billDate, dueDate, patient, admission, appointment } = req.body;
    
    const finalPatientId = extractId(patientId !== undefined ? patientId : patient);
    const finalAdmissionId = extractId(admissionId !== undefined ? admissionId : admission);
    const finalAppointmentId = extractId(appointmentId !== undefined ? appointmentId : appointment);

    const { rows } = await query(`
      INSERT INTO bills (patient_id, admission_id, appointment_id, bill_type, items, total_amount, paid_amount, payment_status, payment_method, bill_date, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, patient_id AS "patientId", admission_id AS "admissionId", appointment_id AS "appointmentId",
                bill_type AS "billType", items, total_amount AS "totalAmount", paid_amount AS "paidAmount",
                payment_status AS "paymentStatus", payment_method AS "paymentMethod", bill_date AS "billDate", due_date AS "dueDate",
                created_at AS "createdAt", updated_at AS "updatedAt"
    `, [finalPatientId, finalAdmissionId || null, finalAppointmentId || null, billType, JSON.stringify(items || []), totalAmount, paidAmount || 0, paymentStatus || 'Pending', paymentMethod, billDate || new Date(), dueDate]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateBill = async (req, res) => {
  try {
    const { patientId, admissionId, appointmentId, patient, admission, appointment } = req.body;
    
    const finalPatientId = extractId(patientId !== undefined ? patientId : patient);
    const finalAdmissionId = extractId(admissionId !== undefined ? admissionId : admission);
    const finalAppointmentId = extractId(appointmentId !== undefined ? appointmentId : appointment);

    const fields = {
      patient_id: finalPatientId,
      admission_id: finalAdmissionId,
      appointment_id: finalAppointmentId,
      bill_type: req.body.billType,
      items: req.body.items ? JSON.stringify(req.body.items) : undefined,
      total_amount: req.body.totalAmount,
      paid_amount: req.body.paidAmount,
      payment_status: req.body.paymentStatus,
      payment_method: req.body.paymentMethod,
      bill_date: req.body.billDate,
      due_date: req.body.dueDate
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
      UPDATE bills SET ${setClause.join(', ')}
      WHERE id = $${index}
      RETURNING id, patient_id AS "patientId", admission_id AS "admissionId", appointment_id AS "appointmentId",
                bill_type AS "billType", items, total_amount AS "totalAmount", paid_amount AS "paidAmount",
                payment_status AS "paymentStatus", payment_method AS "paymentMethod", bill_date AS "billDate", due_date AS "dueDate",
                created_at AS "createdAt", updated_at AS "updatedAt"
    `, values);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getBillsByStatus = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT b.id, b.bill_type AS "billType", b.items, b.payments, b.total_amount AS "totalAmount",
             b.paid_amount AS "paidAmount", b.payment_status AS "paymentStatus", b.payment_method AS "paymentMethod",
             b.bill_date AS "billDate", b.due_date AS "dueDate", b.created_at AS "createdAt", b.updated_at AS "updatedAt",
             json_build_object('id', p.id, 'name', p.name, 'contactNumber', p.contact_number) AS patient
      FROM bills b
      JOIN patients p ON b.patient_id = p.id
      WHERE b.payment_status = $1
      ORDER BY b.due_date ASC
    `, [req.params.status]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientBills = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT id, bill_type AS "billType", items, payments, total_amount AS "totalAmount",
             paid_amount AS "paidAmount", payment_status AS "paymentStatus", payment_method AS "paymentMethod",
             bill_date AS "billDate", due_date AS "dueDate", created_at AS "createdAt", updated_at AS "updatedAt"
      FROM bills
      WHERE patient_id = $1
      ORDER BY bill_date DESC
    `, [req.params.patientId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllInsuranceClaims = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT ic.id, ic.insurance_provider AS "insuranceProvider", ic.policy_number AS "policyNumber",
             ic.claim_amount AS "claimAmount", ic.approved_amount AS "approvedAmount", ic.status,
             ic.submission_date AS "submissionDate", ic.approval_date AS "approvalDate", ic.rejection_reason AS "rejectionReason",
             ic.notes, ic.created_at AS "createdAt", ic.updated_at AS "updatedAt",
             json_build_object('id', p.id, 'name', p.name, 'contactNumber', p.contact_number) AS patient,
             json_build_object('id', b.id, 'totalAmount', b.total_amount, 'billDate', b.bill_date) AS bill
      FROM insurance_claims ic
      JOIN patients p ON ic.patient_id = p.id
      JOIN bills b ON ic.bill_id = b.id
      ORDER BY ic.submission_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInsuranceClaimById = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT ic.id, ic.insurance_provider AS "insuranceProvider", ic.policy_number AS "policyNumber",
             ic.claim_amount AS "claimAmount", ic.approved_amount AS "approvedAmount", ic.status,
             ic.submission_date AS "submissionDate", ic.approval_date AS "approvalDate", ic.rejection_reason AS "rejectionReason",
             ic.notes, ic.created_at AS "createdAt", ic.updated_at AS "updatedAt",
             json_build_object('id', p.id, 'name', p.name, 'contactNumber', p.contact_number, 'email', p.email) AS patient,
             json_build_object('id', b.id, 'totalAmount', b.total_amount, 'billDate', b.bill_date, 'items', b.items) AS bill
      FROM insurance_claims ic
      JOIN patients p ON ic.patient_id = p.id
      JOIN bills b ON ic.bill_id = b.id
      WHERE ic.id = $1
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Insurance claim not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createInsuranceClaim = async (req, res) => {
  try {
    const { patientId, billId, insuranceProvider, policyNumber, claimAmount, approvedAmount, status, submissionDate, approvalDate, rejectionReason, notes, patient, bill } = req.body;
    
    const finalPatientId = extractId(patientId !== undefined ? patientId : patient);
    const finalBillId = extractId(billId !== undefined ? billId : bill);

    const { rows } = await query(`
      INSERT INTO insurance_claims (patient_id, bill_id, insurance_provider, policy_number, claim_amount, approved_amount, status, submission_date, approval_date, rejection_reason, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, patient_id AS "patientId", bill_id AS "billId", insurance_provider AS "insuranceProvider", policy_number AS "policyNumber",
                claim_amount AS "claimAmount", approved_amount AS "approvedAmount", status, submission_date AS "submissionDate",
                approval_date AS "approvalDate", rejection_reason AS "rejectionReason", notes, created_at AS "createdAt", updated_at AS "updatedAt"
    `, [finalPatientId, finalBillId, insuranceProvider, policyNumber, claimAmount, approvedAmount || null, status || 'Submitted', submissionDate || new Date(), approvalDate || null, rejectionReason || '', notes || '']);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateInsuranceClaim = async (req, res) => {
  try {
    const { patientId, billId, patient, bill } = req.body;

    const finalPatientId = extractId(patientId !== undefined ? patientId : patient);
    const finalBillId = extractId(billId !== undefined ? billId : bill);

    const fields = {
      patient_id: finalPatientId,
      bill_id: finalBillId,
      insurance_provider: req.body.insuranceProvider,
      policy_number: req.body.policyNumber,
      claim_amount: req.body.claimAmount,
      approved_amount: req.body.approvedAmount,
      status: req.body.status,
      submission_date: req.body.submissionDate,
      approval_date: req.body.approvalDate,
      rejection_reason: req.body.rejectionReason,
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
      UPDATE insurance_claims SET ${setClause.join(', ')}
      WHERE id = $${index}
      RETURNING id, patient_id AS "patientId", bill_id AS "billId", insurance_provider AS "insuranceProvider", policy_number AS "policyNumber",
                claim_amount AS "claimAmount", approved_amount AS "approvedAmount", status, submission_date AS "submissionDate",
                approval_date AS "approvalDate", rejection_reason AS "rejectionReason", notes, created_at AS "createdAt", updated_at AS "updatedAt"
    `, values);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Insurance claim not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getInsuranceClaimsByStatus = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT ic.id, ic.insurance_provider AS "insuranceProvider", ic.policy_number AS "policyNumber",
             ic.claim_amount AS "claimAmount", ic.approved_amount AS "approvedAmount", ic.status,
             ic.submission_date AS "submissionDate", ic.approval_date AS "approvalDate", ic.rejection_reason AS "rejectionReason",
             ic.notes, ic.created_at AS "createdAt", ic.updated_at AS "updatedAt",
             json_build_object('id', p.id, 'name', p.name) AS patient,
             json_build_object('id', b.id, 'totalAmount', b.total_amount) AS bill
      FROM insurance_claims ic
      JOIN patients p ON ic.patient_id = p.id
      JOIN bills b ON ic.bill_id = b.id
      WHERE ic.status = $1
      ORDER BY ic.submission_date DESC
    `, [req.params.status]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRevenueStats = async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().setMonth(new Date().getMonth() - 6));
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const { rows: bills } = await query(`
      SELECT total_amount AS "totalAmount", paid_amount AS "paidAmount", payment_method AS "paymentMethod",
             bill_type AS "billType", bill_date AS "billDate"
      FROM bills
      WHERE bill_date >= $1 AND bill_date <= $2
    `, [startDate, endDate]);

    const totalBilled = bills.reduce((sum, bill) => sum + parseFloat(bill.totalAmount || 0), 0);
    const totalPaid = bills.reduce((sum, bill) => sum + parseFloat(bill.paidAmount || 0), 0);

    const methodMap = {};
    bills.forEach(bill => {
      const method = bill.paymentMethod || 'Unknown';
      if (!methodMap[method]) {
        methodMap[method] = { _id: method, count: 0, total: 0 };
      }
      methodMap[method].count += 1;
      methodMap[method].total += parseFloat(bill.paidAmount || 0);
    });
    const paymentMethodBreakdown = Object.values(methodMap);

    const typeMap = {};
    bills.forEach(bill => {
      const btype = bill.billType;
      if (!typeMap[btype]) {
        typeMap[btype] = { _id: btype, count: 0, total: 0 };
      }
      typeMap[btype].count += 1;
      typeMap[btype].total += parseFloat(bill.totalAmount || 0);
    });
    const billTypeBreakdown = Object.values(typeMap);

    const monthlyData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

      const monthlyBills = bills.filter(bill => {
        const billDate = new Date(bill.billDate);
        return billDate >= month && billDate <= monthEnd;
      });

      const monthlyRevenue = monthlyBills.reduce((sum, bill) => sum + parseFloat(bill.paidAmount || 0), 0);
      const monthlyExpenses = Math.round(monthlyRevenue * 0.7);

      monthlyData.push({
        month: monthNames[month.getMonth()],
        revenue: monthlyRevenue,
        expenses: monthlyExpenses
      });
    }

    res.json({
      period: { startDate, endDate },
      totalBilled,
      totalPaid,
      outstanding: totalBilled - totalPaid,
      paymentMethodBreakdown,
      billTypeBreakdown,
      monthlyData,
      labels: monthlyData.map(item => item.month),
      datasets: [
        {
          label: 'Revenue',
          data: monthlyData.map(item => item.revenue),
          backgroundColor: '#3B82F6'
        },
        {
          label: 'Expenses',
          data: monthlyData.map(item => item.expenses),
          backgroundColor: '#F97316'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const recordPayment = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Valid payment amount is required' });
    }

    const { rows } = await query('SELECT total_amount AS "totalAmount", paid_amount AS "paidAmount", payments FROM bills WHERE id = $1', [req.params.billId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    const bill = rows[0];

    const newPaidAmount = parseFloat(bill.paidAmount || 0) + parseFloat(amount);
    if (newPaidAmount > parseFloat(bill.totalAmount)) {
      return res.status(400).json({ 
        message: `Payment amount exceeds remaining balance. Maximum payment allowed: ₹${(parseFloat(bill.totalAmount) - parseFloat(bill.paidAmount)).toFixed(2)}` 
      });
    }

    let paymentStatus = 'Pending';
    if (newPaidAmount >= parseFloat(bill.totalAmount)) {
      paymentStatus = 'Paid';
    } else if (newPaidAmount > 0) {
      paymentStatus = 'Partial';
    }

    const payments = Array.isArray(bill.payments) ? bill.payments : [];
    payments.push({
      amount: parseFloat(amount),
      date: new Date(),
      method: req.body.method || 'Cash'
    });

    const updateRes = await query(`
      UPDATE bills SET paid_amount = $1, payment_status = $2, payments = $3
      WHERE id = $4
      RETURNING id, total_amount AS "totalAmount", paid_amount AS "paidAmount", payment_status AS "paymentStatus"
    `, [newPaidAmount, paymentStatus, JSON.stringify(payments), req.params.billId]);

    res.json({ 
      message: 'Payment recorded successfully',
      bill: updateRes.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBill = async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM bills WHERE id = $1', [req.params.id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json({ message: 'Bill deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateClaimStatus = async (req, res) => {
  try {
    const { status, approvedAmount } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const claimRes = await query('SELECT * FROM insurance_claims WHERE id = $1', [req.params.id]);
    if (claimRes.rows.length === 0) {
      return res.status(404).json({ message: 'Insurance claim not found' });
    }

    const approvedVal = approvedAmount !== undefined && approvedAmount !== null ? parseFloat(approvedAmount) : null;
    const { rows } = await query(`
      UPDATE insurance_claims
      SET status = $1, approved_amount = COALESCE($2, approved_amount)
      WHERE id = $3
      RETURNING id, status, approved_amount AS "approvedAmount"
    `, [status, approvedVal, req.params.id]);

    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteInsuranceClaim = async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM insurance_claims WHERE id = $1', [req.params.id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Insurance claim not found' });
    }
    res.json({ message: 'Insurance claim deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientInsuranceClaims = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT ic.id, ic.insurance_provider AS "insuranceProvider", ic.policy_number AS "policyNumber",
             ic.claim_amount AS "claimAmount", ic.approved_amount AS "approvedAmount", ic.status,
             ic.submission_date AS "submissionDate", ic.approval_date AS "approvalDate", ic.rejection_reason AS "rejectionReason",
             ic.notes, ic.created_at AS "createdAt", ic.updated_at AS "updatedAt",
             json_build_object('id', b.id, 'totalAmount', b.total_amount, 'billDate', b.bill_date) AS bill
      FROM insurance_claims ic
      JOIN bills b ON ic.bill_id = b.id
      WHERE ic.patient_id = $1
      ORDER BY ic.submission_date DESC
    `, [req.params.patientId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingPayments = async (req, res) => {
  try {
    const { rows: pendingBills } = await query(`
      SELECT b.id, b.bill_type AS "billType", b.items, b.payments, b.total_amount AS "totalAmount",
             b.paid_amount AS "paidAmount", b.payment_status AS "paymentStatus", b.payment_method AS "paymentMethod",
             b.bill_date AS "billDate", b.due_date AS "dueDate", b.created_at AS "createdAt", b.updated_at AS "updatedAt",
             json_build_object('id', p.id, 'name', p.name, 'contactNumber', p.contact_number) AS patient
      FROM bills b
      JOIN patients p ON b.patient_id = p.id
      WHERE b.payment_status IN ('Pending', 'Partial')
      ORDER BY b.due_date ASC
    `);

    const total = pendingBills.reduce((sum, bill) => {
      return sum + (parseFloat(bill.totalAmount || 0) - parseFloat(bill.paidAmount || 0));
    }, 0);

    res.json({
      bills: pendingBills,
      totalPending: total,
      count: pendingBills.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOverduePayments = async (req, res) => {
  try {
    const { rows: overdueBills } = await query(`
      SELECT b.id, b.bill_type AS "billType", b.items, b.payments, b.total_amount AS "totalAmount",
             b.paid_amount AS "paidAmount", b.payment_status AS "paymentStatus", b.payment_method AS "paymentMethod",
             b.bill_date AS "billDate", b.due_date AS "dueDate", b.created_at AS "createdAt", b.updated_at AS "updatedAt",
             json_build_object('id', p.id, 'name', p.name, 'contactNumber', p.contact_number) AS patient
      FROM bills b
      JOIN patients p ON b.patient_id = p.id
      WHERE b.payment_status IN ('Pending', 'Partial') AND b.due_date < CURRENT_DATE
      ORDER BY b.due_date ASC
    `);

    const total = overdueBills.reduce((sum, bill) => {
      return sum + (parseFloat(bill.totalAmount || 0) - parseFloat(bill.paidAmount || 0));
    }, 0);

    res.json({
      bills: overdueBills,
      totalOverdue: total,
      count: overdueBills.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};