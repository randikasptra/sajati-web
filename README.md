# SAJATI Web

Prototype statis untuk alur Sistem Jejaring Sampah Bernilai dan Terintegrasi. Semua data saat ini berupa ilustrasi dan disimpan di browser; aplikasi belum terhubung ke layanan publik, API, atau database.

## Menjalankan

Gunakan Node.js 20.9 atau lebih baru, lalu jalankan:

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Untuk mengembalikan data demo ke kondisi awal, gunakan **Reset Data Demo** di sidebar atau landing page.

## Alur demo

1. Warga memilih setor langsung di desa atau mendaftar ke jadwal setor keliling berdasarkan rute dan titik kumpul wilayah. Petugas tidak menerima permintaan jemput ke rumah.
2. Petugas desa mencari akun warga, memasukkan berat hasil timbang, dan memverifikasi setoran. Setelah disetujui, material masuk ke stok desa; petugas lalu memilah stok sebagai dapat atau tidak dapat dikelola sebelum menyalurkannya.
3. Admin desa menyetujui nilai setoran. Saldo hanya bertambah jika dana desa cukup dan kapasitas penampungan tidak terlampaui.
4. Kecamatan menerima transfer desa, mengonsolidasikan stok, dan menyalurkan dana ke desa. BUMD menerima transfer kecamatan, menyalurkan dana ke kecamatan, dan menawarkan material ke marketplace.
5. Mitra memesan material, mengonfirmasi penerimaan, lalu mencatat produk, residu, dan kehilangan proses. Input harus sama dengan jumlah keluar.
6. Dashboard kabupaten merangkum stok, transfer, status marketplace, hasil olah, dan neraca massa ilustrasi.
7. Warga menukar saldo dengan barang Kopdes. Katalog, stok, saldo, dan transaksi demo tersinkron lintas peran pada browser yang sama.

## Struktur penting

- `app/page.tsx`: pemilihan peran demo dan navigasi.
- `app/(roles)/`: tampilan warga, petugas, admin desa, Kopdes, kecamatan, BUMD, mitra, dan kabupaten.
- `data/mock.ts`: tipe domain serta data awal demo.
- `lib/store.ts`: batas akses data UI. Saat ini adapter lokal memakai `localStorage` dan event sinkronisasi antarkomponen/tab.
- `components/ui/`: komponen antarmuka.

## Backend pada tahap berikutnya

UI memakai hook domain dari `lib/store.ts`; komponen tidak mengakses `localStorage` secara langsung. Untuk Supabase, ganti implementasi penyimpanan di lapisan tersebut dengan repository/API async, lalu tambahkan migrasi tabel, autentikasi, Row Level Security, serta pencatatan audit di server. Saldo, dana insentif, stok, transfer, dan marketplace perlu dimutasi secara transaksional di backend sebelum dipakai operasional.

Harga sampah, kapasitas lokasi, saldo dana, dan saldo awal neraca massa hanyalah seed untuk simulasi. Nilai dan data perlu diganti berdasarkan SOP, baseline, serta keputusan pemangku kepentingan sebelum pilot.
