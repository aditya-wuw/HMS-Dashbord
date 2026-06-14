import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import patientRoutes from './routes/patientRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import authRoutes from './routes/authRoutes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/staff/attendance', attendanceRoutes);

app.get('/', (req, res) => {
  res.send('Hospital Management System API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 