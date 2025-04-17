import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const poolPromise = new sql.ConnectionPool({
  user: process.env.user,
  password: process.env.pass,
  server: process.env.server,
  database: process.env.DbName,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  }
}).connect();

export default poolPromise;
