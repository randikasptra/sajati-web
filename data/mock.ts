// ============================================================
// SAJATI — Mock Data (Data Ilustrasi)
// Seluruh data di file ini bersifat ilustrasi untuk keperluan
// prototype. Tidak ada koneksi ke backend atau sistem nyata.
// ============================================================

export type KategoriSampah =
  | "plastik"
  | "kertas"
  | "logam"
  | "kaca"
  | "organik"
  | "elektronik";

export type StatusSetoran =
  | "menunggu_verifikasi"
  | "terverifikasi"
  | "ditolak"
  | "perlu_persetujuan"
  | "saldo_ditambahkan"
  | "selesai";

export type StatusPenukaran =
  | "menunggu"
  | "disiapkan"
  | "diserahkan"
  | "selesai";

export type JenjangPemilik = "desa" | "kecamatan" | "kabupaten";
export type StatusTransfer = "menunggu" | "dikirim" | "diterima" | "ditolak";
export type StatusListing = "aktif" | "dipesan" | "terjual" | "ditutup";

export interface Penjemputan {
  jadwalId?: string;
  id: string;
  wargaId: string;
  tanggalJemput: string;
  metode: "antar" | "keliling";
  alamat: string;
  catatan?: string;
  kategori: KategoriSampah[];
  status: "diajukan" | "dijadwalkan" | "diterima" | "dijemput" | "selesai" | "dibatalkan";
  createdAt: string;
}

export interface StokMaterial {
  setoranId?: string;
  terkunci?: boolean;
  id: string;
  jenjang: JenjangPemilik;
  pemilikId: string;
  namaPemilik: string;
  kategori: KategoriSampah;
  beratKg: number;
  kualitas: "baik" | "sedang" | "kurang";
  klasifikasi?: "belum_dipilah" | "dikelola" | "tidak_dikelola" | "residu";
  diperbaruiPada: string;
}

export interface TransferMaterial {
  stokAsalId?: string;
  klasifikasi?: StokMaterial["klasifikasi"];
  beratDiterima?: number;
  alasanSelisih?: string;
  alasanTolak?: string;
  id: string;
  asalJenjang: JenjangPemilik;
  asalId: string;
  asalNama: string;
  tujuanJenjang: JenjangPemilik;
  tujuanId: string;
  tujuanNama: string;
  kategori: KategoriSampah;
  beratKg: number;
  kualitas?: "baik" | "sedang" | "kurang";
  status: StatusTransfer;
  dibuatPada: string;
  reserved?: boolean;
  diterimaPada?: string;
  catatan?: string;
}

export interface ListingMaterial {
  pembayaran?: "belum_dibayar" | "lunas";
  dibayarPada?: string;
  id: string;
  pemilikJenjang: JenjangPemilik;
  pemilikId: string;
  pemilikNama: string;
  kategori: KategoriSampah;
  beratKg: number;
  kualitas: "baik" | "sedang" | "kurang";
  hargaPerKg: number;
  status: StatusListing;
  pembeli?: string;
  dibuatPada: string;
}

export interface CatatanPengolahan {
  id: string;
  listingId?: string;
  mitra: string;
  kategori: KategoriSampah;
  inputKg: number;
  produk: string;
  outputKg: number;
  residuKg: number;
  kehilanganKg: number;
  tanggal: string;
}

export interface DanaInsentif {
  id: string;
  jenjang: JenjangPemilik;
  namaPemilik: string;
  saldo: number;
}

export interface TransaksiDana {
  id: string;
  sumberId: string;
  sumberNama: string;
  tujuanId?: string;
  tujuanNama: string;
  jenis: "penyaluran" | "insentif_warga" | "penjualan";
  jumlah: number;
  referensi?: string;
  tanggal: string;
}

export interface Pengaduan {
  id: string;
  wargaId: string;
  subjek: string;
  pesan: string;
  status: "baru" | "diproses" | "selesai";
  dibuatPada: string;
}

export interface Warga {
  id: string;
  nama: string;
  rt: string;
  rw: string;
  desa: string;
  kecamatan: string;
  telepon: string;
  saldo: number;
}

export interface Setoran {
  stokTercatat?: boolean;
  id: string;
  wargaId: string;
  penjemputanId?: string;
  tanggal: string;
  items: SetoranItem[];
  status: StatusSetoran;
  petugasId?: string;
  adminId?: string;
  catatan?: string;
  alasanTolak?: string;
  totalNilai: number;
  createdAt: string;
}

