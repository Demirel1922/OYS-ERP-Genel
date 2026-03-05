require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getPool, closePool } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Route'lar
const orderRoutes = require('./routes/orders');
const createCrudRoutes = require('./routes/genericRoutes');

// Modeller
const customerModel = require('./models/customerModel');
const supplierModel = require('./models/supplierModel');
const {
  supplierCategoryModel,
  warehouseModel,
  lookupModel,
  transactionTypeModel,
  colorModel,
  thicknessModel,
  yarnCategoryModel,
  yarnTypeModel,
  yarnDetailModel,
  userModel,
} = require('./models/simpleModels');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// API Route'lari
app.use('/api/orders', orderRoutes);
app.use('/api/customers', createCrudRoutes(customerModel));
app.use('/api/suppliers', createCrudRoutes(supplierModel));
app.use('/api/supplier-categories', createCrudRoutes(supplierCategoryModel));
app.use('/api/warehouses', createCrudRoutes(warehouseModel));
app.use('/api/lookups', createCrudRoutes(lookupModel));
app.use('/api/transaction-types', createCrudRoutes(transactionTypeModel));
app.use('/api/colors', createCrudRoutes(colorModel));
app.use('/api/thicknesses', createCrudRoutes(thicknessModel));
app.use('/api/yarn-categories', createCrudRoutes(yarnCategoryModel));
app.use('/api/yarn-types', createCrudRoutes(yarnTypeModel));
app.use('/api/yarn-details', createCrudRoutes(yarnDetailModel));
app.use('/api/users', createCrudRoutes(userModel));

// Auth endpoint
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('username', require('mssql').NVarChar, username)
      .input('password', require('mssql').NVarChar, password)
      .query('SELECT * FROM Users WHERE username = @username AND password_hash = @password AND is_active = 1');
    
    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, error: 'Kullanici adi veya sifre hatali' });
    }
    
    const user = result.recordset[0];
    res.json({
      success: true,
      data: {
        id: String(user.id),
        username: user.username,
        fullName: user.full_name,
        email: user.email || '',
        isAdmin: user.is_admin,
        modules: JSON.parse(user.modules || '[]'),
      }
    });
  } catch (err) { next(err); }
});

// Saglik kontrolu
app.get('/api/health', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query('SELECT 1 AS ok');
    res.json({ success: true, status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ success: false, status: 'error', database: 'disconnected', error: err.message });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route bulunamadi: ' + req.method + ' ' + req.url });
});

// Error handler
app.use(errorHandler);

// Sunucuyu baslat
async function start() {
  try {
    console.log('SQL Server baglantisi test ediliyor...');
    await getPool();
    
    app.listen(PORT, () => {
      console.log('');
      console.log('=== OYS ERP Backend Calisiyor ===');
      console.log('    http://localhost:' + PORT);
      console.log('');
      console.log('API Endpoint\'ler:');
      console.log('  /api/health');
      console.log('  /api/auth/login');
      console.log('  /api/orders');
      console.log('  /api/customers');
      console.log('  /api/suppliers');
      console.log('  /api/supplier-categories');
      console.log('  /api/warehouses');
      console.log('  /api/lookups');
      console.log('  /api/transaction-types');
      console.log('  /api/colors');
      console.log('  /api/thicknesses');
      console.log('  /api/yarn-categories');
      console.log('  /api/yarn-types');
      console.log('  /api/yarn-details');
      console.log('  /api/users');
      console.log('');
    });
  } catch (err) {
    console.error('Sunucu baslatilamadi:', err.message);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('Sunucu kapatiliyor...');
  await closePool();
  process.exit(0);
});

start();
