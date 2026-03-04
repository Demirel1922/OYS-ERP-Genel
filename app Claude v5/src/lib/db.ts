import Dexie from 'dexie';
import type { SalesOrder, PriceAuditLog } from '@/modules/sales-orders/domain/types';

// Sipariş sayaç tipi
export interface OrderCounter {
  id?: number;
  year: number;
  lastSeq: number;
}

export class OysDatabase extends Dexie {
  salesOrders!: Dexie.Table<SalesOrder>;
  priceAuditLogs!: Dexie.Table<PriceAuditLog>;
  orderCounter!: Dexie.Table<OrderCounter>;

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
        if (order.status === 'shipped' && !order.shipped_at) {
          order.shipped_at = order.updated_at;
        }
        if (order.status === 'delivered') {
          order.status = 'shipped';
          if (!order.shipped_at) {
            order.shipped_at = order.updated_at;
          }
        }
        delete order.shipping_status;
      });
    });

    // v3: orderCounter tablosu eklendi
    this.version(3).stores({
      salesOrders: '++id, order_no, customer_id, status, order_date, requested_termin, shipped_at',
      priceAuditLogs: '++id, order_id, changed_at',
      orderCounter: '++id, year',
    });
  }
}

export const db = new OysDatabase();

/**
 * Sipariş numarası üretici
 * Format: YYMMMNNNNN → 26 039 0001
 * YY = Yılın son 2 hanesi
 * MMM = Müşteri no (ormeciMusteriNo), 3 hane
 * NNNN = Global sıra numarası, 4 hane (yıl değişince sıfırlanır)
 */
export async function generateOrderNo(musteriNo: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yy = String(currentYear).slice(-2); // "26"
  
  // Müşteri no'yu 3 haneye formatla
  const numericPart = musteriNo.replace(/\D/g, ''); // sadece rakamları al
  const mmm = numericPart.padStart(3, '0').slice(-3); // son 3 hane
  
  // Sayacı al veya oluştur
  let counter = await db.orderCounter.where('year').equals(currentYear).first();
  
  if (!counter) {
    // Bu yıl için ilk sipariş
    const id = await db.orderCounter.add({ year: currentYear, lastSeq: 1 });
    return `${yy}${mmm}0001`;
  }
  
  // Sıra numarasını artır
  const newSeq = counter.lastSeq + 1;
  await db.orderCounter.update(counter.id!, { lastSeq: newSeq });
  
  const nnnn = String(newSeq).padStart(4, '0');
  return `${yy}${mmm}${nnnn}`;
}

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