export interface SetoranItem {
  kategori: KategoriSampah;
  berat: number; // kg
  kualitas: "baik" | "sedang" | "kurang";
  nilaiPerKg: number;
  subtotal: number;
}

export interface Petugas {
  id: string;
  nama: string;
  desa: string;
  role: "petugas" | "admin";
}

export interface BarangKopdes {
  id: string;
  nama: string;
  kategori: string;
  stok: number;
  nilaiTukar: number; // dalam poin saldo
  satuan: string;
  gambar?: string;
}

export interface Penukaran {
  id: string;
  wargaId: string;
  tanggal: string;
  items: PenukaranItem[];
  totalNilai: number;
  status: StatusPenukaran;
  catatan?: string;
}

export interface PenukaranItem {
  barangId: string;
  namaBarang: string;
  jumlah: number;
  nilaiTukar: number;
  subtotal: number;
}

// ---------- Harga per kg per kategori (ilustrasi) ----------
export const HARGA_SAMPAH: Record<
  KategoriSampah,
  { label: string; hargaPerKg: number; icon: string }
> = {
  plastik: { label: "Plastik", hargaPerKg: 2500, icon: "♻️" },
  kertas: { label: "Kertas/Kardus", hargaPerKg: 1500, icon: "📄" },
  logam: { label: "Logam/Besi", hargaPerKg: 5000, icon: "🔩" },
  kaca: { label: "Kaca/Botol", hargaPerKg: 1000, icon: "🫙" },
  organik: { label: "Organik", hargaPerKg: 500, icon: "🍂" },
  elektronik: { label: "Elektronik", hargaPerKg: 8000, icon: "🔌" },
};

// ---------- Data warga contoh ----------
export const MOCK_WARGA: Warga[] = [
  {
    id: "w1",
    nama: "Ibu Siti Aminah",
    rt: "03",
    rw: "05",
    desa: "Sukamanah",
    kecamatan: "Singaparna",
    telepon: "0812xxxxxxxx",
    saldo: 35000,
  },
  {
    id: "w2",
    nama: "Bapak Ahmad Hidayat",
    rt: "01",
    rw: "03",
    desa: "Sukamanah",
    kecamatan: "Singaparna",
    telepon: "0857xxxxxxxx",
    saldo: 12500,
  },
  {
    id: "w3",
    nama: "Ibu Rina Puspita",
    rt: "02",
    rw: "05",
    desa: "Sukamanah",
    kecamatan: "Singaparna",
    telepon: "0878xxxxxxxx",
    saldo: 48000,
  },
];

// ---------- Data petugas contoh ----------
export const MOCK_PETUGAS: Petugas[] = [
  { id: "p1", nama: "Pak Dedi Supriatna", desa: "Sukamanah", role: "petugas" },
  { id: "a1", nama: "Ibu Neng Komariah", desa: "Sukamanah", role: "admin" },
];

// ---------- Data setoran contoh ----------
export const MOCK_SETORAN: Setoran[] = [
  {
    id: "s1",
    wargaId: "w1",
    tanggal: "2026-10-27",
    items: [
      {
        kategori: "plastik",
        berat: 3.5,
        kualitas: "baik",
        nilaiPerKg: 2500,
        subtotal: 8750,
      },
      {
        kategori: "kertas",
        berat: 2.0,
        kualitas: "sedang",
        nilaiPerKg: 1500,
        subtotal: 3000,
      },
    ],
    status: "saldo_ditambahkan",
    petugasId: "p1",
    adminId: "a1",
    totalNilai: 11750,
    createdAt: "2026-10-27T08:30:00",
  },
  {
    id: "s2",
    wargaId: "w1",
    tanggal: "2026-10-28",
    items: [
      {
        kategori: "logam",
        berat: 1.2,
        kualitas: "baik",
        nilaiPerKg: 5000,
        subtotal: 6000,
      },
    ],
    status: "terverifikasi",
    petugasId: "p1",
    totalNilai: 6000,
    createdAt: "2026-10-28T09:15:00",
  },
  {
    id: "s3",
    wargaId: "w2",
    tanggal: "2026-10-28",
    items: [
      {
        kategori: "plastik",
        berat: 5.0,
        kualitas: "sedang",
        nilaiPerKg: 2500,
        subtotal: 12500,
      },
      {
        kategori: "kaca",
        berat: 2.0,
        kualitas: "baik",
        nilaiPerKg: 1000,
        subtotal: 2000,
      },
    ],
    status: "terverifikasi",
    petugasId: "p1",
    totalNilai: 14500,
    createdAt: "2026-10-28T10:00:00",
  },
  {
    id: "s4",
    wargaId: "w3",
    tanggal: "2026-10-26",
    items: [
      {
        kategori: "elektronik",
        berat: 0.8,
        kualitas: "baik",
        nilaiPerKg: 8000,
        subtotal: 6400,
      },
      {
        kategori: "plastik",
        berat: 4.0,
        kualitas: "baik",
        nilaiPerKg: 2500,
        subtotal: 10000,
      },
    ],
    status: "saldo_ditambahkan",
    petugasId: "p1",
    adminId: "a1",
    totalNilai: 16400,
    createdAt: "2026-10-26T14:20:00",
  },
];

