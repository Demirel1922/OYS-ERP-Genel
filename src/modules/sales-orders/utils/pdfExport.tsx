import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import type { SalesOrder } from '@/modules/sales-orders/domain/types';

// ----- FONT TANIMLAMA (Türkçe karakterler için Noto Sans) -----
Font.register({
  family: 'NotoSans',
  fonts: [
    { src: '/fonts/NotoSans-Regular.ttf' },
    { src: '/fonts/NotoSans-Bold.ttf', fontWeight: 'bold' },
  ],
});

// ----- FORMAT FONKSİYONLARI -----
const formatDate = (date: any): string => {
  if (!date) return '-';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR');
  } catch {
    return String(date);
  }
};

const formatMoney = (amount: any, currency: string = 'TL'): string => {
  const num = Number(amount) || 0;
  return num.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' ' + currency;
};

const formatQty = (qty: any): string => {
  const num = Number(qty) || 0;
  return num.toLocaleString('tr-TR');
};

// ----- STILLER (NotoSans fontu kullanılır) -----
const s = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'NotoSans' },
  header: { marginBottom: 20, borderBottom: '2px solid #000', paddingBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 10, color: '#666' },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, backgroundColor: '#f0f0f0', padding: 5 },
  row: { flexDirection: 'row', marginBottom: 5 },
  label: { width: '40%', fontWeight: 'bold', fontSize: 9 },
  value: { width: '60%', fontSize: 9 },
  table: { marginTop: 10 },
  tHead: { flexDirection: 'row', backgroundColor: '#f0f0f0', padding: 4, borderBottom: '1px solid #000' },
  tRow: { flexDirection: 'row', padding: 4, borderBottom: '1px solid #ccc' },
  tH: { flex: 1, fontSize: 8, fontWeight: 'bold' },
  tC: { flex: 1, fontSize: 8 },
  tCR: { flex: 1, fontSize: 8, textAlign: 'right' },
  tCC: { flex: 1, fontSize: 8, textAlign: 'center' },
  totals: { marginTop: 15, paddingTop: 10, borderTop: '2px solid #000' },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 3 },
  totalLabel: { fontWeight: 'bold', marginRight: 10 },
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', borderTop: '1px solid #ccc', paddingTop: 10 },
  sig: { width: '45%' },
  sigLine: { borderTop: '1px solid #000', marginTop: 30, paddingTop: 5 },
});

// ----- ETİKETLER (Türkçe karakterler düzeltildi) -----
const STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  confirmed: 'Onaylı',
  shipped: 'Gönderildi',
  cancelled: 'İptal'
};

const GENDER_OPTIONS = [
  { value: 'male', label: 'Erkek' },
  { value: 'female', label: 'Kadın' },
  { value: 'unisex', label: 'Unisex' }
];

const PRICE_UNIT_LABELS: Record<string, string> = {
  pair: 'Çift',
  dozen: 'Düzine',
  piece: 'Adet'
};

const SOCK_TYPE_LABELS: Record<string, string> = {
  socket: 'Soket',
  short: 'Kısa Konç',
  ankle: 'Patik',
  knee: 'Dizaltı',
  thermal: 'Termal',
  slip: 'Slip'
};

