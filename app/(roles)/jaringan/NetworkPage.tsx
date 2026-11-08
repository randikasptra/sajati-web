"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActiveRole } from "@/lib/store";
import {
  useDana,
  useMarketplace,
  usePengolahan,
  useSetoran,
  useStok,
  useTransfer,
} from "@/lib/store";
import type {
  CatatanPengolahan,
  JenjangPemilik,
  KategoriSampah,
  ListingMaterial,
  TransferMaterial,
} from "@/data/mock";
import { HARGA_SAMPAH, MOCK_STOK_AWAL_KG } from "@/data/mock";
import { formatRupiah, formatTanggalPendek, generateId } from "@/lib/utils";

const CATEGORY_KEYS = Object.keys(HARGA_SAMPAH) as KategoriSampah[];
const CAPACITY_KG: Record<JenjangPemilik, number> = { desa: 300, kecamatan: 2000, kabupaten: 10000 };
const SCOPE: Partial<Record<ActiveRole, { level: JenjangPemilik; id: string; name: string }>> = {
  kecamatan: { level: "kecamatan", id: "kec-singaparna", name: "Kecamatan Singaparna" },
  bumd: { level: "kabupaten", id: "bumd-tasikmalaya", name: "BUMD Kabupaten" },
};

export function NetworkPage({ role }: { role: ActiveRole }) {
  if (role === "kecamatan") return <KecamatanDashboard />;
  if (role === "bumd") return <BumdDashboard />;
  if (role === "mitra") return <MitraDashboard />;
  return <KabupatenDashboard />;
}

export function VillageStockPanel() {
  return <div className="space-y-4"><div><h2 className="text-2xl font-bold">Stok dan pemilahan desa</h2><p className="text-muted-foreground">Setoran masuk sebagai stok setelah disetujui. Pilah material dari daftar stok ini sebelum memilih jalur pengelolaannya.</p></div><StockSortingPanel /><StockSummary level="desa" /><OutgoingTransfer level="desa" id="desa-sukamanah" name="Desa Sukamanah" destination={{ level: "kecamatan", id: "kec-singaparna", name: "Kecamatan Singaparna" }} /></div>;
}