// ---------- Barang Kopdes (kebutuhan pokok) ----------
export const MOCK_BARANG_KOPDES: BarangKopdes[] = [
  {
    id: "b1",
    nama: "Beras Premium 5kg",
    kategori: "Sembako",
    stok: 25,
    nilaiTukar: 35000,
    satuan: "paket",
  },
  {
    id: "b2",
    nama: "Minyak Goreng 1L",
    kategori: "Sembako",
    stok: 40,
    nilaiTukar: 12000,
    satuan: "botol",
  },
  {
    id: "b3",
    nama: "Gula Pasir 1kg",
    kategori: "Sembako",
    stok: 30,
    nilaiTukar: 10000,
    satuan: "paket",
  },
  {
    id: "b4",
    nama: "Telur Ayam 1kg",
    kategori: "Sembako",
    stok: 20,
    nilaiTukar: 15000,
    satuan: "paket",
  },
  {
    id: "b5",
    nama: "Sabun Mandi",
    kategori: "Kebutuhan Rumah Tangga",
    stok: 50,
    nilaiTukar: 5000,
    satuan: "pcs",
  },
  {
    id: "b6",
    nama: "Deterjen 800g",
    kategori: "Kebutuhan Rumah Tangga",
    stok: 35,
    nilaiTukar: 8000,
    satuan: "paket",
  },
  {
    id: "b7",
    nama: "Mie Instan (5 pcs)",
    kategori: "Sembako",
    stok: 60,
    nilaiTukar: 7500,
    satuan: "paket",
  },
  {
    id: "b8",
    nama: "Teh Celup (25 pcs)",
    kategori: "Sembako",
    stok: 45,
    nilaiTukar: 5000,
    satuan: "kotak",
  },
];

// ---------- Penukaran contoh ----------
export const MOCK_PENUKARAN: Penukaran[] = [
  {
    id: "pn1",
    wargaId: "w1",
    tanggal: "2026-10-27",
    items: [
      {
        barangId: "b1",
        namaBarang: "Beras Premium 5kg",
        jumlah: 1,
        nilaiTukar: 35000,
        subtotal: 35000,
      },
    ],
    totalNilai: 35000,
    status: "selesai",
    catatan: "Sudah diserahkan",
  },
  {
    id: "pn2",
    wargaId: "w3",
    tanggal: "2026-10-28",
    items: [
      {
        barangId: "b2",
        namaBarang: "Minyak Goreng 1L",
        jumlah: 2,
        nilaiTukar: 12000,
        subtotal: 24000,
      },
      {
        barangId: "b5",
        namaBarang: "Sabun Mandi",
        jumlah: 1,
        nilaiTukar: 5000,
        subtotal: 5000,
      },
    ],
    totalNilai: 29000,
    status: "disiapkan",
  },
];

export const MOCK_PENJEMPUTAN: Penjemputan[] = [
  {
    id: "jm1",
    wargaId: "w1",
    tanggalJemput: "2026-11-06",
    metode: "keliling",
    alamat: "Rute Sukamanah Barat · Lapang Desa · 08.00–10.00",
    kategori: ["plastik", "kertas"],
    status: "diajukan",
    createdAt: "2026-11-02T08:00:00",
  },
];

