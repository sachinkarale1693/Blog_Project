import express from 'express';
import { Router } from 'express';
import sql from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });


router.post('/signup', upload.single('image'), async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const imagePath = req.file ? req.file.path : '';

  try {

    const pool = await sql;


    await pool.request()
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, hashedPassword)
      .input('image', sql.VarChar, imagePath)
      .execute('sp_RegisterUser'); 
    res.status(201).send('User registered');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error signing up');
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await sql.query`SELECT * FROM Users WHERE email = ${email}`;
    const user = result.recordset[0];
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
    res.json({ token, image: user.image });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging in');
  }
});

export default router;