function StockSortingPanel() {
  const { stok, updateStok } = useStok();
  const villageRows = stok.filter((row) => row.jenjang === "desa" && row.pemilikId === "desa-sukamanah");
  const classify = (id: string, klasifikasi: "dikelola" | "tidak_dikelola") => updateStok(stok.map((row) => row.id === id ? { ...row, klasifikasi, diperbaruiPada: new Date().toISOString() } : row));
  return <Card><CardHeader><CardTitle>Pilah stok yang sudah masuk</CardTitle><CardDescription>Pemilahan dilakukan terhadap stok tercatat. Material yang tidak dapat dikelola tetap tersimpan sebagai catatan, tetapi tidak dapat dikirim ke jalur daur ulang.</CardDescription></CardHeader><CardContent className="space-y-2">{villageRows.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada stok desa untuk dipilah.</p> : villageRows.map((row) => {
    const status = row.klasifikasi ?? "belum_dipilah";
    return <div key={row.id} className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{HARGA_SAMPAH[row.kategori].label} · {row.beratKg.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg</p><p className="text-xs text-muted-foreground">Kualitas {row.kualitas} · {status === "belum_dipilah" ? "Belum dipilah" : status === "dikelola" ? "Dapat dikelola" : "Tidak dapat dikelola"}</p></div><div className="flex gap-2"><Button size="sm" variant={status === "dikelola" ? "default" : "outline"} onClick={() => classify(row.id, "dikelola")}>Dapat dikelola</Button><Button size="sm" variant={status === "tidak_dikelola" ? "destructive" : "outline"} onClick={() => classify(row.id, "tidak_dikelola")}>Tidak dapat dikelola</Button></div></div>;
  })}</CardContent></Card>;
}

function Metric({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent><div className="text-2xl font-bold tabular-nums">{value}</div>{detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}</CardContent>
    </Card>
  );
}

function StockSummary({ level }: { level?: JenjangPemilik }) {
  const { stok } = useStok();
  const rows = useMemo(() => {
    const filtered = level ? stok.filter((row) => row.jenjang === level) : stok;
    return CATEGORY_KEYS.map((kategori) => {
      const items = filtered.filter((row) => row.kategori === kategori);
      return {
        kategori,
        kg: items.reduce((sum, row) => sum + row.beratKg, 0),
        manageable: items.filter((row) => (row.klasifikasi ?? (row.jenjang === "desa" ? "belum_dipilah" : "dikelola")) === "dikelola").reduce((sum, row) => sum + row.beratKg, 0),
        pending: items.filter((row) => (row.klasifikasi ?? (row.jenjang === "desa" ? "belum_dipilah" : "dikelola")) === "belum_dipilah").reduce((sum, row) => sum + row.beratKg, 0),
        rejected: items.filter((row) => row.klasifikasi === "tidak_dikelola").reduce((sum, row) => sum + row.beratKg, 0),
      };
    }).filter((row) => row.kg > 0);
  }, [level, stok]);
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Stok material tercatat</CardTitle><CardDescription>Ringkasan seluruh stok, termasuk yang belum dipilah dan yang tidak dapat dikelola.</CardDescription></CardHeader>
        <CardContent className="space-y-2">
          {rows.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada stok.</p> : rows.map((row) => (
            <div key={row.kategori} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div><span className="font-medium">{HARGA_SAMPAH[row.kategori].label}</span><p className="text-xs text-muted-foreground">{row.manageable.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg dikelola · {row.pending.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg belum dipilah · {row.rejected.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg tidak dikelola</p></div><strong className="tabular-nums">{row.kg.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg</strong>
            </div>
          ))}
        </CardContent>
      </Card>
      {!level && <MassBalanceSummary />}
    </div>
  );
}

function MassBalanceSummary() {
  const { setoran } = useSetoran();
  const { stok } = useStok();
  const { transfer } = useTransfer();
  const { listings } = useMarketplace();
  const { pengolahan } = usePengolahan();
  const { transaksi } = useDana();
  const approvedWeight = setoran.filter((item) => item.status === "saldo_ditambahkan" || item.status === "selesai").reduce((sum, item) => sum + item.items.reduce((itemSum, line) => itemSum + line.berat, 0), 0);
  const stockWeight = stok.reduce((sum, item) => sum + item.beratKg, 0);
  const transitWeight = transfer.filter((item) => item.status === "menunggu").reduce((sum, item) => sum + item.beratKg, 0);
  const activeWeight = listings.filter((item) => item.status === "aktif").reduce((sum, item) => sum + item.beratKg, 0);
  const orderedWeight = listings.filter((item) => item.status === "dipesan").reduce((sum, item) => sum + item.beratKg, 0);
  const soldWeight = listings.filter((item) => item.status === "terjual").reduce((sum, item) => sum + item.beratKg, 0);
  const processedWeight = pengolahan.reduce((sum, item) => sum + item.inputKg, 0);
  const outputWeight = pengolahan.reduce((sum, item) => sum + item.outputKg + item.residuKg + item.kehilanganKg, 0);
  const accounted = stockWeight + transitWeight + activeWeight + orderedWeight + Math.max(0, soldWeight - processedWeight) + outputWeight;
  const expected = MOCK_STOK_AWAL_KG + approvedWeight;
  const difference = expected - accounted;
  return <div className="space-y-4"><Card><CardHeader><CardTitle>Neraca massa</CardTitle><CardDescription>Membandingkan stok awal dan setoran disetujui dengan stok, transfer, marketplace, serta hasil olah yang tercatat.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3"><Metric label="Material terukur" value={`${accounted.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} /><Metric label="Material yang seharusnya tercatat" value={`${expected.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} detail={`Saldo awal demo ${MOCK_STOK_AWAL_KG.toLocaleString("id-ID")} kg + setoran disetujui ${approvedWeight.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} /><Metric label="Selisih pencatatan" value={`${difference.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} detail={Math.abs(difference) < 0.01 ? "Neraca demo seimbang" : "Periksa pencatatan stok, transfer, dan hasil olah"} /></CardContent></Card><FundingLog transaksi={transaksi} /></div>;
}

function FundingLog({ transaksi }: { transaksi: ReturnType<typeof useDana>["transaksi"] }) {
  return <Card><CardHeader><CardTitle>Jejak dana insentif</CardTitle><CardDescription>Penyaluran dana dan saldo warga dicatat terpisah dari perpindahan sampah.</CardDescription></CardHeader><CardContent className="space-y-2">{transaksi.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada transaksi dana.</p> : transaksi.map((item) => <div key={item.id} className="flex flex-col gap-1 rounded-lg border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{item.sumberNama} → {item.tujuanNama}</p><p className="text-muted-foreground">{item.jenis === "penyaluran" ? "Penyaluran antar jenjang" : "Saldo insentif warga"} · {formatTanggalPendek(item.tanggal)}{item.referensi ? ` · Setoran ${item.referensi}` : ""}</p></div><strong className="tabular-nums">{formatRupiah(item.jumlah)}</strong></div>)}</CardContent></Card>;
}

function IncomingTransfers({ level, id, name }: { level: JenjangPemilik; id: string; name: string }) {
  const { transfer, updateTransferById } = useTransfer();
  const { stok, updateStok } = useStok();
  const [message, setMessage] = useState("");
  const incoming = transfer.filter((item) => item.tujuanJenjang === level && item.tujuanId === id && item.status === "menunggu");

  const receive = (item: TransferMaterial, accepted: boolean) => {
    if (accepted) {
      const destinationWeight = stok.filter((row) => row.jenjang === level && row.pemilikId === id).reduce((sum, row) => sum + row.beratKg, 0);
      if (destinationWeight + item.beratKg > CAPACITY_KG[level]) {
        setMessage(`Kapasitas ${name} terlampaui. Tolak transfer agar material dapat diarahkan ke jenjang berikutnya.`);
        return;
      }
      const source = stok.find((row) => row.jenjang === item.asalJenjang && row.pemilikId === item.asalId && row.kategori === item.kategori && (row.klasifikasi ?? (row.jenjang === "desa" ? "belum_dipilah" : "dikelola")) === "dikelola");
      if (!item.reserved && (!source || source.beratKg + 0.001 < item.beratKg)) {
        setMessage("Stok asal tidak cukup; transfer tidak dapat diterima.");
        return;
      }
      const remaining = source ? source.beratKg - (item.reserved ? 0 : item.beratKg) : 0;
      const next = source ? stok.filter((row) => row.id !== source.id) : [...stok];
      if (source && remaining > 0.001) next.push({ ...source, beratKg: remaining, diperbaruiPada: new Date().toISOString() });
      const destination = stok.find((row) => row.jenjang === level && row.pemilikId === id && row.kategori === item.kategori);
      if (destination) {
        next.push({ ...destination, beratKg: destination.beratKg + item.beratKg, diperbaruiPada: new Date().toISOString() });
      } else {
        next.push({ id: generateId("st"), jenjang: level, pemilikId: id, namaPemilik: name, kategori: item.kategori, beratKg: item.beratKg, kualitas: source?.kualitas ?? item.kualitas ?? "sedang", klasifikasi: "dikelola", diperbaruiPada: new Date().toISOString() });
      }
      updateStok(next);
    } else {
      const source = stok.find((row) => row.jenjang === item.asalJenjang && row.pemilikId === item.asalId && row.kategori === item.kategori);
      if (item.reserved) {
        if (source) updateStok(stok.map((row) => row.id === source.id ? { ...row, beratKg: row.beratKg + item.beratKg, diperbaruiPada: new Date().toISOString() } : row));
        else updateStok([...stok, { id: generateId("st"), jenjang: item.asalJenjang, pemilikId: item.asalId, namaPemilik: item.asalNama, kategori: item.kategori, beratKg: item.beratKg, kualitas: item.kualitas ?? "sedang", klasifikasi: "dikelola", diperbaruiPada: new Date().toISOString() }]);
      }
    }
    updateTransferById(item.id, { status: accepted ? "diterima" : "ditolak", diterimaPada: accepted ? new Date().toISOString() : undefined });
    setMessage(accepted ? "Material diterima dan masuk ke stok." : "Transfer ditolak dan stok dikembalikan ke asal.");
  };

  return (
    <Card>
      <CardHeader><CardTitle>Transfer masuk</CardTitle><CardDescription>Periksa berat dan catatan sebelum material dimasukkan ke stok.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        {message && <p role="status" className="rounded-md bg-primary/10 p-3 text-sm text-primary">{message}</p>}
        {incoming.length === 0 ? <p className="text-sm text-muted-foreground">Tidak ada transfer yang menunggu.</p> : incoming.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm"><p className="font-medium">{item.asalNama} mengirim {HARGA_SAMPAH[item.kategori].label}</p><p className="text-muted-foreground">{item.beratKg} kg · {formatTanggalPendek(item.dibuatPada)}{item.catatan ? ` · ${item.catatan}` : ""}</p></div>
            <div className="flex gap-2"><Button size="sm" onClick={() => receive(item, true)}>Terima</Button><Button size="sm" variant="outline" onClick={() => receive(item, false)}>Tolak</Button></div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function OutgoingTransfer({ level, id, name, destination }: { level: JenjangPemilik; id: string; name: string; destination: { level: JenjangPemilik; id: string; name: string } }) {
  const { stok, updateStok } = useStok();
  const { addTransfer } = useTransfer();
  const eligible = stok.filter((row) => row.jenjang === level && row.pemilikId === id && row.beratKg > 0 && (row.klasifikasi ?? (row.jenjang === "desa" ? "belum_dipilah" : "dikelola")) === "dikelola");
  const [stockId, setStockId] = useState(eligible[0]?.id ?? "");
  const [weight, setWeight] = useState("");
  const [message, setMessage] = useState("");
  const selected = eligible.find((row) => row.id === stockId) ?? eligible[0];
  const requestedWeight = Number(weight);
  const canSubmit = !!selected && Number.isFinite(requestedWeight) && requestedWeight > 0 && requestedWeight <= selected.beratKg;

  const submit = () => {
    const kg = Number(weight);
    if (!selected || !Number.isFinite(kg) || kg <= 0 || kg > selected.beratKg) {
      setMessage("Pilih stok dan berat yang tidak melebihi jumlah tersedia.");
      return;
    }
    updateStok(stok.flatMap((row) => row.id !== selected.id ? [row] : row.beratKg - kg > 0.001 ? [{ ...row, beratKg: row.beratKg - kg, diperbaruiPada: new Date().toISOString() }] : []));
    addTransfer({ id: generateId("tr"), asalJenjang: level, asalId: id, asalNama: name, tujuanJenjang: destination.level, tujuanId: destination.id, tujuanNama: destination.name, kategori: selected.kategori, beratKg: kg, kualitas: selected.kualitas, status: "menunggu", dibuatPada: new Date().toISOString(), reserved: true });
    setMessage("Transfer dibuat. Stok dikurangi sementara sampai tujuan menerima atau menolak.");
    setWeight("");
  };

  return (
    <Card>
      <CardHeader><CardTitle>Kirim material ke {destination.name}</CardTitle><CardDescription>Stok dikunci saat dikirim dan dipulihkan bila tujuan menolak.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        {eligible.length === 0 && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Belum ada stok yang ditandai dapat dikelola. Pilah stok desa terlebih dahulu sebelum membuat transfer.</p>}
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end">
          <label className="block min-w-0 space-y-1 text-sm"><span>Stok yang dapat dikelola</span><select value={selected?.id ?? ""} onChange={(event) => { setStockId(event.target.value); setWeight(""); setMessage(""); }} disabled={eligible.length === 0} className="h-10 w-full rounded-md border bg-background px-3 disabled:opacity-60">{eligible.map((row) => <option key={row.id} value={row.id}>{HARGA_SAMPAH[row.kategori].label} ? tersedia {row.beratKg.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg</option>)}</select></label>
          <label className="block space-y-1 text-sm"><span>Berat transfer (kg)</span><input type="number" min="0.1" step="0.1" max={selected?.beratKg} value={weight} onChange={(event) => { setWeight(event.target.value); setMessage(""); }} placeholder={selected ? `Maks. ${selected.beratKg.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg` : "Pilah stok terlebih dahulu"} disabled={!selected} className="h-10 w-full rounded-md border bg-background px-3 disabled:opacity-60" /><span className="block text-[11px] text-muted-foreground">Jumlah tidak boleh melebihi stok terpilih.</span></label>
          <Button onClick={submit} disabled={!canSubmit} className="md:mb-[1.35rem]">Buat transfer</Button>
        </div>
        {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
      </CardContent>
    </Card>
  );
}

function FundingPanel({ sourceId, targetId, targetName }: { sourceId: string; targetId: string; targetName: string }) {
  const { dana, transaksi, transferDana } = useDana();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const source = dana.find((item) => item.id === sourceId);
  const target = dana.find((item) => item.id === targetId);
  const submit = () => {
    const value = Number(amount);
    const ok = transferDana(sourceId, targetId, value);
    setMessage(ok ? `${formatRupiah(value)} disalurkan ke ${targetName}.` : "Dana sumber tidak cukup atau jumlah tidak valid.");
    if (ok) setAmount("");
  };
  return (
    <Card>
      <CardHeader><CardTitle>Penyaluran dana insentif</CardTitle><CardDescription>Dana bergerak melalui BUMD → kecamatan → desa, terpisah dari transfer sampah.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2"><Metric label={source?.namaPemilik ?? "Dana asal"} value={formatRupiah(source?.saldo ?? 0)} /><Metric label={target?.namaPemilik ?? targetName} value={formatRupiah(target?.saldo ?? 0)} /></div>
        <label className="block space-y-1 text-sm"><span>Jumlah penyaluran</span><input type="number" min="1" max={source?.saldo} value={amount} onChange={(event) => setAmount(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3" /></label>
        <Button onClick={submit}>Salurkan dana</Button>{message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
        <div className="space-y-2 border-t pt-3"><p className="text-sm font-medium">Jejak dana terbaru</p>{transaksi.slice(0, 5).length === 0 ? <p className="text-xs text-muted-foreground">Belum ada transaksi dana.</p> : transaksi.slice(0, 5).map((item) => <div key={item.id} className="flex justify-between gap-3 text-xs"><span>{item.sumberNama} → {item.tujuanNama}</span><span className="shrink-0 tabular-nums">{formatRupiah(item.jumlah)}</span></div>)}</div>
      </CardContent>
    </Card>
  );
}

function MarketplacePanel({ level, ownerId, ownerName }: { level: JenjangPemilik; ownerId: string; ownerName: string }) {
  const { stok, updateStok } = useStok();
  const { listings, addListing } = useMarketplace();
  const [stockId, setStockId] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const available = stok.filter((row) => row.jenjang === level && row.pemilikId === ownerId && (row.klasifikasi ?? (row.jenjang === "desa" ? "belum_dipilah" : "dikelola")) === "dikelola");
  const selected = available.find((row) => row.id === stockId) ?? available[0];
  const myListings = listings.filter((item) => item.pemilikId === ownerId);

  const submit = () => {
    const kg = Number(weight);
    const pricePerKg = Number(price);
    if (!selected || !Number.isFinite(kg) || kg <= 0 || kg > selected.beratKg || !Number.isFinite(pricePerKg) || pricePerKg <= 0) {
      setMessage("Periksa stok, berat, dan harga per kilogram.");
      return;
    }
    updateStok(stok.flatMap((row) => row.id !== selected.id ? [row] : row.beratKg - kg > 0.001 ? [{ ...row, beratKg: row.beratKg - kg, diperbaruiPada: new Date().toISOString() }] : []));
    addListing({ id: generateId("ls"), pemilikJenjang: level, pemilikId: ownerId, pemilikNama: ownerName, kategori: selected.kategori, beratKg: kg, kualitas: selected.kualitas, hargaPerKg: pricePerKg, status: "aktif", dibuatPada: new Date().toISOString() });
    setMessage("Material dipublikasikan ke marketplace dan dikurangi dari stok tersedia.");
    setWeight(""); setPrice("");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Tawarkan material</CardTitle><CardDescription>Marketplace menampilkan jenis, berat, kualitas, lokasi, dan harga untuk calon mitra.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <label className="block space-y-1 text-sm"><span>Stok</span><select value={stockId || selected?.id || ""} onChange={(event) => setStockId(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3">{available.map((row) => <option key={row.id} value={row.id}>{HARGA_SAMPAH[row.kategori].label} · {row.beratKg} kg · {row.kualitas}</option>)}</select></label>
          <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-sm"><span>Berat (kg)</span><input type="number" min="0.1" step="0.1" max={selected?.beratKg} value={weight} onChange={(event) => setWeight(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3" /></label><label className="space-y-1 text-sm"><span>Harga per kg</span><input type="number" min="1" value={price} onChange={(event) => setPrice(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3" /></label></div>
          <Button onClick={submit} disabled={!selected}>Terbitkan penawaran</Button>{message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Penawaran material</CardTitle></CardHeader><CardContent className="space-y-2">{myListings.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada penawaran.</p> : myListings.map((item) => <ListingRow key={item.id} item={item} />)}</CardContent></Card>
    </div>
  );
}

function ListingRow({ item, children }: { item: ListingMaterial; children?: React.ReactNode }) {
  const status = { aktif: "Tersedia", dipesan: "Menunggu konfirmasi penerimaan", terjual: "Diterima mitra", ditutup: "Ditutup" }[item.status];
  return <div className="flex flex-col gap-2 rounded-lg border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{HARGA_SAMPAH[item.kategori].label} · {item.beratKg} kg · {item.kualitas}</p><p className="text-muted-foreground">{item.pemilikNama} · {formatRupiah(item.hargaPerKg)}/kg · {status}{item.pembeli ? ` · ${item.pembeli}` : ""}</p></div>{children}</div>;
}

function KecamatanDashboard() {
  const scope = SCOPE.kecamatan!;
  const { stok } = useStok();
  const { dana } = useDana();
  const totalStock = stok.filter((row) => row.jenjang === scope.level).reduce((sum, row) => sum + row.beratKg, 0);
  const fund = dana.find((item) => item.id === "dana-kecamatan");
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold">Koordinasi Kecamatan</h2><p className="text-muted-foreground">Konsolidasi stok desa, penyaluran dana, dan pengiriman ke BUMD Kabupaten.</p></div><div className="grid gap-4 sm:grid-cols-2"><Metric label="Stok terkonsolidasi" value={`${totalStock.toLocaleString("id-ID")} kg`} /><Metric label="Dana insentif tersedia" value={formatRupiah(fund?.saldo ?? 0)} /></div><StockSummary level="kecamatan" /><IncomingTransfers level={scope.level} id={scope.id} name={scope.name} /><OutgoingTransfer level={scope.level} id={scope.id} name={scope.name} destination={{ level: "kabupaten", id: "bumd-tasikmalaya", name: "BUMD Kabupaten" }} /><FundingPanel sourceId="dana-kecamatan" targetId="dana-desa" targetName="Desa Sukamanah" /></div>;
}

function BumdDashboard() {
  const scope = SCOPE.bumd!;
  const { stok } = useStok();
  const { dana } = useDana();
  const { listings } = useMarketplace();
  const totalStock = stok.filter((row) => row.jenjang === scope.level).reduce((sum, row) => sum + row.beratKg, 0);
  const activeListings = listings.filter((item) => item.status === "aktif").length;
  const fund = dana.find((item) => item.id === "dana-kabupaten");
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold">BUMD Kabupaten</h2><p className="text-muted-foreground">Penerimaan material tingkat akhir, pengelolaan dana insentif, dan penawaran ke mitra.</p></div><div className="grid gap-4 sm:grid-cols-3"><Metric label="Stok BUMD" value={`${totalStock.toLocaleString("id-ID")} kg`} /><Metric label="Penawaran aktif" value={activeListings} /><Metric label="Dana insentif kabupaten" value={formatRupiah(fund?.saldo ?? 0)} /></div><StockSummary level="kabupaten" /><IncomingTransfers level={scope.level} id={scope.id} name={scope.name} /><FundingPanel sourceId="dana-kabupaten" targetId="dana-kecamatan" targetName="Kecamatan Singaparna" /><MarketplacePanel level={scope.level} ownerId={scope.id} ownerName={scope.name} /></div>;
}

function MitraDashboard() {
  const { listings, updateListingById } = useMarketplace();
  const { pengolahan, addPengolahan } = usePengolahan();
  const [message, setMessage] = useState("");
  const [listingId, setListingId] = useState("");
  const [inputKg, setInputKg] = useState("");
  const [product, setProduct] = useState("");
  const [outputKg, setOutputKg] = useState("");
  const [residueKg, setResidueKg] = useState("");
  const [lossKg, setLossKg] = useState("");
  const [myName] = useState("Mitra Daur Ulang Priangan");
  const active = listings.filter((item) => item.status === "aktif");
  const orders = listings.filter((item) => item.status === "dipesan" && item.pembeli === myName);
  const received = listings.filter((item) => item.status === "terjual" && item.pembeli === myName);
  const selected = received.find((item) => item.id === listingId) ?? received[0];
  const alreadyProcessed = selected ? pengolahan.filter((item) => item.listingId === selected.id).reduce((sum, item) => sum + item.inputKg, 0) : 0;
  const availableInput = Math.max(0, (selected?.beratKg ?? 0) - alreadyProcessed);

  const balanceOrder = (item: ListingMaterial, accepted: boolean) => {
    updateListingById(item.id, accepted ? { status: "terjual" } : { status: "aktif", pembeli: undefined });
    setMessage(accepted ? "Penerimaan dikonfirmasi dan material masuk ke catatan mitra." : "Pesanan dilepas kembali ke marketplace.");
  };
  const order = (item: ListingMaterial) => {
    updateListingById(item.id, { status: "dipesan", pembeli: myName });
    setMessage("Penawaran dipesan. Konfirmasikan penerimaan setelah material diterima.");
  };

  const recordProcessing = () => {
    if (!selected) return setMessage("Pilih material yang telah diterima.");
    const input = Number(inputKg), output = Number(outputKg), residue = Number(residueKg), loss = Number(lossKg);
    if (![input, output, residue, loss].every(Number.isFinite) || input <= 0 || input > availableInput || output < 0 || residue < 0 || loss < 0 || Math.abs(input - output - residue - loss) > 0.01 || !product.trim()) {
      return setMessage(`Jumlah input harus tersedia (${availableInput.toFixed(1)} kg) dan input harus sama dengan produk + residu + kehilangan proses.`);
    }
    const row: CatatanPengolahan = { id: generateId("ol"), listingId: selected.id, mitra: myName, kategori: selected.kategori, inputKg: input, produk: product.trim(), outputKg: output, residuKg: residue, kehilanganKg: loss, tanggal: new Date().toISOString().slice(0, 10) };
    addPengolahan(row);
    setMessage("Hasil pengolahan tercatat; neraca massa seimbang.");
    setInputKg(""); setProduct(""); setOutputKg(""); setResidueKg(""); setLossKg("");
  };

  return <div className="space-y-6"><div><h2 className="text-2xl font-bold">Mitra Pembeli dan Pengolah</h2><p className="text-muted-foreground">Pesan material, konfirmasi penerimaan, dan laporkan hasil olah beserta residu.</p></div>{message && <p role="status" className="rounded-md bg-primary/10 p-3 text-sm text-primary">{message}</p>}<Card><CardHeader><CardTitle>Marketplace material</CardTitle><CardDescription>Penawaran berasal dari stok yang tersedia di kecamatan atau BUMD.</CardDescription></CardHeader><CardContent className="space-y-3">{active.length === 0 ? <p className="text-sm text-muted-foreground">Tidak ada penawaran aktif.</p> : active.map((item) => <ListingRow key={item.id} item={item}><Button size="sm" onClick={() => order(item)}>Pesan</Button></ListingRow>)}</CardContent></Card><Card><CardHeader><CardTitle>Konfirmasi penerimaan</CardTitle></CardHeader><CardContent className="space-y-3">{orders.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada pesanan.</p> : orders.map((item) => <ListingRow key={item.id} item={item}><Button size="sm" onClick={() => balanceOrder(item, true)}>Diterima</Button><Button size="sm" variant="outline" onClick={() => balanceOrder(item, false)}>Lepas pesanan</Button></ListingRow>)}</CardContent></Card><Card><CardHeader><CardTitle>Catat hasil pengolahan</CardTitle><CardDescription>Input = produk + residu + kehilangan proses. Input maksimal sebesar berat yang sudah diterima.</CardDescription></CardHeader><CardContent className="space-y-3"><label className="block space-y-1 text-sm"><span>Material diterima</span><select value={listingId || selected?.id || ""} onChange={(event) => setListingId(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3">{received.map((item) => <option key={item.id} value={item.id}>{HARGA_SAMPAH[item.kategori].label} · sisa {(item.beratKg - pengolahan.filter((row) => row.listingId === item.id).reduce((sum, row) => sum + row.inputKg, 0)).toFixed(1)} kg dari {item.pemilikNama}</option>)}</select></label><div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-sm"><span>Input (kg)</span><input type="number" min="0.1" step="0.1" max={availableInput} value={inputKg} onChange={(event) => setInputKg(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3" /></label><label className="space-y-1 text-sm"><span>Nama produk</span><input value={product} onChange={(event) => setProduct(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3" placeholder="Contoh: biji plastik cacah" /></label><label className="space-y-1 text-sm"><span>Produk dihasilkan (kg)</span><input type="number" min="0" step="0.1" value={outputKg} onChange={(event) => setOutputKg(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3" /></label><label className="space-y-1 text-sm"><span>Residu (kg)</span><input type="number" min="0" step="0.1" value={residueKg} onChange={(event) => setResidueKg(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3" /></label><label className="space-y-1 text-sm"><span>Kehilangan proses (kg)</span><input type="number" min="0" step="0.1" value={lossKg} onChange={(event) => setLossKg(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3" /></label></div><Button onClick={recordProcessing}>Simpan hasil olah</Button></CardContent></Card><Card><CardHeader><CardTitle>Riwayat pengolahan</CardTitle></CardHeader><CardContent className="space-y-2">{pengolahan.map((item) => <div key={item.id} className="rounded-lg border p-3 text-sm"><p className="font-medium">{item.produk} · {item.outputKg} kg</p><p className="text-muted-foreground">Input {item.inputKg} kg → residu {item.residuKg} kg → kehilangan {item.kehilanganKg} kg · {formatTanggalPendek(item.tanggal)}</p></div>)}</CardContent></Card></div>;
}

function KabupatenDashboard() {
  const { setoran } = useSetoran();
  const { stok } = useStok();
  const { listings } = useMarketplace();
  const { pengolahan } = usePengolahan();
  const totalMasuk = setoran.filter((item) => item.status === "saldo_ditambahkan" || item.status === "selesai").reduce((sum, item) => sum + item.items.reduce((s, line) => s + line.berat, 0), 0);
  const totalStok = stok.reduce((sum, item) => sum + item.beratKg, 0);
  const totalDikirim = listings.filter((item) => item.status === "terjual").reduce((sum, item) => sum + item.beratKg, 0);
  const totalDiolah = pengolahan.reduce((sum, item) => sum + item.inputKg, 0);
  const totalProduk = pengolahan.reduce((sum, item) => sum + item.outputKg, 0);
  const totalResidu = pengolahan.reduce((sum, item) => sum + item.residuKg, 0);
  const totalHilang = pengolahan.reduce((sum, item) => sum + item.kehilanganKg, 0);
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold">Dashboard Kabupaten</h2><p className="text-muted-foreground">Pemantauan berjenjang dan neraca massa material. Data ini ilustrasi, belum menggantikan pelaporan operasional resmi.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Material dari setoran disetujui" value={`${totalMasuk.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} /><Metric label="Stok saat ini" value={`${totalStok.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} /><Metric label="Terkirim ke mitra" value={`${totalDikirim.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} /><Metric label="Input pengolahan tercatat" value={`${totalDiolah.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} /></div><Card><CardHeader><CardTitle>Neraca hasil pengolahan</CardTitle><CardDescription>Jumlah material yang diolah diurai menjadi produk, residu, dan kehilangan proses.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3"><Metric label="Produk dimanfaatkan" value={`${totalProduk.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} /><Metric label="Residu akhir" value={`${totalResidu.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} /><Metric label="Kehilangan proses tercatat" value={`${totalHilang.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} /></CardContent></Card><StockSummary /><TransferLog /><MarketLog /></div>;
}

function TransferLog() {
  const { transfer } = useTransfer();
  return <Card><CardHeader><CardTitle>Jejak perpindahan material</CardTitle><CardDescription>Setiap transfer menunjukkan asal, tujuan, berat, waktu, dan status penerimaan.</CardDescription></CardHeader><CardContent className="space-y-2">{transfer.map((item) => <div key={item.id} className="flex flex-col gap-1 rounded-lg border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{item.asalNama} → {item.tujuanNama}</p><p className="text-muted-foreground">{HARGA_SAMPAH[item.kategori].label} · {item.beratKg} kg · {formatTanggalPendek(item.dibuatPada)}</p></div><Badge variant={item.status === "diterima" ? "default" : item.status === "ditolak" ? "destructive" : "secondary"}>{item.status}</Badge></div>)}</CardContent></Card>;
}

function MarketLog() {
  const { listings } = useMarketplace();
  return <Card><CardHeader><CardTitle>Penyaluran marketplace</CardTitle><CardDescription>Material yang sudah dipesan dan diterima mitra.</CardDescription></CardHeader><CardContent className="space-y-2">{listings.map((item) => <ListingRow key={item.id} item={item} />)}</CardContent></Card>;
}