export const MOCK_STOK: StokMaterial[] = [
  { id: "st1", jenjang: "desa", pemilikId: "desa-sukamanah", namaPemilik: "Desa Sukamanah", kategori: "plastik", beratKg: 57.5, kualitas: "baik", klasifikasi: "belum_dipilah", diperbaruiPada: "2026-11-02T08:00:00" },
  { id: "st2", jenjang: "desa", pemilikId: "desa-sukamanah", namaPemilik: "Desa Sukamanah", kategori: "kertas", beratKg: 46, kualitas: "sedang", klasifikasi: "belum_dipilah", diperbaruiPada: "2026-11-02T08:00:00" },
  { id: "st3", jenjang: "kecamatan", pemilikId: "kec-singaparna", namaPemilik: "Kecamatan Singaparna", kategori: "plastik", beratKg: 95, kualitas: "baik", klasifikasi: "dikelola", diperbaruiPada: "2026-11-02T08:00:00" },
  { id: "st4", jenjang: "kecamatan", pemilikId: "kec-singaparna", namaPemilik: "Kecamatan Singaparna", kategori: "organik", beratKg: 55, kualitas: "sedang", klasifikasi: "dikelola", diperbaruiPada: "2026-11-02T08:00:00" },
  { id: "st5", jenjang: "kabupaten", pemilikId: "bumd-tasikmalaya", namaPemilik: "BUMD Kabupaten", kategori: "plastik", beratKg: 180, kualitas: "sedang", klasifikasi: "dikelola", diperbaruiPada: "2026-11-02T08:00:00" },
];

export const MOCK_TRANSFER: TransferMaterial[] = [
  { id: "tr1", asalJenjang: "desa", asalId: "desa-sukamanah", asalNama: "Desa Sukamanah", tujuanJenjang: "kecamatan", tujuanId: "kec-singaparna", tujuanNama: "Kecamatan Singaparna", kategori: "plastik", beratKg: 25, kualitas: "baik", status: "menunggu", dibuatPada: "2026-11-02T08:30:00", reserved: true, catatan: "Stok desa mendekati kapasitas" },
];

export const MOCK_LISTING: ListingMaterial[] = [
  { id: "ls1", pemilikJenjang: "kecamatan", pemilikId: "kec-singaparna", pemilikNama: "Kecamatan Singaparna", kategori: "plastik", beratKg: 120, kualitas: "baik", hargaPerKg: 2500, status: "aktif", dibuatPada: "2026-11-01T09:00:00" },
  { id: "ls2", pemilikJenjang: "kabupaten", pemilikId: "bumd-tasikmalaya", pemilikNama: "BUMD Kabupaten", kategori: "plastik", beratKg: 300, kualitas: "sedang", hargaPerKg: 1800, status: "dipesan", pembeli: "Mitra Daur Ulang Priangan", dibuatPada: "2026-10-30T10:00:00" },
  { id: "ls3", pemilikJenjang: "kecamatan", pemilikId: "kec-singaparna", pemilikNama: "Kecamatan Singaparna", kategori: "organik", beratKg: 80, kualitas: "sedang", hargaPerKg: 500, status: "terjual", pembeli: "Mitra Daur Ulang Priangan", dibuatPada: "2026-10-29T10:00:00" },
];

export const MOCK_PENGOLAHAN: CatatanPengolahan[] = [
  { id: "ol1", listingId: "ls3", mitra: "Mitra Daur Ulang Priangan", kategori: "organik", inputKg: 80, produk: "Kompos matang", outputKg: 52, residuKg: 20, kehilanganKg: 8, tanggal: "2026-11-01" },
];

export const MOCK_DANA: DanaInsentif[] = [
  { id: "dana-desa", jenjang: "desa", namaPemilik: "Desa Sukamanah", saldo: 250000 },
  { id: "dana-kecamatan", jenjang: "kecamatan", namaPemilik: "Kecamatan Singaparna", saldo: 750000 },
  { id: "dana-kabupaten", jenjang: "kabupaten", namaPemilik: "BUMD Kabupaten", saldo: 5000000 },
];

export const MOCK_PENGADUAN: Pengaduan[] = [];

// Opening inventory used only by the demo mass-balance report. Live records
// added after reset are added to this baseline as approved setoran.
export const MOCK_STOK_AWAL_KG = 948.2;

// ---------- Label status untuk UI ----------
export const STATUS_SETORAN_LABEL: Record<StatusSetoran, { label: string; color: string }> = {
  menunggu_verifikasi: { label: "Menunggu verifikasi", color: "amber" },
  terverifikasi: { label: "Terverifikasi", color: "blue" },
  ditolak: { label: "Ditolak", color: "red" },
  perlu_persetujuan: { label: "Perlu persetujuan admin", color: "orange" },
  saldo_ditambahkan: { label: "Saldo ditambahkan (simulasi)", color: "green" },
  selesai: { label: "Selesai", color: "green" },
};

export const STATUS_PENUKARAN_LABEL: Record<StatusPenukaran, { label: string; color: string }> = {
  menunggu: { label: "Menunggu penukaran", color: "amber" },
  disiapkan: { label: "Disiapkan Kopdes", color: "blue" },
  diserahkan: { label: "Sudah diserahkan", color: "green" },
  selesai: { label: "Selesai", color: "green" },
};
