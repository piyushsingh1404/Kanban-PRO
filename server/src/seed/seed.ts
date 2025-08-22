import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Board from '../models/Board.js';
import List from '../models/List.js';
import Card from '../models/Card.js';
import { connectDB } from '../config/db.js';

async function run() {
  await connectDB(process.env.MONGODB_URI as string);
  await Promise.all([User.deleteMany({}), Board.deleteMany({}), List.deleteMany({}), Card.deleteMany({})]);
  const pw = await bcrypt.hash('Password@123', 10);
  const [u1, u2] = await User.create([
    { name: 'Demo One', email: 'demo1@mail.com', password: pw },
    { name: 'Demo Two', email: 'demo2@mail.com', password: pw },
  ]);
  const board = await Board.create({ name: 'Sprint Board', members: [u1._id, u2._id] });
  const [todo, doing, done] = await List.create([
    { boardId: board._id, name: 'To Do', position: 1000 },
    { boardId: board._id, name: 'In Progress', position: 2000 },
    { boardId: board._id, name: 'Done', position: 3000 }
  ]);
  await Card.create([
    { boardId: board._id, listId: todo._id, title: 'Setup repo', position: 1000 },
    { boardId: board._id, listId: todo._id, title: 'Define schema', position: 2000 },
    { boardId: board._id, listId: doing._id, title: 'Implement auth', position: 1000 },
    { boardId: board._id, listId: done._id, title: 'Project skeleton', position: 1000 }
  ]);
  console.log('Seeded. Users: demo1@mail.com / demo2@mail.com (Password@123)');
  await mongoose.disconnect();
}
run().catch((e)=>{ console.error(e); process.exit(1); });
