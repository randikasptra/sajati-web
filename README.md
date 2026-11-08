# SAJATI Web

Prototype statis untuk alur Sistem Jejaring Sampah Bernilai dan Terintegrasi. Semua data saat ini berupa ilustrasi dan disimpan di browser; aplikasi belum terhubung ke layanan publik, API, atau database.

## Menjalankan

Deploy Vercel: pilih repository `randikasptra/sajati-web`, branch `main`, **Root Directory** di root repository (kosong atau `./`), Framework Preset **Next.js**, dan Build Command `npm run build`. Script build memeriksa bahwa output `/` benar-benar berisi landing page SAJATI. Jika domain menampilkan template Next.js meskipun pemeriksaan ini lolos, periksa commit SHA di deployment Production dan domain yang terhubung pada project Vercel. Pastikan seluruh perubahan lokal, termasuk file baru di `app/dashboard/`, sudah masuk dalam commit yang didorong ke repository tersebut.

Gunakan Node.js 20.9 atau lebih baru, lalu jalankan:

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Untuk mengembalikan data demo ke kondisi awal, buka **Pengaturan presentasi > Kembalikan data awal** di sidebar.

## Alur demo

1. Warga memilih setor langsung di desa atau mendaftar ke jadwal setor keliling berdasarkan rute dan titik kumpul wilayah. Petugas tidak menerima permintaan jemput ke rumah.
2. Petugas desa mencari akun warga, memasukkan berat hasil timbang, dan memverifikasi setoran. Hasil timbang langsung masuk stok fisik yang dikunci. Sesudah pengesahan, petugas memilah seluruh/sebagian berat sebagai dapat dikelola, perlu pengelola lanjutan, atau residu.
3. Admin desa menyetujui nilai setoran. Saldo hanya bertambah jika dana desa cukup. Kapasitas diperiksa saat pencatatan penerimaan, sehingga kekurangan dana tidak menghilangkan stok fisik.
4. Kecamatan menerima transfer desa, mengonsolidasikan stok, dan menyalurkan dana ke desa. BUMD menerima transfer kecamatan, menyalurkan dana ke kecamatan, dan menawarkan material ke marketplace.
5. Mitra memesan material, mengonfirmasi penerimaan, lalu mencatat produk, residu, dan kehilangan proses. Input harus sama dengan jumlah keluar.
6. Dashboard kabupaten merangkum stok, transfer, status marketplace, hasil olah, dan neraca massa ilustrasi.
7. Warga menukar saldo dengan barang Kopdes. Katalog, stok, saldo, dan transaksi demo tersinkron lintas peran pada browser yang sama.

## Struktur penting

URL publik: `/` untuk landing dan `/login` untuk masuk. Sesudah login, pengguna menuju `/dashboard` sesuai peran akun. Semua fitur berada di bawah `/dashboard`, misalnya `/dashboard/setor`, `/dashboard/petugas/stok`, dan `/dashboard/kecamatan/transfer`. Akses dashboard tanpa sesi diarahkan ke login; keluar akun kembali ke `/login`. Bookmark fitur lama diarahkan ke URL baru.

- `app/page.tsx`: pemilihan peran demo dan navigasi.
- `app/(roles)/`: tampilan warga, petugas, admin desa, Kopdes, kecamatan, BUMD, mitra, dan kabupaten.
- `data/mock.ts`: tipe domain serta data awal demo.
- `lib/store.ts`: batas akses data UI. Saat ini adapter lokal memakai `localStorage` dan event sinkronisasi antarkomponen/tab.
- `components/ui/`: komponen antarmuka.

## Backend pada tahap berikutnya

UI memakai hook domain dari `lib/store.ts`; komponen tidak mengakses `localStorage` secara langsung. Untuk Supabase, ganti implementasi penyimpanan di lapisan tersebut dengan repository/API async, lalu tambahkan migrasi tabel, autentikasi, Row Level Security, serta pencatatan audit di server. Saldo, dana insentif, stok, transfer, dan marketplace perlu dimutasi secara transaksional di backend sebelum dipakai operasional.

Harga sampah, kapasitas lokasi, saldo dana, dan saldo awal neraca massa hanyalah seed untuk simulasi. Nilai dan data perlu diganti berdasarkan SOP, baseline, serta keputusan pemangku kepentingan sebelum pilot.


## Revisi alur layanan

- Petugas menerbitkan jadwal keliling; warga memilih jadwal terbit, bukan menentukan waktu jemput rumah.
- Login lokal memvalidasi pasangan kredensial contoh. Satu akun warga terikat ke Siti Aminah; wilayah contoh tetap Sukamanah/Singaparna/Tasikmalaya. Ini belum autentikasi server atau pembatasan akses produksi.
- Stok dialokasikan saat transfer diajukan, lalu pengirim mengonfirmasi keberangkatan. Tujuan mencatat berat terima dan alasan selisih/penolakan. Berat terima lebih besar harus ditolak untuk timbang ulang. Stok ditolak kembali ke asal.
- Material perlu pengelola lanjutan dapat dikirim. Residu tercatat terpisah dan tidak dapat dijual. Penyelesaian penanganan akhir residu belum terhubung ke operator eksternal.
- BUMD mencatat pembayaran setelah mitra menerima barang; pencatatan pembayaran mengkredit dana BUMD satu kali. Tidak ada transaksi uang nyata.
- Penukaran menghasilkan kode pengambilan yang terlihat pada riwayat warga dan Kopdes.
- Kecamatan/BUMD memiliki URL fitur stok, transfer, dana, serta penjualan; navigasi memakai Next Link.
- Transaksi utama disimpan sebagai satu snapshot `sajati_snapshot_v2`. Data lama masih dibaca sebagai fallback, tanpa reset otomatis. Baris stok lama dengan ID identik dideduplikasi; kerusakan historis lintas transaksi tidak direkonstruksi otomatis.
- Snapshot lokal menjamin satu penulisan untuk perubahan terkait pada satu tab, bukan transaksi multi-pengguna. Backend nanti perlu idempotency, transaksi database, otorisasi wilayah, dan audit server.

## Verifikasi alur

`node scripts/check-flows.mjs` menguji timbang, stok terkunci, pengesahan, pemilahan sebagian, penerimaan/penolakan transfer, konservasi berat, pembayaran, dan penukaran pada penyimpanan terisolasi.
