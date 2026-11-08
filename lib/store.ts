// ============================================================
// SAJATI — State Management via localStorage
// Menyimpan state prototype di localStorage agar perubahan
// tetap terlihat setelah refresh. Ini BUKAN backend.
// ============================================================

"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import type {
  BarangKopdes,
  CatatanPengolahan,
  DanaInsentif,
  ListingMaterial,
  Penjemputan,
  Pengaduan,
  Setoran,
  StokMaterial,
  TransferMaterial,
  TransaksiDana,
  Penukaran,
  Warga,
} from "@/data/mock";
import {
  MOCK_BARANG_KOPDES,
  MOCK_DANA,
  MOCK_LISTING,
  MOCK_PENGADUAN,
  MOCK_PENGOLAHAN,
  MOCK_PENJEMPUTAN,
  MOCK_SETORAN,
  MOCK_PENUKARAN,
  MOCK_STOK,
  MOCK_TRANSFER,
  MOCK_WARGA,
} from "@/data/mock";

const STORAGE_KEYS = {
  setoran: "sajati_setoran",
  penukaran: "sajati_penukaran",
  warga: "sajati_warga",
  activeRole: "sajati_active_role",
  penjemputan: "sajati_penjemputan",
  stok: "sajati_stok",
  transfer: "sajati_transfer",
  listing: "sajati_listing",
  pengolahan: "sajati_pengolahan",
  dana: "sajati_dana",
  pengaduan: "sajati_pengaduan",
  katalog: "sajati_katalog",
  transaksiDana: "sajati_transaksi_dana",
} as const;

// This module is the data adapter boundary. The demo implementation persists
// locally today; future API/Supabase work can replace this module while the UI
// continues to consume the same domain hooks.

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const snapshot = JSON.parse(localStorage.getItem("sajati_snapshot_v2") ?? "{}");
    const raw = snapshot[key] !== undefined ? JSON.stringify(snapshot[key]) : localStorage.getItem(key);
    if (raw) {
      const stored = JSON.parse(raw) as T;
      // The original demo seed included a pre-filled pending-weight row. Treat
      // that sample as already weighed and verified so new warga requests never
      // appear to receive a weight before the village weighing step.
      if (key === STORAGE_KEYS.setoran && Array.isArray(stored)) {
        for (const record of stored as Setoran[]) {
          if (record.id === "s2" && record.status === "menunggu_verifikasi") {
            record.status = "terverifikasi";
            record.petugasId = "p1";
          }
        }
      }
      if (key === STORAGE_KEYS.stok && Array.isArray(stored)) {
        for (const stock of stored as StokMaterial[]) {
          if (!stock.klasifikasi) stock.klasifikasi = stock.jenjang === "desa" ? "belum_dipilah" : "dikelola";
        }
      }
      if (key === STORAGE_KEYS.stok && Array.isArray(stored)) return [...new Map((stored as StokMaterial[]).map(r=>[r.id,r])).values()] as T;
      return stored;
    }
  } catch {
    // localStorage might be blocked or corrupt
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  const snapshot = JSON.parse(localStorage.getItem("sajati_snapshot_v2") ?? "{}");
  localStorage.setItem("sajati_snapshot_v2", JSON.stringify({ ...snapshot, [key]: data }));
}

// Custom event for cross-tab / cross-component sync
const SYNC_EVENT = "sajati_state_sync";

function dispatchSync() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SYNC_EVENT));
  }
}