// ----- PDF BİLEŞENİ -----
function OrderPDFDocument({ order }: { order: SalesOrder }) {
  const safeOrder = {
    order_no: order?.order_no || 'Bilinmiyor',
    customer_name: order?.customer_name || 'Bilinmiyor',
    order_date: order?.order_date,
    requested_termin: order?.requested_termin,
    confirmed_termin: order?.confirmed_termin,
    shipped_at: order?.shipped_at,
    payment_terms: order?.payment_terms || '',
    currency: order?.currency || 'TL',
    status: order?.status || 'draft',
    lines: Array.isArray(order?.lines) ? order.lines : []
  };

  const getGender = (v: string) => GENDER_OPTIONS.find((g) => g.value === v)?.label || v || '-';
  const getSockType = (v: string) => SOCK_TYPE_LABELS[v] || v || '-';
  const getUnit = (v: string) => PRICE_UNIT_LABELS[v] || v || '-';

  let totalPairs = 0;
  let totalAmount = 0;
  safeOrder.lines.forEach((l: any) => {
    const qty = Number(l?.quantity) || 0;
    const lineAmount = Number(l?.line_amount) || (qty * Number(l?.unit_price || 0));
    totalPairs += qty;
    totalAmount += lineAmount;
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Başlık */}
        <View style={s.header}>
          <Text style={s.title}>Örmeci Çorap / Ormeci Socks</Text>
          <Text style={s.subtitle}>Sipariş Formu / Order Form</Text>
        </View>

        {/* Genel Bilgiler */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Genel Bilgiler / General Information</Text>
          <View style={s.row}><Text style={s.label}>Sipariş No / Order No:</Text><Text style={s.value}>{safeOrder.order_no}</Text></View>
          <View style={s.row}><Text style={s.label}>Müşteri / Customer:</Text><Text style={s.value}>{safeOrder.customer_name}</Text></View>
          <View style={s.row}><Text style={s.label}>Sipariş Tarihi / Order Date:</Text><Text style={s.value}>{formatDate(safeOrder.order_date)}</Text></View>
          <View style={s.row}><Text style={s.label}>Durum / Status:</Text><Text style={s.value}>{STATUS_LABELS[safeOrder.status] || safeOrder.status}</Text></View>
        </View>

        {/* Termin Bilgileri */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Termin Bilgileri / Delivery Information</Text>
          <View style={s.row}><Text style={s.label}>Talep Edilen Termin / Requested:</Text><Text style={s.value}>{formatDate(safeOrder.requested_termin)}</Text></View>
          <View style={s.row}><Text style={s.label}>Onaylı Termin / Confirmed:</Text><Text style={s.value}>{formatDate(safeOrder.confirmed_termin)}</Text></View>
          {safeOrder.shipped_at && <View style={s.row}><Text style={s.label}>Gönderilme Tarihi / Shipped:</Text><Text style={s.value}>{formatDate(safeOrder.shipped_at)}</Text></View>}
          <View style={s.row}><Text style={s.label}>Ödeme Koşulları / Payment:</Text><Text style={s.value}>{safeOrder.payment_terms}</Text></View>
        </View>

        {/* Sipariş Kalemleri */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Sipariş Kalemleri / Order Items</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={s.tH}>Ürün / Product</Text>
              <Text style={s.tH}>Cinsiyet</Text>
              <Text style={s.tH}>Tip / Type</Text>
              <Text style={s.tH}>Renk / Color</Text>
              <Text style={s.tH}>Beden</Text>
              <Text style={s.tH}>Miktar</Text>
              <Text style={s.tH}>Birim</Text>
              <Text style={s.tH}>Birim Fiyat</Text>
              <Text style={s.tH}>Tutar</Text>
            </View>
            {safeOrder.lines.map((l: any, i: number) => (
              <View key={i} style={s.tRow}>
                <Text style={s.tC}>{l?.product_name || '-'}</Text>
                <Text style={s.tC}>{getGender(l?.gender)}</Text>
                <Text style={s.tC}>{getSockType(l?.sock_type)}</Text>
                <Text style={s.tC}>{l?.color || '-'}</Text>
                <Text style={s.tCC}>{l?.size || '-'}</Text>
                <Text style={s.tCR}>{formatQty(l?.quantity)}</Text>
                <Text style={s.tCC}>{getUnit(l?.price_unit)}</Text>
                <Text style={s.tCR}>{formatMoney(l?.unit_price, safeOrder.currency)}</Text>
                <Text style={s.tCR}>{formatMoney(l?.line_amount || (l?.quantity * l?.unit_price), safeOrder.currency)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Toplamlar */}
        <View style={s.totals}>
          <View style={s.totalRow}><Text style={s.totalLabel}>Toplam Çift / Total Pairs:</Text><Text>{formatQty(totalPairs)}</Text></View>
          <View style={s.totalRow}><Text style={s.totalLabel}>Toplam Tutar / Total Amount:</Text><Text>{formatMoney(totalAmount, safeOrder.currency)}</Text></View>
        </View>

        {/* İmza Alanı */}
        <View style={s.footer}>
          <View style={s.sig}>
            <Text>Örmeci Çorap / Ormeci Socks</Text>
            <View style={s.sigLine}><Text>İmza / Signature</Text></View>
          </View>
          <View style={s.sig}>
            <Text>Müşteri Onayı / Customer: {safeOrder.customer_name}</Text>
            <View style={s.sigLine}><Text>İmza / Signature</Text></View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ----- PDF OLUŞTURMA FONKSİYONLARI -----
export async function generateOrderPDF(order: SalesOrder): Promise<Blob | null> {
  try {
    const blob = await pdf(<OrderPDFDocument order={order} />).toBlob();
    return blob;
  } catch (error) {
    console.error('PDF hatası:', error);
    alert('PDF oluşturulamadı: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    return null;
  }
}

export async function downloadOrderPDF(order: SalesOrder): Promise<void> {
  const blob = await generateOrderPDF(order);
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Siparis_${order?.order_no || 'unknown'}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function openOrderPDFInNewTab(order: SalesOrder): Promise<void> {
  const blob = await generateOrderPDF(order);
  if (!blob) { alert('PDF açılamadı'); return; }
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}