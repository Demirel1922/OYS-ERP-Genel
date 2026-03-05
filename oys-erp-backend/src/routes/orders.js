const express = require('express');
const router = express.Router();
const orderModel = require('../models/orderModel');

// Sipariş sayacı
router.get('/counter', async (req, res, next) => {
  try {
    const seq = await orderModel.getOrderCounter();
    res.json({ success: true, data: { seq } });
  } catch (err) { next(err); }
});

router.put('/counter', async (req, res, next) => {
  try {
    await orderModel.setOrderCounter(req.body.seq);
    res.json({ success: true, data: { seq: req.body.seq } });
  } catch (err) { next(err); }
});

// Tüm siparişler
router.get('/', async (req, res, next) => {
  try {
    const data = await orderModel.getAllOrders(req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// Tek sipariş
router.get('/:id', async (req, res, next) => {
  try {
    const data = await orderModel.getOrderById(parseInt(req.params.id));
    if (!data) return res.status(404).json({ success: false, error: 'Siparis bulunamadi' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// Yeni sipariş
router.post('/', async (req, res, next) => {
  try {
    const result = await orderModel.createOrder(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
});

// Güncelle
router.put('/:id', async (req, res, next) => {
  try {
    const result = await orderModel.updateOrder(parseInt(req.params.id), req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// Durum değiştir
router.patch('/:id/status', async (req, res, next) => {
  try {
    const result = await orderModel.updateOrder(parseInt(req.params.id), {
      status: req.body.status,
      updated_at: new Date().toISOString(),
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// Sil
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await orderModel.deleteOrder(parseInt(req.params.id));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

module.exports = router;
