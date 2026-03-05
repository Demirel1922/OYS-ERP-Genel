const { sql, getPool } = require('../config/database');

function createCrudModel(tableName, columns) {
  return {
    async getAll(filters = {}) {
      const pool = await getPool();
      const request = pool.request();
      let query = 'SELECT * FROM ' + tableName + ' WHERE 1=1';

      if (filters.durum) {
        query += ' AND durum = @durum';
        request.input('durum', sql.NVarChar, filters.durum);
      }
      if (filters.search) {
        query += ' AND (' + columns.filter(c => c.searchable).map(c => c.name + ' LIKE @search').join(' OR ') + ')';
        request.input('search', sql.NVarChar, '%' + filters.search + '%');
      }
      if (filters.lookup_type) {
        query += ' AND lookup_type = @lookup_type';
        request.input('lookup_type', sql.NVarChar, filters.lookup_type);
      }

      query += ' ORDER BY ' + (filters.orderBy || 'id');
      const result = await request.query(query);
      return result.recordset;
    },

    async getById(id) {
      const pool = await getPool();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM ' + tableName + ' WHERE id = @id');
      return result.recordset[0] || null;
    },

    async create(data) {
      const pool = await getPool();
      const request = pool.request();
      const cols = [];
      const vals = [];

      for (const col of columns) {
        if (data[col.name] !== undefined) {
          cols.push(col.name);
          vals.push('@' + col.name);
          request.input(col.name, col.sqlType, data[col.name]);
        }
      }

      const result = await request.query(
        'INSERT INTO ' + tableName + ' (' + cols.join(', ') + ') VALUES (' + vals.join(', ') + '); SELECT SCOPE_IDENTITY() AS id;'
      );
      return { id: result.recordset[0].id };
    },

    async update(id, data) {
      const pool = await getPool();
      const request = pool.request();
      request.input('id', sql.Int, id);
      const sets = [];

      for (const col of columns) {
        if (data[col.name] !== undefined) {
          sets.push(col.name + ' = @' + col.name);
          request.input(col.name, col.sqlType, data[col.name]);
        }
      }

      if (sets.length === 0) return { success: true };
      sets.push('updated_at = GETDATE()');
      await request.query('UPDATE ' + tableName + ' SET ' + sets.join(', ') + ' WHERE id = @id');
      return { success: true };
    },

    async remove(id) {
      const pool = await getPool();
      await pool.request().input('id', sql.Int, id).query('DELETE FROM ' + tableName + ' WHERE id = @id');
      return { success: true };
    },

    async setDurum(id, durum) {
      const pool = await getPool();
      await pool.request()
        .input('id', sql.Int, id)
        .input('durum', sql.NVarChar, durum)
        .query('UPDATE ' + tableName + ' SET durum = @durum, updated_at = GETDATE() WHERE id = @id');
      return { success: true };
    },
  };
}

module.exports = { createCrudModel, sql };
