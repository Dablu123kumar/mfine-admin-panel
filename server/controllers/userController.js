import User from '../models/User.js';
import { getAll, getOne, updateOne, deleteOne } from './crudFactory.js';

export const userController = {
  getAll: getAll(User),
  getOne: getOne(User),
  update: updateOne(User),
  delete: deleteOne(User),

  create: async (req, res, next) => {
    try {
      const user = await User.create({ ...req.body, createdBy: req.user._id });
      user.password = undefined;
      res.status(201).json({ success: true, data: user });
    } catch (err) { next(err); }
  },

  toggleStatus: async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ success: false, message: 'Cannot deactivate yourself' });
      }
      user.isActive = !user.isActive;
      await user.save({ validateBeforeSave: false });
      res.status(200).json({ success: true, data: user });
    } catch (err) { next(err); }
  },

  updateRole: async (req, res, next) => {
    try {
      const { role } = req.body;
      const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
      res.status(200).json({ success: true, data: user });
    } catch (err) { next(err); }
  },
};
