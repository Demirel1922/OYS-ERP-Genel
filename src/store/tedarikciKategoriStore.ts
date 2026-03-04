// ============================================
// TEDARİKÇİ KATEGORİLERİ STORE - Zustand
// ============================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TedarikciKategorisi, TedarikciKategorisiFormData } from '@/types';

interface TedarikciKategorisiState {
  kategoriler: TedarikciKategorisi[];
  
  // Actions
  addKategori: (data: TedarikciKategorisiFormData) => { success: boolean; error?: string };
  updateKategori: (id: string, data: Partial<TedarikciKategorisiFormData>) => { success: boolean; error?: string };
  deleteKategori: (id: string) => { success: boolean; error?: string };
  getKategoriById: (id: string) => TedarikciKategorisi | undefined;
  getKategoriAdiById: (id: string) => string;
  
  // Seed data - Uygulama ilk açılışında otomatik oluşturulacak
  seedData: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);
const getCurrentTimestamp = () => new Date().toISOString();

// Varsayılan tedarikçi kategorileri (seed data)
const defaultKategoriler: TedarikciKategorisi[] = [
  {
    id: '1',
    kategoriKodu: 'IPLIK',
    kategoriAdi: 'İplik',
    aciklama: 'Tüm iplik tedarikçileri',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    kategoriKodu: 'KOLI',
    kategoriAdi: 'Koli',
    aciklama: 'Ambalaj ve koli tedarikçileri',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    kategoriKodu: 'ETIKET',
    kategoriAdi: 'Etiket',
    aciklama: 'Etiket tedarikçileri',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    kategoriKodu: 'LASTIK',
    kategoriAdi: 'Lastik',
    aciklama: 'Lastik ve elastik bant tedarikçileri',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    kategoriKodu: 'KIMYA',
    kategoriAdi: 'Kimya',
    aciklama: 'Kimyasal madde ve boya tedarikçileri',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '6',
    kategoriKodu: 'AKSESUAR',
    kategoriAdi: 'Aksesuar',
    aciklama: 'Çorap aksesuarları tedarikçileri',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '7',
    kategoriKodu: 'DIS_HIZMET',
    kategoriAdi: 'Dış Hizmet',
    aciklama: 'Dış hizmet sağlayıcıları',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '8',
    kategoriKodu: 'AMBALAJ',
    kategoriAdi: 'Ambalaj',
    aciklama: 'Ambalaj malzemesi tedarikçileri',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const useTedarikciKategoriStore = create<TedarikciKategorisiState>()(
  persist(
    (set, get) => ({
      kategoriler: [],

      addKategori: (data) => {
        const { kategoriler } = get();
        
        // Kategori adı unique kontrolü
        if (kategoriler.some(k => k.kategoriAdi === data.kategoriAdi)) {
          return { 
            success: false, 
            error: `Kategori Adı "${data.kategoriAdi}" zaten kullanılıyor.` 
          };
        }

        // Kategori kodu varsa unique kontrolü
        if (data.kategoriKodu && kategoriler.some(k => k.kategoriKodu === data.kategoriKodu)) {
          return { 
            success: false, 
            error: `Kategori Kodu "${data.kategoriKodu}" zaten kullanılıyor.` 
          };
        }

        const yeniKategori: TedarikciKategorisi = {
          id: generateId(),
          ...data,
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
        };

        set(state => ({
          kategoriler: [...state.kategoriler, yeniKategori]
        }));

        return { success: true };
      },

      updateKategori: (id, data) => {
        const { kategoriler } = get();
        const kategori = kategoriler.find(k => k.id === id);
        
        if (!kategori) {
          return { success: false, error: 'Kategori bulunamadı.' };
        }

        // Kategori adı unique kontrolü (kendisi hariç)
        if (data.kategoriAdi !== undefined) {
          const exists = kategoriler.some(
            k => k.kategoriAdi === data.kategoriAdi && k.id !== id
          );
          if (exists) {
            return { 
              success: false, 
              error: `Kategori Adı "${data.kategoriAdi}" başka kategoride kullanılıyor.` 
            };
          }
        }

        // Kategori kodu unique kontrolü (kendisi hariç)
        if (data.kategoriKodu !== undefined) {
          const exists = kategoriler.some(
            k => k.kategoriKodu === data.kategoriKodu && k.id !== id
          );
          if (exists) {
            return { 
              success: false, 
              error: `Kategori Kodu "${data.kategoriKodu}" başka kategoride kullanılıyor.` 
            };
          }
        }

        set(state => ({
          kategoriler: state.kategoriler.map(k =>
            k.id === id
              ? { ...k, ...data, updatedAt: getCurrentTimestamp() }
              : k
          )
        }));

        return { success: true };
      },

      deleteKategori: (id) => {
        const { kategoriler } = get();
        const kategori = kategoriler.find(k => k.id === id);
        
        if (!kategori) {
          return { success: false, error: 'Kategori bulunamadı.' };
        }

        // TODO: Backend entegrasyonunda tedarikçi kontrolü yapılacak
        // Eğer bu kategoride tedarikçi varsa silme engellenecek
        const kullanilanKategoriIds = ['1', '2']; // Örnek: İplik ve Koli kullanılıyor
        if (kullanilanKategoriIds.includes(id)) {
          return {
            success: false,
            error: `Bu kategori tedarikçilerde kullanıldığı için silinemez.`
          };
        }

        set(state => ({
          kategoriler: state.kategoriler.filter(k => k.id !== id)
        }));

        return { success: true };
      },

      getKategoriById: (id) => {
        return get().kategoriler.find(k => k.id === id);
      },

      getKategoriAdiById: (id) => {
        const kategori = get().kategoriler.find(k => k.id === id);
        return kategori?.kategoriAdi || 'Bilinmiyor';
      },

      seedData: () => {
        set({ kategoriler: defaultKategoriler });
      },
    }),
    {
      name: 'oys-tedarikci-kategori-store',
    }
  )
);
