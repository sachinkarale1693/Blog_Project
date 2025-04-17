import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blog.js';
import commentRoutes from './routes/comment.js';
import dotenv from 'dotenv';

dotenv.config();
import './db.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
