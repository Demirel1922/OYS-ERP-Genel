const { createCrudModel, sql } = require('./genericModel');

const customerModel = createCrudModel('Customers', [
  { name: 'ormeci_musteri_no', sqlType: sql.NVarChar, searchable: true },
  { name: 'musteri_kisa_kod', sqlType: sql.NVarChar, searchable: true },
  { name: 'musteri_unvan', sqlType: sql.NVarChar, searchable: true },
  { name: 'bolge', sqlType: sql.NVarChar },
  { name: 'ulke', sqlType: sql.NVarChar, searchable: true },
  { name: 'adres', sqlType: sql.NVarChar },
  { name: 'vergi_no', sqlType: sql.NVarChar },
  { name: 'odeme_vadesi_deger', sqlType: sql.Int },
  { name: 'odeme_vadesi_birim', sqlType: sql.NVarChar },
  { name: 'odeme_tipi', sqlType: sql.NVarChar },
  { name: 'durum', sqlType: sql.NVarChar },
]);

module.exports = customerModel;
