export const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({})
      .populate('staffId', 'name department role')
      .sort({ date: -1 });
    
    const formattedAttendance = attendance.map(record => ({
      _id: record._id,
      staff: {
        _id: record.staffId._id,
        name: record.staffId.name,
        department: record.staffId.department,
        role: record.staffId.role
      },
      date: record.date,
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      status: record.status,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    }));
    
    res.json(formattedAttendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};