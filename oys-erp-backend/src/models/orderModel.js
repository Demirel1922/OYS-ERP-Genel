const { sql, getPool } = require('../config/database');

async function getAllOrders(filters = {}) {
  const pool = await getPool();
  const request = pool.request();
  let query = 'SELECT * FROM SalesOrders WHERE 1=1';

  if (filters.status && filters.status !== 'all') {
    query += ' AND status = @status';
    request.input('status', sql.NVarChar, filters.status);
  }
  if (filters.search) {
    query += ' AND (order_no LIKE @search OR customer_name LIKE @search OR customer_po_no LIKE @search)';
    request.input('search', sql.NVarChar, '%' + filters.search + '%');
  }

  query += ' ORDER BY order_no ASC';
  const result = await request.query(query);
  
  // Her sipariş için kalemleri de getir
  for (const order of result.recordset) {
    const linesResult = await pool.request()
      .input('oid', sql.Int, order.id)
      .query('SELECT * FROM OrderLineItems WHERE order_id = @oid ORDER BY id');
    order.lines = linesResult.recordset;
  }
  
  return result.recordset;
}

async function getOrderById(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM SalesOrders WHERE id = @id');

  if (result.recordset.length === 0) return null;
  const order = result.recordset[0];

  const linesResult = await pool.request()
    .input('oid', sql.Int, id)
    .query('SELECT * FROM OrderLineItems WHERE order_id = @oid ORDER BY id');
  order.lines = linesResult.recordset;
  
  return order;
}

async function createOrder(orderData) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // Sipariş numarası üret
    let orderNo = orderData.order_no;
    if (!orderNo) {
      const noReq = new sql.Request(transaction);
      noReq.input('MusteriNo', sql.NVarChar, orderData.ormeci_musteri_no || '000');
      noReq.output('NewOrderNo', sql.NVarChar(50));
      const noRes = await noReq.execute('sp_GenerateOrderNo');
      orderNo = noRes.output.NewOrderNo;
    }

    // Siparişi ekle
    const insertReq = new sql.Request(transaction);
    const insertResult = await insertReq
      .input('order_no', sql.NVarChar, orderNo)
      .input('customer_id', sql.Int, orderData.customer_id)
      .input('customer_name', sql.NVarChar, orderData.customer_name)
      .input('customer_po_no', sql.NVarChar, orderData.customer_po_no || null)
      .input('order_date', sql.NVarChar, orderData.order_date)
      .input('requested_termin', sql.NVarChar, orderData.requested_termin)
      .input('confirmed_termin', sql.NVarChar, orderData.confirmed_termin)
      .input('payment_terms', sql.NVarChar, orderData.payment_terms)
      .input('incoterm', sql.NVarChar, orderData.incoterm || null)
      .input('currency', sql.NVarChar, orderData.currency || 'TRY')
      .input('unit_price', sql.NVarChar, orderData.unit_price || '0')
      .input('total_pairs', sql.Int, orderData.total_pairs || 0)
      .input('total_amount', sql.NVarChar, orderData.total_amount || '0.00')
      .input('status', sql.NVarChar, orderData.status || 'draft')
      .input('notes', sql.NVarChar, orderData.notes || null)
      .input('internal_notes', sql.NVarChar, orderData.internal_notes || null)
      .input('created_at', sql.NVarChar, orderData.created_at || new Date().toISOString())
      .input('updated_at', sql.NVarChar, orderData.updated_at || new Date().toISOString())
      .query(`
        INSERT INTO SalesOrders 
          (order_no, customer_id, customer_name, customer_po_no, order_date,
           requested_termin, confirmed_termin, payment_terms, incoterm, currency,
           unit_price, total_pairs, total_amount, status, notes, internal_notes,
           created_at, updated_at)
        VALUES 
          (@order_no, @customer_id, @customer_name, @customer_po_no, @order_date,
           @requested_termin, @confirmed_termin, @payment_terms, @incoterm, @currency,
           @unit_price, @total_pairs, @total_amount, @status, @notes, @internal_notes,
           @created_at, @updated_at);
        SELECT SCOPE_IDENTITY() AS id;
      `);

    const orderId = insertResult.recordset[0].id;

    // Kalemleri ekle
    if (orderData.lines && orderData.lines.length > 0) {
      for (const line of orderData.lines) {
        const lineReq = new sql.Request(transaction);
        await lineReq
          .input('order_id', sql.Int, orderId)
          .input('line_id', sql.NVarChar, line.id || line.line_id || '')
          .input('product_name', sql.NVarChar, line.product_name)
          .input('gender', sql.NVarChar, line.gender || null)
          .input('sock_type', sql.NVarChar, line.sock_type || null)
          .input('color', sql.NVarChar, line.color || null)
          .input('size', sql.NVarChar, line.size || null)
          .input('quantity', sql.Int, line.quantity || 0)
          .input('price_unit', sql.NVarChar, line.price_unit || 'BIRIM_CIFT')
          .input('unit_price', sql.NVarChar, line.unit_price || '0')
          .input('currency', sql.NVarChar, line.currency || 'TRY')
          .input('line_total_pairs', sql.Int, line.line_total_pairs || 0)
          .input('line_amount', sql.NVarChar, line.line_amount || '0.00')
          .input('conversion_rate', sql.Decimal(10, 4), line.conversion_rate || null)
          .query(`
            INSERT INTO OrderLineItems 
              (order_id, line_id, product_name, gender, sock_type, color, size,
               quantity, price_unit, unit_price, currency, line_total_pairs, line_amount, conversion_rate)
            VALUES 
              (@order_id, @line_id, @product_name, @gender, @sock_type, @color, @size,
               @quantity, @price_unit, @unit_price, @currency, @line_total_pairs, @line_amount, @conversion_rate)
          `);
      }
    }

    await transaction.commit();
    return { id: orderId, order_no: orderNo };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function updateOrder(id, changes) {
  const pool = await getPool();
  const request = pool.request();
  request.input('id', sql.Int, id);
  const sets = [];

  const fieldMap = {
    customer_id: sql.Int,
    customer_name: sql.NVarChar,
    customer_po_no: sql.NVarChar,
    order_date: sql.NVarChar,
    requested_termin: sql.NVarChar,
    confirmed_termin: sql.NVarChar,
    shipped_at: sql.NVarChar,
    payment_terms: sql.NVarChar,
    incoterm: sql.NVarChar,
    currency: sql.NVarChar,
    unit_price: sql.NVarChar,
    total_pairs: sql.Int,
    total_amount: sql.NVarChar,
    status: sql.NVarChar,
    notes: sql.NVarChar,
    internal_notes: sql.NVarChar,
    updated_at: sql.NVarChar,
  };

  for (const [key, sqlType] of Object.entries(fieldMap)) {
    if (changes[key] !== undefined) {
      sets.push(key + ' = @' + key);
      request.input(key, sqlType, changes[key]);
    }
  }

  if (changes.status === 'shipped' && !changes.shipped_at) {
    sets.push('shipped_at = @shipped_at');
    request.input('shipped_at', sql.NVarChar, new Date().toISOString());
  }

  if (sets.length > 0) {
    if (!changes.updated_at) {
      sets.push("updated_at = '" + new Date().toISOString() + "'");
    }
    await request.query('UPDATE SalesOrders SET ' + sets.join(', ') + ' WHERE id = @id');
  }

  return { success: true };
}

