// ─── Generic CRUD Factory ─────────────────────────────────────────────────────
export const createOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.create({ ...req.body, createdBy: req.user?._id });
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

export const getAll = (Model, populateOptions = '') => async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, sort = '-createdAt', status, ...filters } = req.query;
    const query = { ...filters };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Model.countDocuments(query);

    let q = Model.find(query).sort(sort).skip(skip).limit(Number(limit));
    if (populateOptions) q = q.populate(populateOptions);

    const data = await q;

    res.status(200).json({
      success: true,
      count: data.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data,
    });
  } catch (err) { next(err); }
};

export const getOne = (Model, populateOptions = '') => async (req, res, next) => {
  try {
    let q = Model.findById(req.params.id);
    if (populateOptions) q = q.populate(populateOptions);
    const doc = await q;
    if (!doc) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

export const updateOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

export const deleteOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.status(200).json({ success: true, message: 'Deleted successfully', data: {} });
  } catch (err) { next(err); }
};
