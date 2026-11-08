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
    const raw = localStorage.getItem(key);
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
      return stored;
    }
  } catch {
    // localStorage might be blocked or corrupt
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // silently fail
  }
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
  const transferDana = useCallback((fromId: string, toId: string, amount: number) => {
    if (amount <= 0) return false;
    const source = dana.find((item) => item.id === fromId);
    const target = dana.find((item) => item.id === toId);
    if (!source || !target || source.saldo < amount) return false;
    updateDana(dana.map((item) => item.id === fromId ? { ...item, saldo: item.saldo - amount } : item.id === toId ? { ...item, saldo: item.saldo + amount } : item));
    updateTransaksi([{ id: `dn${Date.now().toString(36)}`, sumberId: fromId, sumberNama: source.namaPemilik, tujuanId: toId, tujuanNama: target.namaPemilik, jenis: "penyaluran", jumlah: amount, tanggal: new Date().toISOString() }, ...transaksi]);
    return true;
  }, [dana, transaksi, updateDana, updateTransaksi]);
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