function useStoredCollection<T>(key: string, fallback: T[]) {
  // Keep the server render and first client render identical. Browser storage
  // is applied after hydration so a returning demo never causes mismatch.
  const [items, setItems] = useState<T[]>(fallback);

  useEffect(() => {
    const handler = () => setItems(loadFromStorage(key, fallback));
    handler();
    window.addEventListener(SYNC_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(SYNC_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, [key, fallback]);

  const updateItems = useCallback((updated: T[]) => {
    setItems(updated);
    saveToStorage(key, updated);
    dispatchSync();
  }, [key]);

  return [items, updateItems] as const;
}

// ---------- Hooks ----------

export function useSetoran() {
  const [setoran, updateSetoran] = useStoredCollection<Setoran>(STORAGE_KEYS.setoran, MOCK_SETORAN);

  const addSetoran = useCallback(
    (s: Setoran) => {
      const next = [s, ...setoran];
      updateSetoran(next);
    },
    [setoran, updateSetoran]
  );

  const updateSetoranById = useCallback(
    (id: string, patch: Partial<Setoran>) => {
      const next = setoran.map((s) => (s.id === id ? { ...s, ...patch } : s));
      updateSetoran(next);
    },
    [setoran, updateSetoran]
  );

  return { setoran, addSetoran, updateSetoranById, updateSetoran };
}

export function useWarga() {
  const [wargaList, updateWarga] = useStoredCollection<Warga>(STORAGE_KEYS.warga, MOCK_WARGA);

  const updateSaldo = useCallback(
    (wargaId: string, amount: number) => {
      const next = wargaList.map((w) =>
        w.id === wargaId ? { ...w, saldo: w.saldo + amount } : w
      );
      updateWarga(next);
    },
    [wargaList, updateWarga]
  );

  const getWarga = useCallback(
    (id: string) => wargaList.find((w) => w.id === id),
    [wargaList]
  );

  return { wargaList, updateSaldo, getWarga, updateWarga };
}

export function usePenukaran() {
  const [penukaran, updatePenukaran] = useStoredCollection<Penukaran>(STORAGE_KEYS.penukaran, MOCK_PENUKARAN);

  const addPenukaran = useCallback(
    (p: Penukaran) => {
      const next = [p, ...penukaran];
      updatePenukaran(next);
    },
    [penukaran, updatePenukaran]
  );

  const updatePenukaranById = useCallback(
    (id: string, patch: Partial<Penukaran>) => {
      const next = penukaran.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      );
      updatePenukaran(next);
    },
    [penukaran, updatePenukaran]
  );

  return { penukaran, addPenukaran, updatePenukaranById, updatePenukaran };
}

export function usePenjemputan() {
  const [penjemputan, updatePenjemputan] = useStoredCollection<Penjemputan>(STORAGE_KEYS.penjemputan, MOCK_PENJEMPUTAN);
  const addPenjemputan = useCallback((item: Penjemputan) => updatePenjemputan([item, ...penjemputan]), [penjemputan, updatePenjemputan]);
  const updatePenjemputanById = useCallback((id: string, patch: Partial<Penjemputan>) => updatePenjemputan(penjemputan.map((item) => item.id === id ? { ...item, ...patch } : item)), [penjemputan, updatePenjemputan]);
  return { penjemputan, addPenjemputan, updatePenjemputanById, updatePenjemputan };
}

export function useStok() {
  const [stok, updateStok] = useStoredCollection<StokMaterial>(STORAGE_KEYS.stok, MOCK_STOK);
  return { stok, updateStok };
}

export function useTransfer() {
  const [transfer, updateTransfer] = useStoredCollection<TransferMaterial>(STORAGE_KEYS.transfer, MOCK_TRANSFER);
  const addTransfer = useCallback((item: TransferMaterial) => updateTransfer([item, ...transfer]), [transfer, updateTransfer]);
  const updateTransferById = useCallback((id: string, patch: Partial<TransferMaterial>) => updateTransfer(transfer.map((item) => item.id === id ? { ...item, ...patch } : item)), [transfer, updateTransfer]);
  return { transfer, addTransfer, updateTransferById, updateTransfer };
}

export function useMarketplace() {
  const [listings, updateListings] = useStoredCollection<ListingMaterial>(STORAGE_KEYS.listing, MOCK_LISTING);
  const addListing = useCallback((item: ListingMaterial) => updateListings([item, ...listings]), [listings, updateListings]);
  const updateListingById = useCallback((id: string, patch: Partial<ListingMaterial>) => updateListings(listings.map((item) => item.id === id ? { ...item, ...patch } : item)), [listings, updateListings]);
  return { listings, addListing, updateListingById, updateListings };
}

export function usePengolahan() {
  const [pengolahan, updatePengolahan] = useStoredCollection<CatatanPengolahan>(STORAGE_KEYS.pengolahan, MOCK_PENGOLAHAN);
  const addPengolahan = useCallback((item: CatatanPengolahan) => updatePengolahan([item, ...pengolahan]), [pengolahan, updatePengolahan]);
  return { pengolahan, addPengolahan, updatePengolahan };
}

export function useDana() {
  const [dana, updateDana] = useStoredCollection<DanaInsentif>(STORAGE_KEYS.dana, MOCK_DANA);
  const [transaksi, updateTransaksi] = useStoredCollection<TransaksiDana>(STORAGE_KEYS.transaksiDana, []);
  const getDana = useCallback((id: string) => dana.find((item) => item.id === id), [dana]);
  const transferDana = moveFunds;
  const deductDana = useCallback((id: string, amount: number, tujuanNama = "Saldo warga", referensi?: string) => {
    const source = dana.find((item) => item.id === id);
    if (!source || amount <= 0 || source.saldo < amount) return false;
    updateDana(dana.map((item) => item.id === id ? { ...item, saldo: item.saldo - amount } : item));
    updateTransaksi([{ id: `dn${Date.now().toString(36)}`, sumberId: id, sumberNama: source.namaPemilik, tujuanNama, jenis: "insentif_warga", jumlah: amount, referensi, tanggal: new Date().toISOString() }, ...transaksi]);
    return true;
  }, [dana, transaksi, updateDana, updateTransaksi]);
  return { dana, transaksi, getDana, transferDana, deductDana, updateDana };
}

export function usePengaduan() {
  const [pengaduan, updatePengaduan] = useStoredCollection<Pengaduan>(STORAGE_KEYS.pengaduan, MOCK_PENGADUAN);
  const addPengaduan = useCallback((item: Pengaduan) => updatePengaduan([item, ...pengaduan]), [pengaduan, updatePengaduan]);
  const updatePengaduanById = useCallback((id: string, patch: Partial<Pengaduan>) => updatePengaduan(pengaduan.map((item) => item.id === id ? { ...item, ...patch } : item)), [pengaduan, updatePengaduan]);
  return { pengaduan, addPengaduan, updatePengaduanById, updatePengaduan };
}

export function useKatalog() {
  const [katalog, updateKatalog] = useStoredCollection<BarangKopdes>(STORAGE_KEYS.katalog, MOCK_BARANG_KOPDES);
  const updateBarang = useCallback((id: string, patch: Partial<BarangKopdes>) => updateKatalog(katalog.map((item) => item.id === id ? { ...item, ...patch } : item)), [katalog, updateKatalog]);
  return { katalog, updateKatalog, updateBarang };
}

export type ActiveRole = "warga" | "petugas" | "admin" | "kopdes" | "kecamatan" | "bumd" | "mitra" | "kabupaten";

export function useActiveRole() {
  const subscribe = useCallback((listener: () => void) => {
    window.addEventListener(SYNC_EVENT, listener);
    window.addEventListener("storage", listener);
    return () => {
      window.removeEventListener(SYNC_EVENT, listener);
      window.removeEventListener("storage", listener);
    };
  }, []);
  const getSnapshot = useCallback(() => {
    const storedRole = loadFromStorage<ActiveRole>(STORAGE_KEYS.activeRole, "warga");
    const validRoles: ActiveRole[] = ["warga", "petugas", "admin", "kopdes", "kecamatan", "bumd", "mitra", "kabupaten"];
    return validRoles.includes(storedRole) ? storedRole : "warga";
  }, []);
  const role = useSyncExternalStore<ActiveRole>(subscribe, getSnapshot, () => "warga");

  const setRole = useCallback((r: ActiveRole) => {
    saveToStorage(STORAGE_KEYS.activeRole, r);
    dispatchSync();
  }, []);

  return { role, setRole };
}

// ---------- Reset prototype ----------
export function resetPrototype() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("sajati_snapshot_v2");
  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
  dispatchSync();
  window.location.reload();
}


// One storage write commits all affected collections. Replace this boundary with
// a backend transaction when server persistence is introduced.
function commitCollections(changes: Record<string, unknown>) {
  const snapshot = JSON.parse(localStorage.getItem("sajati_snapshot_v2") ?? "{}");
  localStorage.setItem("sajati_snapshot_v2", JSON.stringify({ ...snapshot, ...changes }));
  dispatchSync();
}
const uid = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
const stocks = () => loadFromStorage<StokMaterial[]>(STORAGE_KEYS.stok, MOCK_STOK);
const deposits = () => loadFromStorage<Setoran[]>(STORAGE_KEYS.setoran, MOCK_SETORAN);
function depositStocks(s: Setoran): StokMaterial[] {
  return s.items.map(item => ({ id: uid("st"), setoranId: s.id, terkunci: true,
    jenjang: "desa", pemilikId: "desa-sukamanah", namaPemilik: "Desa Sukamanah",
    kategori: item.kategori, beratKg: item.berat, kualitas: item.kualitas,
    klasifikasi: "belum_dipilah", diperbaruiPada: new Date().toISOString() }));
}
export function recordDeposit(s: Setoran) {
  const all = deposits(), inventory = stocks();
  if (all.some(row => row.id === s.id || (s.penjemputanId && row.penjemputanId === s.penjemputanId))) throw new Error("Setoran ini sudah dicatat.");
  if (!s.items.length || s.items.some(i => !Number.isFinite(i.berat) || i.berat <= 0)) throw new Error("Berat timbang harus valid.");
  const total = inventory.filter(i => i.pemilikId === "desa-sukamanah").reduce((a,i) => a+i.beratKg,0);
  if (total + s.items.reduce((a,i)=>a+i.berat,0) > 300) throw new Error("Kapasitas desa tidak cukup. Salurkan stok sebelum menerima material baru.");
  const requests = loadFromStorage<Penjemputan[]>(STORAGE_KEYS.penjemputan, MOCK_PENJEMPUTAN);
  commitCollections({ [STORAGE_KEYS.setoran]: [{...s, stokTercatat: true}, ...all],
    [STORAGE_KEYS.stok]: [...inventory, ...depositStocks(s)],
    [STORAGE_KEYS.penjemputan]: requests.map(r => r.id === s.penjemputanId ? {...r, status: "selesai"} : r) });
}
export function verifyDeposit(id: string, reason?: string) {
  const all=deposits(), s=all.find(r=>r.id===id);
  if (!s || s.status !== "menunggu_verifikasi") throw new Error("Setoran sudah diproses.");
  commitCollections({[STORAGE_KEYS.setoran]: all.map(r=>r.id===id?{...r,status: reason ? "ditolak":"terverifikasi",alasanTolak:reason,petugasId:"p1"}:r)});
}
export function approveDeposit(id: string) {
  const all=deposits(), s=all.find(r=>r.id===id);
  if (!s || s.status!=="terverifikasi") throw new Error("Setoran sudah diproses atau belum diverifikasi.");
  const funds=loadFromStorage<DanaInsentif[]>(STORAGE_KEYS.dana,MOCK_DANA);
  const people=loadFromStorage<Warga[]>(STORAGE_KEYS.warga,MOCK_WARGA);
  const fund=funds.find(r=>r.id==="dana-desa"), person=people.find(r=>r.id===s.wargaId);
  if (!person || !fund || fund.saldo<s.totalNilai) throw new Error("Dana insentif desa belum cukup. Stok tetap tercatat; minta penyaluran dana kecamatan.");
  let inventory=stocks();
  if (!s.stokTercatat) inventory=[...inventory,...depositStocks(s)];
  const log=loadFromStorage<TransaksiDana[]>(STORAGE_KEYS.transaksiDana,[]);
  commitCollections({[STORAGE_KEYS.setoran]:all.map(r=>r.id===id?{...r,status:"saldo_ditambahkan",stokTercatat:true,adminId:"a1"}:r),
    [STORAGE_KEYS.stok]:inventory.map(r=>r.setoranId===id?{...r,terkunci:false}:r),
    [STORAGE_KEYS.warga]:people.map(r=>r.id===person.id?{...r,saldo:r.saldo+s.totalNilai}:r),
    [STORAGE_KEYS.dana]:funds.map(r=>r.id===fund.id?{...r,saldo:r.saldo-s.totalNilai}:r),
    [STORAGE_KEYS.transaksiDana]:[{id:uid("dn"),sumberId:fund.id,sumberNama:fund.namaPemilik,tujuanNama:person.nama,jenis:"insentif_warga",jumlah:s.totalNilai,referensi:id,tanggal:new Date().toISOString()},...log] });
}
export function sortStock(id: string, kg: number, classification: StokMaterial["klasifikasi"]) {
  const inventory=stocks(), row=inventory.find(r=>r.id===id);
  if (!row || row.terkunci || !Number.isFinite(kg) || kg<=0 || kg>row.beratKg) throw new Error("Pilih berat dalam stok yang sudah disahkan.");
  const next=inventory.flatMap(r=>r.id!==id?[r]:r.beratKg-kg>0.0001?[{...r,beratKg:r.beratKg-kg}]:[]);
  next.push({...row,id:uid("st"),beratKg:kg,klasifikasi:classification,diperbaruiPada:new Date().toISOString()});
  commitCollections({[STORAGE_KEYS.stok]:next});
}
export function createTransfer(stockId: string, kg: number, destination: {level: TransferMaterial["tujuanJenjang"];id:string;name:string}) {
  const inventory=stocks(), source=inventory.find(r=>r.id===stockId);
  if (!source || source.terkunci || !["dikelola","tidak_dikelola"].includes(source.klasifikasi??"") || !Number.isFinite(kg) || kg<=0 || kg>source.beratKg) throw new Error("Stok tidak tersedia untuk pengiriman ini.");
  const transfers=loadFromStorage<TransferMaterial[]>(STORAGE_KEYS.transfer,MOCK_TRANSFER);
  const row:TransferMaterial={id:uid("tr"),stokAsalId:source.id,asalId:source.pemilikId,asalNama:source.namaPemilik,asalJenjang:source.jenjang,tujuanId:destination.id,tujuanNama:destination.name,tujuanJenjang:destination.level,kategori:source.kategori,kualitas:source.kualitas,klasifikasi:source.klasifikasi,beratKg:kg,status:"menunggu",reserved:true,dibuatPada:new Date().toISOString()};
  commitCollections({[STORAGE_KEYS.stok]:inventory.flatMap(r=>r.id!==source.id?[r]:r.beratKg>kg?[{...r,beratKg:r.beratKg-kg}]:[]),[STORAGE_KEYS.transfer]:[row,...transfers]});
}
export function processTransfer(id:string, action:"kirim"|"terima"|"tolak", receivedKg?:number, reason="") {
  const transfers=loadFromStorage<TransferMaterial[]>(STORAGE_KEYS.transfer,MOCK_TRANSFER), item=transfers.find(r=>r.id===id);
  if (!item || !["menunggu","dikirim"].includes(item.status)) throw new Error("Transfer sudah diproses.");
  if (action==="kirim") {
    if(item.status!=="menunggu") throw new Error("Material sudah dikirim.");
    commitCollections({[STORAGE_KEYS.transfer]:transfers.map(r=>r.id===id?{...r,status:"dikirim"}:r)}); return;
  }
  if(action==="terima" && item.status!=="dikirim") throw new Error("Pengirim belum mengonfirmasi keberangkatan.");
  if(action==="tolak" && !reason.trim()) throw new Error("Isi alasan penolakan.");
  const kg=action==="terima"?receivedKg??item.beratKg:item.beratKg;
  if(!Number.isFinite(kg)||kg<=0||kg>item.beratKg) throw new Error("Berat diterima harus positif dan tidak melebihi berat kirim. Jika lebih, tolak untuk timbang ulang.");
  if(action==="terima" && Math.abs(kg-item.beratKg)>0.001 && !reason.trim()) throw new Error("Isi alasan selisih timbang.");
  let inventory=stocks();
  const owner=action==="terima"?item.tujuanId:item.asalId;
  const level=action==="terima"?item.tujuanJenjang:item.asalJenjang;
  const capacity={desa:300,kecamatan:2000,kabupaten:10000}[level];
  if(action==="terima" && inventory.filter(r=>r.pemilikId===owner).reduce((a,r)=>a+r.beratKg,0)+kg>capacity) throw new Error("Kapasitas tujuan tidak cukup. Salurkan stok atau tolak disertai alasan.");
  if(!item.reserved && action==="terima") {
    const source=inventory.find(r=>r.pemilikId===item.asalId && r.kategori===item.kategori && r.beratKg>=item.beratKg);
    if(!source) throw new Error("Stok asal tidak mencukupi.");
    inventory=inventory.flatMap(r=>r.id!==source.id?[r]:r.beratKg>item.beratKg?[{...r,beratKg:r.beratKg-item.beratKg}]:[]);
  }
  if(action==="terima" || item.reserved) inventory.push({id:uid("st"),jenjang:level,pemilikId:owner,namaPemilik:action==="terima"?item.tujuanNama:item.asalNama,kategori:item.kategori,beratKg:kg,kualitas:item.kualitas??"sedang",klasifikasi:action==="terima"?"belum_dipilah":item.klasifikasi??"dikelola",diperbaruiPada:new Date().toISOString()});
  commitCollections({[STORAGE_KEYS.stok]:inventory,[STORAGE_KEYS.transfer]:transfers.map(r=>r.id===id?{...r,status:action==="terima"?"diterima":"ditolak",beratDiterima:action==="terima"?kg:undefined,alasanSelisih:action==="terima"?reason:undefined,alasanTolak:action==="tolak"?reason:undefined,diterimaPada:new Date().toISOString()}:r)});
}
export interface JadwalKeliling {id:string;wilayah:string;titik:string;tanggal:string;waktu:string;status:"terbit"|"ditutup"}
const INITIAL_SCHEDULES:JadwalKeliling[]=[];
export function useJadwal() {
 const [jadwal,updateJadwal]=useStoredCollection<JadwalKeliling>("sajati_jadwal",INITIAL_SCHEDULES);
 return {jadwal,updateJadwal};
}

export function publishListing(stockId:string,kg:number,price:number) {
 const inventory=stocks(),source=inventory.find(s=>s.id===stockId);
 if(!source||source.terkunci||source.klasifikasi!=="dikelola"||!Number.isFinite(kg)||kg<=0||kg>source.beratKg||!Number.isFinite(price)||price<=0)throw new Error("Stok, berat, atau harga tidak valid.");
 const listings=loadFromStorage<ListingMaterial[]>(STORAGE_KEYS.listing,MOCK_LISTING);
 commitCollections({[STORAGE_KEYS.stok]:inventory.flatMap(s=>s.id!==stockId?[s]:s.beratKg>kg?[{...s,beratKg:s.beratKg-kg}]:[]),[STORAGE_KEYS.listing]:[{id:uid("ls"),pemilikJenjang:source.jenjang,pemilikId:source.pemilikId,pemilikNama:source.namaPemilik,kategori:source.kategori,beratKg:kg,kualitas:source.kualitas,hargaPerKg:price,status:"aktif",pembayaran:"belum_dibayar",dibuatPada:new Date().toISOString()},...listings]});
}
export function confirmPayment(id:string) {
 const listings=loadFromStorage<ListingMaterial[]>(STORAGE_KEYS.listing,MOCK_LISTING),item=listings.find(r=>r.id===id);
 if(!item||item.status!=="terjual"||item.pembayaran==="lunas")throw new Error("Pembayaran sudah dicatat atau barang belum diterima.");
 const funds=loadFromStorage<DanaInsentif[]>(STORAGE_KEYS.dana,MOCK_DANA),fundId=item.pemilikJenjang==="kabupaten"?"dana-kabupaten":"dana-kecamatan";
 const logs=loadFromStorage<TransaksiDana[]>(STORAGE_KEYS.transaksiDana,[]);
 const amount=Math.round(item.beratKg*item.hargaPerKg);
 commitCollections({[STORAGE_KEYS.listing]:listings.map(r=>r.id===id?{...r,pembayaran:"lunas",dibayarPada:new Date().toISOString()}:r),[STORAGE_KEYS.dana]:funds.map(f=>f.id===fundId?{...f,saldo:f.saldo+amount}:f),[STORAGE_KEYS.transaksiDana]:[{id:uid("dn"),sumberId:"mitra",sumberNama:item.pembeli??"Mitra",tujuanId:fundId,tujuanNama:item.pemilikNama,jenis:"penjualan",jumlah:amount,referensi:id,tanggal:new Date().toISOString()},...logs]});
}
export function redeemGoods(wargaId:string,cart:Record<string,number>) {
 const people=loadFromStorage<Warga[]>(STORAGE_KEYS.warga,MOCK_WARGA),person=people.find(w=>w.id===wargaId);
 const catalog=loadFromStorage<BarangKopdes[]>(STORAGE_KEYS.katalog,MOCK_BARANG_KOPDES);
 const entries=Object.entries(cart).filter(([,n])=>n>0);
 if(!person||!entries.length)throw new Error("Pilih barang terlebih dahulu.");
 const items=entries.map(([id,qty])=>{const item=catalog.find(b=>b.id===id);if(!item||!Number.isInteger(qty)||qty<1||qty>item.stok)throw new Error("Stok barang tidak mencukupi.");return {barangId:id,namaBarang:item.nama,jumlah:qty,nilaiTukar:item.nilaiTukar,subtotal:qty*item.nilaiTukar};});
 const total=items.reduce((a,i)=>a+i.subtotal,0);
 if(total>person.saldo)throw new Error("Saldo tidak mencukupi.");
 const id=uid("pn"),orders=loadFromStorage<Penukaran[]>(STORAGE_KEYS.penukaran,MOCK_PENUKARAN);
 commitCollections({[STORAGE_KEYS.warga]:people.map(w=>w.id===wargaId?{...w,saldo:w.saldo-total}:w),[STORAGE_KEYS.katalog]:catalog.map(b=>({...b,stok:b.stok-(cart[b.id]??0)})),[STORAGE_KEYS.penukaran]:[{id,wargaId,tanggal:new Date().toISOString(),items,totalNilai:total,status:"menunggu"},...orders]});return id;
}
export function moveFunds(fromId:string,toId:string,amount:number) {
 const funds=loadFromStorage<DanaInsentif[]>(STORAGE_KEYS.dana,MOCK_DANA),source=funds.find(f=>f.id===fromId),target=funds.find(f=>f.id===toId);
 if(!source||!target||fromId===toId||!Number.isFinite(amount)||amount<=0||amount>source.saldo)return false;
 const logs=loadFromStorage<TransaksiDana[]>(STORAGE_KEYS.transaksiDana,[]);
 commitCollections({[STORAGE_KEYS.dana]:funds.map(f=>f.id===fromId?{...f,saldo:f.saldo-amount}:f.id===toId?{...f,saldo:f.saldo+amount}:f),[STORAGE_KEYS.transaksiDana]:[{id:uid("dn"),sumberId:source.id,sumberNama:source.namaPemilik,tujuanId:target.id,tujuanNama:target.namaPemilik,jenis:"penyaluran",jumlah:amount,tanggal:new Date().toISOString()},...logs]});return true;
}
export function useWargaIdentity() {
 return useSyncExternalStore((callback)=>{window.addEventListener("sajati_session_change",callback);window.addEventListener("storage",callback);return()=>{window.removeEventListener("sajati_session_change",callback);window.removeEventListener("storage",callback);};},()=>{try{return JSON.parse(localStorage.getItem("sajati_identity")??"{}").wargaId || "w1";}catch{return "w1";}},()=>"w1") as string;
}
