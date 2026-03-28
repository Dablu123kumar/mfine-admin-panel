import express from 'express';
import MedicineCatalog from '../models/MedicineCatalog.js';
import { protect, staffOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─── Public / Customer: browse catalog ───────────────────────────────────────
router.get('/public', async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { manufacturer: { $regex: search, $options: 'i' } },
      { genericName: { $regex: search, $options: 'i' } },
    ];
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      MedicineCatalog.find(filter).sort('name').skip(skip).limit(Number(limit)),
      MedicineCatalog.countDocuments(filter),
    ]);
    res.json({ success: true, data: { data, total, totalPages: Math.ceil(total / Number(limit)), page: Number(page) } });
  } catch (err) { next(err); }
});

// ─── Admin only routes ────────────────────────────────────────────────────────
router.use(protect, staffOnly);

// GET all (admin view — includes inactive)
router.get('/', async (req, res, next) => {
  try {
    const { search, category, isActive, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { manufacturer: { $regex: search, $options: 'i' } },
      { genericName: { $regex: search, $options: 'i' } },
    ];
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      MedicineCatalog.find(filter).sort('name').skip(skip).limit(Number(limit)),
      MedicineCatalog.countDocuments(filter),
    ]);
    res.json({ success: true, data: { data, total, totalPages: Math.ceil(total / Number(limit)), page: Number(page) } });
  } catch (err) { next(err); }
});

// GET single
router.get('/:id', async (req, res, next) => {
  try {
    const item = await MedicineCatalog.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
});

// POST create
router.post('/', async (req, res, next) => {
  try {
    const medicine = await MedicineCatalog.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: medicine });
  } catch (err) { next(err); }
});

// PUT update
router.put('/:id', async (req, res, next) => {
  try {
    const medicine = await MedicineCatalog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, data: medicine });
  } catch (err) { next(err); }
});

// DELETE
router.delete('/:id', async (req, res, next) => {
  try {
    await MedicineCatalog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) { next(err); }
});

// PATCH toggle active
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const med = await MedicineCatalog.findById(req.params.id);
    if (!med) return res.status(404).json({ success: false, message: 'Not found' });
    med.isActive = !med.isActive;
    await med.save();
    res.json({ success: true, data: med });
  } catch (err) { next(err); }
});

export default router;
