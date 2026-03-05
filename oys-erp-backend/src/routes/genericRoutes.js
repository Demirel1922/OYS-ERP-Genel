const express = require('express');

function createCrudRoutes(model) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const data = await model.getAll(req.query);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const data = await model.getById(parseInt(req.params.id));
      if (!data) return res.status(404).json({ success: false, error: 'Kayit bulunamadi' });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  });

  router.post('/', async (req, res, next) => {
    try {
      const result = await model.create(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const result = await model.update(parseInt(req.params.id), req.body);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const result = await model.remove(parseInt(req.params.id));
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  });

  // Aktif/Pasif
  router.patch('/:id/durum', async (req, res, next) => {
    try {
      const result = await model.setDurum(parseInt(req.params.id), req.body.durum);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  });

  return router;
}

module.exports = createCrudRoutes;
