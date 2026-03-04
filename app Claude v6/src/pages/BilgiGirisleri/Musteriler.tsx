// ============================================
// MÜŞTERİLER SAYFASI - CRUD
// ============================================
// Admin.tsx pattern'i kullanılarak oluşturulmuştur
// ============================================
import { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Search, Users, ArrowLeft, Building2, Globe } from 'lucide-react';
import { useMusteriStore } from '@/store/musteriStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Musteri, MusteriFormData, Bolge, OdemeVadesiBirim } from '@/types';

// Ödeme tipi seçenekleri
const ODEME_TIPLERI = [
  'Açık Hesap',
  'Akreditif',
  'Çek',
  'Nakit',
  'Havale/EFT',
  'Kredi Kartı',
];

// Ülke listesi (sadeleştirilmiş)
const ULKELER = [
  'Türkiye',
  'Almanya',
  'Hollanda',
  'Belçika',
  'Fransa',
  'İngiltere',
  'İtalya',
  'İspanya',
  'Avusturya',
  'İsviçre',
  'ABD',
  'Kanada',
  'Rusya',
  'Çin',
  'Japonya',
  'Diğer',
];

export default function Musteriler() {
  const navigate = useNavigate();
  const { musteriler, addMusteri, updateMusteri, deleteMusteri, pasifYap, aktifYap, seedData } = useMusteriStore();
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingMusteri, setEditingMusteri] = useState<Musteri | null>(null);
  const [deletingMusteri, setDeletingMusteri] = useState<Musteri | null>(null);
  
  // Arama state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<MusteriFormData>({
    ormeciMusteriNo: '',
    musteriKisaKod: '',
    musteriUnvan: '',
    bolge: 'IC_PIYASA',
    ulke: 'Türkiye',
    adres: '',
    vergiNo: '',
    odemeVadesiDeger: 30,
    odemeVadesiBirim: 'GUN',
    odemeTipi: 'Açık Hesap',
  });

  // İlk yüklemede örnek verileri ekle
  useEffect(() => {
    if (musteriler.length === 0) {
      seedData();
    }
  }, [musteriler.length, seedData]);

  const resetForm = () => {
    setFormData({
      ormeciMusteriNo: '',
      musteriKisaKod: '',
      musteriUnvan: '',
      bolge: 'IC_PIYASA',
      ulke: 'Türkiye',
      adres: '',
      vergiNo: '',
      odemeVadesiDeger: 30,
      odemeVadesiBirim: 'GUN',
      odemeTipi: 'Açık Hesap',
    });
    setEditingMusteri(null);
  };

  const handleOpenDialog = (musteri?: Musteri) => {
    if (musteri) {
      setEditingMusteri(musteri);
      setFormData({
        ormeciMusteriNo: musteri.ormeciMusteriNo,
        musteriKisaKod: musteri.musteriKisaKod,
        musteriUnvan: musteri.musteriUnvan,
        bolge: musteri.bolge,
        ulke: musteri.ulke,
        adres: musteri.adres,
        vergiNo: musteri.vergiNo,
        odemeVadesiDeger: musteri.odemeVadesiDeger,
        odemeVadesiBirim: musteri.odemeVadesiBirim,
        odemeTipi: musteri.odemeTipi,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = () => {
    // Validasyon
    if (!formData.ormeciMusteriNo.trim()) {
      toast.error('Örmeci Müşteri No zorunludur');
      return;
    }
    if (!formData.musteriKisaKod.trim()) {
      toast.error('Müşteri Kısa Kod zorunludur');
      return;
    }
    if (!formData.musteriUnvan.trim()) {
      toast.error('Müşteri Ünvan zorunludur');
      return;
    }

    let result;
    if (editingMusteri) {
      result = updateMusteri(editingMusteri.id, formData);
      if (result.success) {
        toast.success('Müşteri güncellendi');
        handleCloseDialog();
      } else {
        toast.error(result.error || 'Güncelleme başarısız');
      }
    } else {
      result = addMusteri(formData);
      if (result.success) {
        toast.success('Müşteri eklendi');
        handleCloseDialog();
      } else {
        toast.error(result.error || 'Ekleme başarısız');
      }
    }
  };

  const handleDeleteClick = (musteri: Musteri) => {
    setDeletingMusteri(musteri);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingMusteri) {
      const result = deleteMusteri(deletingMusteri.id);
      if (result.success) {
        toast.success('Müşteri silindi');
      } else {
        toast.error(result.error || 'Silme başarısız');
      }
      setDeletingMusteri(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Filtrelenmiş müşteriler
  const filteredMusteriler = musteriler.filter(m => 
    m.musteriUnvan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.ormeciMusteriNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.musteriKisaKod.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.ulke.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBolgeBadge = (bolge: Bolge) => {
    if (bolge === 'IHRACAT') {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">İhracat</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">İç Piyasa</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık ve Geri Butonu */}
        <div className="mb-8 flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/module/1')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Müşteriler
            </h1>
            <p className="text-gray-600 mt-2">
              Müşteri kartlarını yönetin. Sipariş modülünde kullanılacak müşteri tanımları.
            </p>
          </div>
        </div>

        {/* Müşteri Listesi */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Müşteri Listesi
              <Badge variant="secondary" className="ml-2">
                {filteredMusteriler.length}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Ara (No, Kod, Ünvan, Ülke)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Yeni Müşteri
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Örmeci No</TableHead>
                    <TableHead>Kısa Kod</TableHead>
                    <TableHead>Ünvan</TableHead>
                    <TableHead>Bölge</TableHead>
                    <TableHead>Ülke</TableHead>
                    <TableHead>Ödeme Tipi</TableHead>
                    <TableHead>Vade</TableHead>
                    <TableHead className="text-center">Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMusteriler.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz müşteri eklenmemiş.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMusteriler.map((musteri) => (
                      <TableRow key={musteri.id} className={`hover:bg-gray-50 ${musteri.durum === 'PASIF' ? 'opacity-60 bg-gray-50' : ''}`}>
                        <TableCell className="font-medium">{musteri.ormeciMusteriNo}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {musteri.musteriKisaKod}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={musteri.musteriUnvan}>
                          {musteri.musteriUnvan}
                        </TableCell>
                        <TableCell>{getBolgeBadge(musteri.bolge)}</TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-gray-400" />
                          {musteri.ulke}
                        </TableCell>
                        <TableCell>{musteri.odemeTipi}</TableCell>
                        <TableCell>
                          {musteri.odemeVadesiDeger} {musteri.odemeVadesiBirim === 'GUN' ? 'gün' : 'ay'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={musteri.durum === 'AKTIF' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 'bg-gray-100 text-gray-600'}>
                            {musteri.durum === 'AKTIF' ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(musteri)} title="Düzenle">
                              <Edit className="w-4 h-4" />
                            </Button>
                            {musteri.durum === 'AKTIF' ? (
                              <Button variant="ghost" size="sm" onClick={() => { const r = pasifYap(musteri.id); if (r.success) toast.success('Pasif yapıldı'); else toast.error(r.error); }} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">Pasif Yap</Button>
                            ) : (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => { const r = aktifYap(musteri.id); if (r.success) toast.success('Aktif yapıldı'); else toast.error(r.error); }} className="text-green-600 hover:text-green-700 hover:bg-green-50">Aktif Yap</Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(musteri)} className="text-red-600 hover:text-red-700 hover:bg-red-50" title="Sil"><Trash2 className="w-4 h-4" /></Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Ekle/Düzenle Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingMusteri ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingMusteri ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
              </DialogTitle>
              <DialogDescription>
                Müşteri bilgilerini doldurun. Örmeci No ve Kısa Kod benzersiz olmalıdır.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Temel Bilgiler */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Temel Bilgiler</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ormeciMusteriNo">Örmeci Müşteri No *</Label>
                    <Input
                      id="ormeciMusteriNo"
                      value={formData.ormeciMusteriNo}
                      onChange={(e) => setFormData({ ...formData, ormeciMusteriNo: e.target.value })}
                      placeholder="örn: 39"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="musteriKisaKod">Müşteri Kısa Kod *</Label>
                    <Input
                      id="musteriKisaKod"
                      value={formData.musteriKisaKod}
                      onChange={(e) => setFormData({ ...formData, musteriKisaKod: e.target.value })}
                      placeholder="örn: ECC"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="musteriUnvan">Müşteri Ünvan *</Label>
                    <Input
                      id="musteriUnvan"
                      value={formData.musteriUnvan}
                      onChange={(e) => setFormData({ ...formData, musteriUnvan: e.target.value })}
                      placeholder="örn: ECC GmbH"
                    />
                  </div>
                </div>
              </div>

              {/* Bölge ve Ülke */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Bölge ve Ülke</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bolge">Bölge</Label>
                    <Select
                      value={formData.bolge}
                      onValueChange={(value: Bolge) => setFormData({ ...formData, bolge: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IHRACAT">İhracat</SelectItem>
                        <SelectItem value="IC_PIYASA">İç Piyasa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ulke">Ülke</Label>
                    <Select
                      value={formData.ulke}
                      onValueChange={(value) => setFormData({ ...formData, ulke: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {ULKELER.map(ulke => (
                          <SelectItem key={ulke} value={ulke}>{ulke}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Adres */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Adres ve Vergi Bilgileri</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adres">Adres</Label>
                    <Input
                      id="adres"
                      value={formData.adres}
                      onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
                      placeholder="Tam adres..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vergiNo">Vergi No</Label>
                    <Input
                      id="vergiNo"
                      value={formData.vergiNo}
                      onChange={(e) => setFormData({ ...formData, vergiNo: e.target.value })}
                      placeholder="Vergi numarası..."
                    />
                  </div>
                </div>
              </div>

              {/* Ödeme Bilgileri */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Ödeme Bilgileri</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="odemeTipi">Ödeme Tipi</Label>
                    <Select
                      value={formData.odemeTipi}
                      onValueChange={(value) => setFormData({ ...formData, odemeTipi: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ODEME_TIPLERI.map(tip => (
                          <SelectItem key={tip} value={tip}>{tip}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="odemeVadesiDeger">Vade Değeri</Label>
                    <Input
                      id="odemeVadesiDeger"
                      type="number"
                      min={0}
                      value={formData.odemeVadesiDeger}
                      onChange={(e) => setFormData({ ...formData, odemeVadesiDeger: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="odemeVadesiBirim">Vade Birimi</Label>
                    <Select
                      value={formData.odemeVadesiBirim}
                      onValueChange={(value: OdemeVadesiBirim) => setFormData({ ...formData, odemeVadesiBirim: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GUN">Gün</SelectItem>
                        <SelectItem value="AY">Ay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                İptal
              </Button>
              <Button onClick={handleSubmit}>
                {editingMusteri ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Silme Onay Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Müşteri Silme</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-semibold text-gray-900">{deletingMusteri?.musteriUnvan}</span> müşterisini silmek istediğinize emin misiniz?
                <br /><br />
                <span className="text-red-600 text-sm">
                  Bu işlem geri alınamaz. Eğer bu müşteri siparişlerde kullanılıyorsa silme işlemi engellenecektir.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingMusteri(null)}>
                İptal
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Evet, Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
