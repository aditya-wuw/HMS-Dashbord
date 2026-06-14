import { query } from './index.js';

const setup = async () => {
  try {
    console.log('Creating users table if it does not exist...');
    await query(`
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('users table created or verified.');
    
    console.log('Creating users update trigger if it does not exist...');
    await query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('users update trigger created or verified.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up users table:', error);
    process.exit(1);
  }
};

setup();
