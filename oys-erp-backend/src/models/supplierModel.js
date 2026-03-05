const { sql, getPool } = require('../config/database');
const { createCrudModel } = require('./genericModel');

const baseModel = createCrudModel('Suppliers', [
  { name: 'tedarikci_kodu', sqlType: sql.NVarChar, searchable: true },
  { name: 'tedarikci_adi', sqlType: sql.NVarChar, searchable: true },
  { name: 'tedarikci_unvan', sqlType: sql.NVarChar, searchable: true },
  { name: 'bolge', sqlType: sql.NVarChar },
  { name: 'ulke', sqlType: sql.NVarChar, searchable: true },
  { name: 'adres', sqlType: sql.NVarChar },
  { name: 'vkn', sqlType: sql.NVarChar },
  { name: 'vergi_dairesi', sqlType: sql.NVarChar },
  { name: 'durum', sqlType: sql.NVarChar },
]);

// Kategori ilişkilerini de getiren özel getAll
async function getAllWithCategories(filters = {}) {
  const suppliers = await baseModel.getAll(filters);
  const pool = await getPool();
  
  for (const s of suppliers) {
    const catResult = await pool.request()
      .input('sid', sql.Int, s.id)
      .query('SELECT category_id FROM SupplierCategoryMap WHERE supplier_id = @sid');
    s.kategori_ids = catResult.recordset.map(r => r.category_id);
  }
  return suppliers;
}

async function createWithCategories(data) {
  const { kategori_ids, ...supplierData } = data;
  const result = await baseModel.create(supplierData);
  
  if (kategori_ids && kategori_ids.length > 0) {
    const pool = await getPool();
    for (const catId of kategori_ids) {
      await pool.request()
        .input('sid', sql.Int, result.id)
        .input('cid', sql.Int, catId)
        .query('INSERT INTO SupplierCategoryMap (supplier_id, category_id) VALUES (@sid, @cid)');
    }
  }
  return result;
}

async function updateWithCategories(id, data) {
  const { kategori_ids, ...supplierData } = data;
  await baseModel.update(id, supplierData);
  
  if (kategori_ids !== undefined) {
    const pool = await getPool();
    await pool.request().input('sid', sql.Int, id).query('DELETE FROM SupplierCategoryMap WHERE supplier_id = @sid');
    for (const catId of kategori_ids) {
      await pool.request()
        .input('sid', sql.Int, id)
        .input('cid', sql.Int, catId)
        .query('INSERT INTO SupplierCategoryMap (supplier_id, category_id) VALUES (@sid, @cid)');
    }
  }
  return { success: true };
}

module.exports = {
  ...baseModel,
  getAll: getAllWithCategories,
  create: createWithCategories,
  update: updateWithCategories,
};
