import express from 'express';
import { Router } from 'express';
import sql from '../db.js';
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


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}


router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  const { title, description } = req.body;
  const imagePath = req.file ? req.file.path : '';

  try {
    const pool = await sql;
    await pool.request()
      .input('title', sql.VarChar, title)
      .input('description', sql.VarChar, description)
      .input('image', sql.VarChar, imagePath)
      .input('userId', sql.Int, req.user.id)
      .execute('sp_CreateBlog'); 

    res.status(201).send('Blog created');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating blog');
  }
});


router.get('/', async (req, res) => {
  try {
    const pool = await sql;
    const result = await pool.request().query('SELECT * FROM Blogs');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching blogs');
  }
});


router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  const { title, description } = req.body;
  const imagePath = req.file ? req.file.path : '';

  try {
    const pool = await sql;
    await pool.request()
      .input('title', sql.VarChar, title)
      .input('description', sql.VarChar, description)
      .input('image', sql.VarChar, imagePath)
      .input('id', sql.Int, req.params.id)
      .execute('sp_UpdateBlog');  

    res.send('Blog updated');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating blog');
  }
});


router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const pool = await sql;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .execute('sp_DeleteBlog');  
    res.send('Blog deleted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting blog');
  }
});

export default router;
