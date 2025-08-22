import { Response } from 'express';
import User from '../models/User';
import { AuthedRequest } from '../middlewares/auth';

export async function me(req: AuthedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.userId).select('_id name email');
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    return res.json({ user });
  } catch (e) {
    console.error('Error in /me:', e);
    return res.status(500).json({ message: 'Server error' });
  }
}