async function deleteOrder(id) {
  const pool = await getPool();
  await pool.request().input('id', sql.Int, id).query('DELETE FROM SalesOrders WHERE id = @id');
  return { success: true };
}

async function checkOrderNoExists(orderNo) {
  const pool = await getPool();
  const result = await pool.request()
    .input('orderNo', sql.NVarChar, orderNo)
    .query('SELECT COUNT(*) AS cnt FROM SalesOrders WHERE order_no = @orderNo');
  return result.recordset[0].cnt > 0;
}

async function getOrderCounter() {
  const pool = await getPool();
  const year = new Date().getFullYear();
  const result = await pool.request()
    .input('year', sql.Int, year)
    .query('SELECT last_seq FROM OrderCounter WHERE year = @year');
  return result.recordset[0]?.last_seq || 0;
}

async function setOrderCounter(newSeq) {
  const pool = await getPool();
  const year = new Date().getFullYear();
  const exists = await pool.request()
    .input('year', sql.Int, year)
    .query('SELECT COUNT(*) AS cnt FROM OrderCounter WHERE year = @year');
  
  if (exists.recordset[0].cnt > 0) {
    await pool.request()
      .input('year', sql.Int, year)
      .input('seq', sql.Int, newSeq)
      .query('UPDATE OrderCounter SET last_seq = @seq WHERE year = @year');
  } else {
    await pool.request()
      .input('year', sql.Int, year)
      .input('seq', sql.Int, newSeq)
      .query('INSERT INTO OrderCounter (year, last_seq) VALUES (@year, @seq)');
  }
  return { success: true };
}

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  checkOrderNoExists,
  getOrderCounter,
  setOrderCounter,
};
