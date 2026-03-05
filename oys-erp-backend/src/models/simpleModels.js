const { createCrudModel, sql } = require('./genericModel');

const supplierCategoryModel = createCrudModel('SupplierCategories', [
  { name: 'kategori_kodu', sqlType: sql.NVarChar, searchable: true },
  { name: 'kategori_adi', sqlType: sql.NVarChar, searchable: true },
  { name: 'aciklama', sqlType: sql.NVarChar },
  { name: 'durum', sqlType: sql.NVarChar },
]);

const warehouseModel = createCrudModel('Warehouses', [
  { name: 'depo_adi', sqlType: sql.NVarChar, searchable: true },
  { name: 'depo_kodu', sqlType: sql.Int },
  { name: 'depo_tipi', sqlType: sql.NVarChar },
  { name: 'dis_depo_adres', sqlType: sql.NVarChar },
  { name: 'dis_depo_vkn', sqlType: sql.NVarChar },
  { name: 'dis_depo_vergi_dairesi', sqlType: sql.NVarChar },
  { name: 'durum', sqlType: sql.NVarChar },
]);

const lookupModel = createCrudModel('LookupItems', [
  { name: 'lookup_type', sqlType: sql.NVarChar },
  { name: 'kod', sqlType: sql.NVarChar, searchable: true },
  { name: 'ad', sqlType: sql.NVarChar, searchable: true },
  { name: 'sira', sqlType: sql.Int },
  { name: 'carpan', sqlType: sql.Int },
  { name: 'durum', sqlType: sql.NVarChar },
]);

const transactionTypeModel = createCrudModel('TransactionTypes', [
  { name: 'islem_adi', sqlType: sql.NVarChar, searchable: true },
  { name: 'hareket_yonu', sqlType: sql.NVarChar },
  { name: 'aciklama', sqlType: sql.NVarChar },
  { name: 'durum', sqlType: sql.NVarChar },
]);

const colorModel = createCrudModel('Colors', [
  { name: 'renk_adi', sqlType: sql.NVarChar, searchable: true },
  { name: 'durum', sqlType: sql.NVarChar },
]);

const thicknessModel = createCrudModel('Thicknesses', [
  { name: 'birim', sqlType: sql.NVarChar },
  { name: 'deger', sqlType: sql.NVarChar, searchable: true },
  { name: 'ozellik', sqlType: sql.NVarChar },
  { name: 'durum', sqlType: sql.NVarChar },
]);

const yarnCategoryModel = createCrudModel('YarnCategories', [
  { name: 'kategori_adi', sqlType: sql.NVarChar, searchable: true },
  { name: 'durum', sqlType: sql.NVarChar },
]);

const yarnTypeModel = createCrudModel('YarnTypes', [
  { name: 'kategori_id', sqlType: sql.Int },
  { name: 'cins_adi', sqlType: sql.NVarChar, searchable: true },
  { name: 'durum', sqlType: sql.NVarChar },
]);

const yarnDetailModel = createCrudModel('YarnDetails', [
  { name: 'cins_id', sqlType: sql.Int },
  { name: 'detay_adi', sqlType: sql.NVarChar, searchable: true },
  { name: 'durum', sqlType: sql.NVarChar },
]);

const userModel = createCrudModel('Users', [
  { name: 'username', sqlType: sql.NVarChar, searchable: true },
  { name: 'password_hash', sqlType: sql.NVarChar },
  { name: 'full_name', sqlType: sql.NVarChar, searchable: true },
  { name: 'email', sqlType: sql.NVarChar },
  { name: 'is_admin', sqlType: sql.Bit },
  { name: 'modules', sqlType: sql.NVarChar },
  { name: 'is_active', sqlType: sql.Bit },
]);

module.exports = {
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
};
