import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { SalesOrder, PriceAuditLog } from '@/modules/sales-orders/domain/types';

export class OysDatabase extends Dexie {
  salesOrders!: Table<SalesOrder>;
  priceAuditLogs!: Table<PriceAuditLog>;

  constructor() {
    super('OysDatabase');
    
    this.version(1).stores({
      salesOrders: '++id, order_no, customer_id, status, order_date, requested_termin, shipping_status',
      priceAuditLogs: '++id, order_id, changed_at',
    });

    this.version(2).stores({
      salesOrders: '++id, order_no, customer_id, status, order_date, requested_termin, shipped_at',
      priceAuditLogs: '++id, order_id, changed_at',
    }).upgrade((tx) => {
      return tx.table('salesOrders').toCollection().modify((order: any) => {
        // Eski shipped_at yoksa ve shipped ise updated_at'i kullan
        if (order.status === 'shipped' && !order.shipped_at) {
          order.shipped_at = order.updated_at;
        }
        // delivered -> shipped olarak güncelle
        if (order.status === 'delivered') {
          order.status = 'shipped';
          if (!order.shipped_at) {
            order.shipped_at = order.updated_at;
          }
        }
        // shipping_status alanını sil
        delete order.shipping_status;
      });
    });
  }
}

export const db = new OysDatabase();

export async function addOrder(order: Omit<SalesOrder, 'id'>): Promise<string> {
  try {
    const id = await db.salesOrders.add(order as SalesOrder);
    return id;
  } catch (error) {
    console.error('Dexie addOrder error:', error);
    throw new Error('Sipariş veritabanına kaydedilirken hata oluştu.');
  }
}

export async function updateOrder(id: string, changes: Partial<SalesOrder>): Promise<void> {
  try {
    await db.salesOrders.update(id, {
      ...changes,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dexie updateOrder error:', error);
    throw new Error('Sipariş güncellenirken hata oluştu.');
  }
}

export async function deleteOrder(id: string): Promise<void> {
  try {
    await db.salesOrders.delete(id);
  } catch (error) {
    console.error('Dexie deleteOrder error:', error);
    throw new Error('Sipariş silinirken hata oluştu.');
  }
}

export async function getOrder(id: string): Promise<SalesOrder | undefined> {
  try {
    let order = await db.salesOrders.get(id);
    if (!order) {
      order = await db.salesOrders.where('order_no').equals(id).first();
    }
    if (!order && !isNaN(Number(id))) {
      order = await db.salesOrders.get(Number(id));
    }
    return order;
  } catch (error) {
    console.error('Dexie getOrder error:', error);
    throw new Error('Sipariş getirilirken hata oluştu.');
  }
}

export async function getAllOrders(): Promise<SalesOrder[]> {
  try {
    return await db.salesOrders.toArray();
  } catch (error) {
    console.error('Dexie getAllOrders error:', error);
    throw new Error('Siparişler getirilirken hata oluştu.');
  }
}

export async function getOrdersByStatus(status: string): Promise<SalesOrder[]> {
  try {
    return await db.salesOrders.where('status').equals(status).toArray();
  } catch (error) {
    console.error('Dexie getOrdersByStatus error:', error);
    throw new Error('Siparişler getirilirken hata oluştu.');
  }
}

export async function checkOrderNoExists(orderNo: string): Promise<boolean> {
  try {
    const count = await db.salesOrders.where('order_no').equals(orderNo).count();
    return count > 0;
  } catch (error) {
    console.error('Dexie checkOrderNoExists error:', error);
    throw new Error('Sipariş numarası kontrol edilirken hata oluştu.');
  }
}

export async function addPriceAuditLog(log: Omit<PriceAuditLog, 'id'>): Promise<string> {
  try {
    const id = await db.priceAuditLogs.add(log as PriceAuditLog);
    return id;
  } catch (error) {
    console.error('Dexie addPriceAuditLog error:', error);
    throw new Error('Fiyat değişiklik kaydı oluşturulurken hata oluştu.');
  }
}

export async function getPriceAuditLogsByOrderId(orderId: string): Promise<PriceAuditLog[]> {
  try {
    return await db.priceAuditLogs.where('order_id').equals(orderId).toArray();
  } catch (error) {
    console.error('Dexie getPriceAuditLogsByOrderId error:', error);
    throw new Error('Fiyat değişiklik kayıtları getirilirken hata oluştu.');
  }
}
