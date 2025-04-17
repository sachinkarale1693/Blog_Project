import express from 'express';
import { Router } from 'express';
import sql from '../db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();


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


router.post('/:blogId', authenticateToken, async (req, res) => {
  const { content, parentId } = req.body;
  
  try {
    const pool = await sql;
    await pool.request()
      .input('blogId', sql.Int, req.params.blogId)
      .input('userId', sql.Int, req.user.id)
      .input('content', sql.VarChar, content)
      .input('parentId', sql.Int, parentId || null)
      .execute('sp_AddComment'); 
    
    res.status(201).send('Comment added');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding comment');
  }
});


router.get('/:blogId', async (req, res) => {
  try {
    const pool = await sql;
    const result = await pool.request()
      .input('blogId', sql.Int, req.params.blogId)
      .query('SELECT * FROM Comments WHERE blogId = @blogId');
    
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching comments');
  }
});

export default router;
