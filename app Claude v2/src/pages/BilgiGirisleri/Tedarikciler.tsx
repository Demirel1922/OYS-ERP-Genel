// ============================================
// TEDARİKÇİLER SAYFASI - CRUD
// ============================================
// Çoklu kategori seçimi özelliği içerir
// ============================================
import { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Plus, Edit, Trash2, Search, Truck, ArrowLeft, Building2, Globe, Tag } from 'lucide-react';
import { useTedarikciStore } from '@/store/tedarikciStore';
import { useTedarikciKategoriStore } from '@/store/tedarikciKategoriStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Tedarikci, TedarikciFormData } from '@/types';

// Ülke listesi
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

export default function Tedarikciler() {
  const navigate = useNavigate();
  const { tedarikciler, addTedarikci, updateTedarikci, deleteTedarikci, seedData } = useTedarikciStore();
  const { kategoriler, seedData: seedKategoriler } = useTedarikciKategoriStore();
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTedarikci, setEditingTedarikci] = useState<Tedarikci | null>(null);
  const [deletingTedarikci, setDeletingTedarikci] = useState<Tedarikci | null>(null);
  
  // Arama state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<TedarikciFormData>({
    tedarikciKodu: '',
    tedarikciAdi: '',
    tedarikciUnvan: '',
    bolge: 'IC_PIYASA',
    ulke: 'Türkiye',
    adres: '',
    vkn: '',
    vergiDairesi: '',
    kategoriIds: [],
  });

  // İlk yüklemede örnek verileri ekle
  useEffect(() => {
    if (tedarikciler.length === 0) {
      seedData();
    }
    if (kategoriler.length === 0) {
      seedKategoriler();
    }
  }, [tedarikciler.length, kategoriler.length, seedData, seedKategoriler]);

  const resetForm = () => {
    setFormData({
      tedarikciKodu: '',
      tedarikciAdi: '',
      tedarikciUnvan: '',
      bolge: 'IC_PIYASA',
      ulke: 'Türkiye',
      adres: '',
      vkn: '',
      vergiDairesi: '',
      kategoriIds: [],
    });
    setEditingTedarikci(null);
  };

  const handleOpenDialog = (tedarikci?: Tedarikci) => {
    if (tedarikci) {
      setEditingTedarikci(tedarikci);
      setFormData({
        tedarikciKodu: tedarikci.tedarikciKodu,
        tedarikciAdi: tedarikci.tedarikciAdi,
        tedarikciUnvan: tedarikci.tedarikciUnvan || '',
        bolge: tedarikci.bolge,
        ulke: tedarikci.ulke || 'Türkiye',
        adres: tedarikci.adres,
        vkn: tedarikci.vkn,
        vergiDairesi: tedarikci.vergiDairesi,
        kategoriIds: tedarikci.kategoriIds,
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

  const handleKategoriToggle = (kategoriId: string) => {
    setFormData(prev => ({
      ...prev,
      kategoriIds: prev.kategoriIds.includes(kategoriId)
        ? prev.kategoriIds.filter(id => id !== kategoriId)
        : [...prev.kategoriIds, kategoriId]
    }));
  };

  const handleSubmit = () => {
    // Validasyon
    if (!formData.tedarikciKodu.trim()) {
      toast.error('Tedarikçi Kodu zorunludur');
      return;
    }
    if (!formData.tedarikciAdi.trim()) {
      toast.error('Tedarikçi Adı zorunludur');
      return;
    }
    if (formData.kategoriIds.length === 0) {
      toast.error('En az bir kategori seçilmelidir');
      return;
    }

    let result;
    if (editingTedarikci) {
      result = updateTedarikci(editingTedarikci.id, formData);
      if (result.success) {
        toast.success('Tedarikçi güncellendi');
        handleCloseDialog();
      } else {
        toast.error(result.error || 'Güncelleme başarısız');
      }
    } else {
      result = addTedarikci(formData);
      if (result.success) {
        toast.success('Tedarikçi eklendi');
        handleCloseDialog();
      } else {
        toast.error(result.error || 'Ekleme başarısız');
      }
    }
  };

  const handleDeleteClick = (tedarikci: Tedarikci) => {
    setDeletingTedarikci(tedarikci);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingTedarikci) {
      const result = deleteTedarikci(deletingTedarikci.id);
      if (result.success) {
        toast.success('Tedarikçi silindi');
      } else {
        toast.error(result.error || 'Silme başarısız');
      }
      setDeletingTedarikci(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Filtrelenmiş tedarikçiler
  const filteredTedarikciler = tedarikciler.filter(t => 
    t.tedarikciAdi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tedarikciKodu.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.tedarikciUnvan && t.tedarikciUnvan.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.ulke && t.ulke.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getBolgeBadge = (bolge: 'ITHALAT' | 'IC_PIYASA') => {
    if (bolge === 'ITHALAT') {
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">İthalat</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">İç Piyasa</Badge>;
  };

  const getKategoriBadges = (kategoriIds: string[]) => {
    return kategoriIds.slice(0, 2).map(id => {
      const kategori = kategoriler.find(k => k.id === id);
      return kategori ? (
        <Badge key={id} variant="secondary" className="text-xs">
          {kategori.kategoriAdi}
        </Badge>
      ) : null;
    });
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
              <Truck className="w-8 h-8 text-purple-600" />
              Tedarikçiler
            </h1>
            <p className="text-gray-600 mt-2">
              Tedarikçi kartlarını yönetin. Satınalma modülünde kullanılacak tedarikçi tanımları.
            </p>
          </div>
        </div>

        {/* Tedarikçi Listesi */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Tedarikçi Listesi
              <Badge variant="secondary" className="ml-2">
                {filteredTedarikciler.length}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Ara (Kod, Ad, Ünvan, Ülke)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Yeni Tedarikçi
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kod</TableHead>
                    <TableHead>Ad / Ünvan</TableHead>
                    <TableHead>Bölge</TableHead>
                    <TableHead>Ülke</TableHead>
                    <TableHead>Kategoriler</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTedarikciler.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz tedarikçi eklenmemiş.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTedarikciler.map((tedarikci) => (
                      <TableRow key={tedarikci.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <Badge variant="outline" className="font-mono">
                            {tedarikci.tedarikciKodu}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{tedarikci.tedarikciAdi}</div>
                          {tedarikci.tedarikciUnvan && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {tedarikci.tedarikciUnvan}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getBolgeBadge(tedarikci.bolge)}</TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-gray-400" />
                          {tedarikci.ulke || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {getKategoriBadges(tedarikci.kategoriIds)}
                            {tedarikci.kategoriIds.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{tedarikci.kategoriIds.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(tedarikci)}
                              title="Düzenle"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(tedarikci)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
                {editingTedarikci ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingTedarikci ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi Ekle'}
              </DialogTitle>
              <DialogDescription>
                Tedarikçi bilgilerini doldurun. Tedarikçi Kodu benzersiz olmalıdır.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Temel Bilgiler */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Temel Bilgiler</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tedarikciKodu">Tedarikçi Kodu *</Label>
                    <Input
                      id="tedarikciKodu"
                      value={formData.tedarikciKodu}
                      onChange={(e) => setFormData({ ...formData, tedarikciKodu: e.target.value })}
                      placeholder="örn: T001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tedarikciAdi">Tedarikçi Adı *</Label>
                    <Input
                      id="tedarikciAdi"
                      value={formData.tedarikciAdi}
                      onChange={(e) => setFormData({ ...formData, tedarikciAdi: e.target.value })}
                      placeholder="örn: Bursa İplik San. A.Ş."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tedarikciUnvan">Tedarikçi Ünvan (Opsiyonel)</Label>
                  <Input
                    id="tedarikciUnvan"
                    value={formData.tedarikciUnvan}
                    onChange={(e) => setFormData({ ...formData, tedarikciUnvan: e.target.value })}
                    placeholder="Tam ünvan..."
                  />
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
                      onValueChange={(value: 'ITHALAT' | 'IC_PIYASA') => setFormData({ ...formData, bolge: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ITHALAT">İthalat</SelectItem>
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

              {/* Adres ve Vergi */}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vkn">Vergi Kimlik No (VKN)</Label>
                      <Input
                        id="vkn"
                        value={formData.vkn}
                        onChange={(e) => setFormData({ ...formData, vkn: e.target.value })}
                        placeholder="VKN..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vergiDairesi">Vergi Dairesi</Label>
                      <Input
                        id="vergiDairesi"
                        value={formData.vergiDairesi}
                        onChange={(e) => setFormData({ ...formData, vergiDairesi: e.target.value })}
                        placeholder="Vergi dairesi..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Kategoriler - Çoklu Seçim */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Kategoriler *
                </h3>
                <div className="border rounded-lg p-4">
                  {kategoriler.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      Önce tedarikçi kategorisi eklemelisiniz.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {kategoriler.map((kategori) => (
                        <div key={kategori.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`kategori-${kategori.id}`}
                            checked={formData.kategoriIds.includes(kategori.id)}
                            onCheckedChange={() => handleKategoriToggle(kategori.id)}
                          />
                          <div className="grid gap-1 leading-none">
                            <Label
                              htmlFor={`kategori-${kategori.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {kategori.kategoriAdi}
                            </Label>
                            {kategori.kategoriKodu && (
                              <span className="text-xs text-gray-500">
                                {kategori.kategoriKodu}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {formData.kategoriIds.length > 0 && (
                  <p className="text-sm text-green-600">
                    {formData.kategoriIds.length} kategori seçildi
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                İptal
              </Button>
              <Button onClick={handleSubmit}>
                {editingTedarikci ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Silme Onay Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tedarikçi Silme</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-semibold text-gray-900">{deletingTedarikci?.tedarikciAdi}</span> tedarikçisini silmek istediğinize emin misiniz?
                <br /><br />
                <span className="text-red-600 text-sm">
                  Bu işlem geri alınamaz. Eğer bu tedarikçi satınalma işlemlerinde kullanılıyorsa silme işlemi engellenecektir.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingTedarikci(null)}>
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
