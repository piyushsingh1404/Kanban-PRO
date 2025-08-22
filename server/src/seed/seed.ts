import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { connectDB } from '../config/db';
import User from '../models/User';
import Board from '../models/Board';
import List from '../models/List';
import Card from '../models/Card';

async function run() {
  try {
    await connectDB();  // <<< no args

    await Promise.all([
      User.deleteMany({}),
      Board.deleteMany({}),
      List.deleteMany({}),
      Card.deleteMany({})
    ]);

    const pwHash = await bcrypt.hash('Password@123', 10);

    const [u1, u2] = await User.create([
      { name: 'Demo One', email: 'demo1@mail.com', password: pwHash },
      { name: 'Demo Two', email: 'demo2@mail.com', password: pwHash }
    ]);

    const board = await Board.create({
      ownerId: u1._id,
      title: 'Sprint Board'
    });

    const [todo, doing, done] = await List.create([
      { boardId: board._id, name: 'To Do',       position: 1000, ownerId: u1._id },
      { boardId: board._id, name: 'In Progress', position: 2000, ownerId: u1._id },
      { boardId: board._id, name: 'Done',        position: 3000, ownerId: u1._id }
    ]);

    await Card.create([
      { boardId: board._id, listId: todo._id,  title: 'Setup repo',       position: 1000, ownerId: u1._id },
      { boardId: board._id, listId: todo._id,  title: 'Define schema',    position: 2000, ownerId: u1._id },
      { boardId: board._id, listId: doing._id, title: 'Implement auth',   position: 1000, ownerId: u1._id },
      { boardId: board._id, listId: done._id,  title: 'Project skeleton', position: 1000, ownerId: u1._id }
    ]);

    console.log('Seeded ✅');
    console.log('Users:');
    console.log(' - demo1@mail.com / Password@123');
    console.log(' - demo2@mail.com / Password@123');
  } catch (e) {
    console.error('Seed error:', e);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
