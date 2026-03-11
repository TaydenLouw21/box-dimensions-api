const { Router } = require('express');
const repo = require('./boxRepository');
const { validateBoxInput } = require('./validation');

const router = Router();

// POST /api/boxes — Create a new box
router.post('/', (req, res) => {
  const { valid, errors } = validateBoxInput(req.body, true);
  if (!valid) {
    return res.status(400).json({ errors });
  }

  const box = repo.createBox({
    width: Number(req.body.width),
    height: Number(req.body.height),
    depth: Number(req.body.depth),
    colour: req.body.colour.trim(),
  });

  return res.status(201).json(box);
});

// GET /api/boxes — Retrieve all boxes
router.get('/', (req, res) => {
  return res.status(200).json(repo.getAllBoxes());
});

// GET /api/boxes/:id — Retrieve a single box
router.get('/:id', (req, res) => {
  const box = repo.getBoxById(req.params.id);
  if (!box) {
    return res.status(404).json({ message: 'Box not found' });
  }
  return res.status(200).json(box);
});

// PUT /api/boxes/:id — Update a box
router.put('/:id', (req, res) => {
  const box = repo.getBoxById(req.params.id);
  if (!box) {
    return res.status(404).json({ message: 'Box not found' });
  }

  const { valid, errors } = validateBoxInput(req.body, false);
  if (!valid) {
    return res.status(400).json({ errors });
  }

  const updated = repo.updateBox(req.params.id, {
    ...(req.body.width !== undefined && { width: Number(req.body.width) }),
    ...(req.body.height !== undefined && { height: Number(req.body.height) }),
    ...(req.body.depth !== undefined && { depth: Number(req.body.depth) }),
    ...(req.body.colour !== undefined && { colour: req.body.colour.trim() }),
  });

  return res.status(200).json(updated);
});

// DELETE /api/boxes/:id — Delete a box
router.delete('/:id', (req, res) => {
  const deleted = repo.deleteBox(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'Box not found' });
  }
  return res.status(204).send();
});

module.exports = router;
