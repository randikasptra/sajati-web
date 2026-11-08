"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActiveRole } from "@/lib/store";
import {
  sortStock, createTransfer, processTransfer, publishListing, confirmPayment,
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

export function NetworkPage({ role, activeNav }: { role: ActiveRole; activeNav: string }) {
  const feature=activeNav.split("/")[2];
  const scope=SCOPE[role];
  if(feature === "wilayah") return <OperationalOverview />;
  if(feature === "laporan") return <div className="space-y-4"><StockSummary /><TransferLog /><MarketLog /></div>;
  if(scope && feature === "stok") return <div className="space-y-4"><StockSummary level={scope.level} /><StockSortingPanel level={scope.level} ownerId={scope.id} /></div>;
  if(scope && feature === "transfer") return <div className="space-y-4"><IncomingTransfers level={scope.level} id={scope.id} name={scope.name} />{role === "kecamatan" && <OutgoingTransfer level={scope.level} id={scope.id} name={scope.name} destination={{level:"kabupaten",id:"bumd-tasikmalaya",name:"BUMD Kabupaten"}} />}<TransferLog /></div>;
  if(feature === "dana" && scope) return <FundingPanel sourceId={role === "kecamatan" ? "dana-kecamatan" : "dana-kabupaten"} targetId={role === "kecamatan" ? "dana-desa" : "dana-kecamatan"} targetName={role === "kecamatan" ? "Desa Sukamanah" : "Kecamatan Singaparna"} />;
  if(role === "bumd" && feature === "marketplace") return <MarketplacePanel level="kabupaten" ownerId="bumd-tasikmalaya" ownerName="BUMD Kabupaten" />;
  if (role === "kecamatan") return <KecamatanDashboard />;
  if (role === "bumd") return <BumdDashboard />;
  if (role === "mitra") return <MitraDashboard />;
  return <KabupatenDashboard />;
}

export function VillageStockPanel() {
  return <div className="space-y-4"><div><h2 className="text-2xl font-bold">Stok dan pemilahan desa</h2><p className="text-muted-foreground">Hasil timbang masuk stok fisik; stok dikunci sampai nilai disahkan. Pilah material dari daftar stok ini sebelum memilih jalur pengelolaannya.</p></div><StockSortingPanel /><StockSummary level="desa" /><OutgoingTransfer level="desa" id="desa-sukamanah" name="Desa Sukamanah" destination={{ level: "kecamatan", id: "kec-singaparna", name: "Kecamatan Singaparna" }} /></div>;
}

function StockSortingPanel({ level = "desa", ownerId = "desa-sukamanah" }: { level?: JenjangPemilik; ownerId?: string }) {
  const { stok } = useStok();
  const [selected, setSelected] = useState("");
  const [weight, setWeight] = useState("");
  const [classification, setClassification] = useState<"dikelola" | "tidak_dikelola" | "residu">("dikelola");
  const [message, setMessage] = useState("");
  const rows = stok.filter(r => r.jenjang === level && r.pemilikId === ownerId && r.beratKg > 0);
  const labels = { belum_dipilah: "Belum dipilah", dikelola: "Dapat dikelola", tidak_dikelola: "Perlu pengelola lanjutan", residu: "Residu - menunggu penanganan akhir" };
  const save = () => { try { sortStock(selected, Number(weight), classification); setSelected(""); setWeight(""); setMessage("Pemilahan tersimpan. Total berat tetap sama."); } catch(error) { setMessage((error as Error).message); } };
  return <Card><CardHeader><CardTitle>Pilah stok tercatat</CardTitle><CardDescription>Pilah seluruh atau sebagian berat. Material untuk pengelola lanjutan dapat diteruskan; residu tetap tercatat untuk penanganan akhir.</CardDescription></CardHeader><CardContent className="space-y-3">
    {rows.length === 0 && <p>Belum ada stok untuk dipilah.</p>}
    {rows.map(row => <div key={row.id} className="rounded-xl border p-3"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold">{HARGA_SAMPAH[row.kategori].label} - {row.beratKg.toLocaleString("id-ID")} kg</p><p className="text-xs text-muted-foreground">Kualitas {row.kualitas} - {row.terkunci ? "Menunggu verifikasi / pengesahan" : labels[row.klasifikasi ?? "belum_dipilah"]}</p></div><Button size="sm" disabled={row.terkunci} onClick={()=>{setSelected(row.id);setWeight(String(row.beratKg));}}>Pilah</Button></div>
    {selected===row.id && <div className="mt-3 grid gap-2 sm:grid-cols-3"><label className="text-sm">Berat yang dipilah (kg)<input aria-label="Berat yang dipilah" className="h-10 w-full rounded border px-3" type="number" min="0.1" step="0.1" max={row.beratKg} value={weight} onChange={e=>setWeight(e.target.value)} /></label><label className="text-sm">Hasil pemilahan<select className="h-10 w-full rounded border px-3" value={classification} onChange={e=>setClassification(e.target.value as typeof classification)}><option value="dikelola">Dapat dikelola</option><option value="tidak_dikelola">Perlu pengelola lanjutan</option><option value="residu">Residu</option></select></label><Button className="self-end" onClick={save}>Simpan pemilahan</Button></div>}</div>)}
    {message && <p role="status" className="text-sm">{message}</p>}
  </CardContent></Card>;
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
        residue: items.filter(row=>row.klasifikasi === "residu").reduce((sum,row)=>sum+row.beratKg,0),
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
              <div><span className="font-medium">{HARGA_SAMPAH[row.kategori].label}</span><p className="text-xs text-muted-foreground">{row.manageable.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg dikelola · {row.pending.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg belum dipilah · {row.rejected.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg perlu pengelola lanjutan ? {row.residue.toLocaleString("id-ID")} kg residu</p></div><strong className="tabular-nums">{row.kg.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg</strong>
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
  const transitWeight = transfer.filter((item) => (item.status === "menunggu" || item.status === "dikirim") && item.reserved).reduce((sum, item) => sum + item.beratKg, 0);
  const activeWeight = listings.filter((item) => item.status === "aktif").reduce((sum, item) => sum + item.beratKg, 0);
  const orderedWeight = listings.filter((item) => item.status === "dipesan").reduce((sum, item) => sum + item.beratKg, 0);
  const soldWeight = listings.filter((item) => item.status === "terjual").reduce((sum, item) => sum + item.beratKg, 0);
  const processedWeight = pengolahan.reduce((sum, item) => sum + item.inputKg, 0);
  const outputWeight = pengolahan.reduce((sum, item) => sum + item.outputKg + item.residuKg + item.kehilanganKg, 0);
  const accounted = stockWeight + transitWeight + activeWeight + orderedWeight + Math.max(0, soldWeight - processedWeight) + outputWeight;
  const receivedPending = setoran.filter(s => s.stokTercatat && s.status !== "saldo_ditambahkan" && s.status !== "selesai").reduce((a,s)=>a+s.items.reduce((n,i)=>n+i.berat,0),0);
  const transferLoss = transfer.filter(t=>t.status === "diterima").reduce((a,t)=>a+t.beratKg-(t.beratDiterima??t.beratKg),0);
  const expected = MOCK_STOK_AWAL_KG + approvedWeight + receivedPending - transferLoss;
  const difference = expected - accounted;
  return <div className="space-y-4"><Card><CardHeader><CardTitle>Neraca massa</CardTitle><CardDescription>Membandingkan stok awal dan setoran disetujui dengan stok, transfer, marketplace, serta hasil olah yang tercatat.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3"><Metric label="Material terukur" value={`${accounted.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} /><Metric label="Material yang seharusnya tercatat" value={`${expected.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} detail={`Stok awal ${MOCK_STOK_AWAL_KG.toLocaleString("id-ID")} kg + setoran disetujui ${approvedWeight.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg + stok menunggu ${receivedPending.toLocaleString("id-ID")} kg - selisih transfer ${transferLoss.toLocaleString("id-ID")} kg`} /><Metric label="Selisih pencatatan" value={`${difference.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} detail={Math.abs(difference) < 0.01 ? "Neraca seimbang" : "Periksa pencatatan stok, transfer, dan hasil olah"} /></CardContent></Card><FundingLog transaksi={transaksi} /></div>;
}

function FundingLog({ transaksi }: { transaksi: ReturnType<typeof useDana>["transaksi"] }) {
  return <Card><CardHeader><CardTitle>Jejak dana insentif</CardTitle><CardDescription>Penyaluran dana dan saldo warga dicatat terpisah dari perpindahan sampah.</CardDescription></CardHeader><CardContent className="space-y-2">{transaksi.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada transaksi dana.</p> : transaksi.map((item) => <div key={item.id} className="flex flex-col gap-1 rounded-lg border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{item.sumberNama} → {item.tujuanNama}</p><p className="text-muted-foreground">{item.jenis === "penyaluran" ? "Penyaluran antar jenjang" : item.jenis === "penjualan" ? "Pembayaran material" : "Saldo insentif warga"} · {formatTanggalPendek(item.tanggal)}{item.referensi ? ` · Setoran ${item.referensi}` : ""}</p></div><strong className="tabular-nums">{formatRupiah(item.jumlah)}</strong></div>)}</CardContent></Card>;
}

function IncomingTransfers({ level, id }: { level: JenjangPemilik; id: string; name: string }) {
  const { transfer } = useTransfer();
  const [message,setMessage]=useState("");
  const [weights,setWeights]=useState<Record<string,string>>({});
  const [reasons,setReasons]=useState<Record<string,string>>({});
  const incoming=transfer.filter(r=>r.tujuanJenjang===level && r.tujuanId===id && ["menunggu","dikirim"].includes(r.status));
  const act=(item:TransferMaterial, action:"terima"|"tolak")=>{try{processTransfer(item.id,action,Number(weights[item.id]??item.beratKg),reasons[item.id]??"");setMessage(action==="terima"?"Penerimaan tercatat. Pilah material yang masuk.":"Penolakan tercatat; stok dipulihkan ke asal.");}catch(error){setMessage((error as Error).message);}};
  return <Card><CardHeader><CardTitle>Transfer masuk</CardTitle><CardDescription>Catat hasil timbang penerimaan. Selisih dan penolakan harus disertai alasan.</CardDescription></CardHeader><CardContent className="space-y-3">
    {!incoming.length && <p className="text-sm text-muted-foreground">Tidak ada transfer yang menunggu.</p>}
    {incoming.map(item=><div key={item.id} className="space-y-3 rounded-xl border p-3"><p className="font-semibold">{item.asalNama} - {HARGA_SAMPAH[item.kategori].label} - {item.beratKg} kg</p><Badge>{item.status === "menunggu" ? "Menunggu keberangkatan" : "Dalam perjalanan"}</Badge><div className="grid gap-2 sm:grid-cols-2"><label className="text-sm">Berat diterima (kg)<input type="number" min="0.1" step="0.1" max={item.beratKg} className="h-10 w-full rounded border px-3" value={weights[item.id]??item.beratKg} onChange={e=>setWeights({...weights,[item.id]:e.target.value})}/></label><label className="text-sm">Alasan selisih / penolakan<input className="h-10 w-full rounded border px-3" value={reasons[item.id]??""} onChange={e=>setReasons({...reasons,[item.id]:e.target.value})}/></label></div><div className="flex gap-2"><Button disabled={item.status!=="dikirim"} onClick={()=>act(item,"terima")}>Terima material</Button><Button variant="outline" onClick={()=>act(item,"tolak")}>Tolak</Button></div></div>)}
    {message && <p role="status">{message}</p>}
  </CardContent></Card>;
}

function OutgoingTransfer({ level, id, destination }: { level: JenjangPemilik; id: string; name: string; destination: { level: JenjangPemilik; id: string; name: string } }) {
  const { stok } = useStok();
  const { transfer } = useTransfer();
  const eligible = stok.filter((row) => row.jenjang === level && row.pemilikId === id && row.beratKg > 0 && !row.terkunci && ["dikelola", "tidak_dikelola"].includes(row.klasifikasi ?? ""));
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
    try { createTransfer(selected.id, kg, destination); setMessage("Pengiriman diajukan dan stok dialokasikan. Konfirmasi saat kendaraan berangkat."); }
    catch(error) { setMessage((error as Error).message); return; }
    setWeight("");
  };

  return (
    <Card>
      <CardHeader><CardTitle>Kirim material ke {destination.name}</CardTitle><CardDescription>Stok dikunci saat dikirim dan dipulihkan bila tujuan menolak.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        {eligible.length === 0 && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Belum ada material siap disalurkan. Selesaikan pengesahan dan pemilahan stok terlebih dahulu.</p>}
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end">
          <label className="block min-w-0 space-y-1 text-sm"><span>Material siap disalurkan</span><select value={selected?.id ?? ""} onChange={(event) => { setStockId(event.target.value); setWeight(""); setMessage(""); }} disabled={eligible.length === 0} className="h-10 w-full rounded-md border bg-background px-3 disabled:opacity-60">{eligible.map((row) => <option key={row.id} value={row.id}>{HARGA_SAMPAH[row.kategori].label} - tersedia {row.beratKg.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg</option>)}</select></label>
          <label className="block space-y-1 text-sm"><span>Berat transfer (kg)</span><input type="number" min="0.1" step="0.1" max={selected?.beratKg} value={weight} onChange={(event) => { setWeight(event.target.value); setMessage(""); }} placeholder={selected ? `Maks. ${selected.beratKg.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg` : "Pilah stok terlebih dahulu"} disabled={!selected} className="h-10 w-full rounded-md border bg-background px-3 disabled:opacity-60" /><span className="block text-[11px] text-muted-foreground">Jumlah tidak boleh melebihi stok terpilih.</span></label>
          <Button onClick={submit} disabled={!canSubmit} className="md:mb-[1.35rem]">Buat transfer</Button>
        </div>
        {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
        {transfer.filter(t=>t.asalId===id && t.status==="menunggu").map(t=><div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded border p-3"><span>{HARGA_SAMPAH[t.kategori].label} - {t.beratKg} kg - Menunggu keberangkatan</span><Button size="sm" onClick={()=>{try{processTransfer(t.id,"kirim");setMessage("Keberangkatan tercatat.");}catch(error){setMessage((error as Error).message);}}}>Konfirmasi dikirim</Button></div>)}
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

function MarketplacePanel({ level, ownerId }: { level: JenjangPemilik; ownerId: string; ownerName: string }) {
  const { stok } = useStok();
  const { listings } = useMarketplace();
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
    try { publishListing(selected.id, kg, pricePerKg); } catch(error) {setMessage((error as Error).message);return;}
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
      <Card><CardHeader><CardTitle>Penawaran material</CardTitle></CardHeader><CardContent className="space-y-2">{myListings.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada penawaran.</p> : myListings.map((item) => <ListingRow key={item.id} item={item}>{item.status === "terjual" && item.pembayaran !== "lunas" && <Button size="sm" onClick={()=>{try{confirmPayment(item.id);setMessage("Pembayaran diterima dan dicatat ke dana BUMD.");}catch(error){setMessage((error as Error).message);}}}>Catat pembayaran diterima</Button>}</ListingRow>)}</CardContent></Card>
    </div>
  );
}

function ListingRow({ item, children }: { item: ListingMaterial; children?: React.ReactNode }) {
  const status = { aktif: "Tersedia", dipesan: "Menunggu konfirmasi penerimaan", terjual: "Diterima mitra", ditutup: "Ditutup" }[item.status];
  return <div className="flex flex-col gap-2 rounded-lg border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{HARGA_SAMPAH[item.kategori].label} · {item.beratKg} kg · {item.kualitas}</p><p className="text-muted-foreground">{item.pemilikNama} · {formatRupiah(item.hargaPerKg)}/kg · {status}{item.pembeli ? ` · ${item.pembeli}` : ""}</p></div>{item.status === "terjual" && <Badge variant="outline">{item.pembayaran === "lunas" ? "Lunas" : "Belum dibayar"}</Badge>}{children}</div>;
}

function KecamatanDashboard() {
  const scope = SCOPE.kecamatan!;
  const { stok } = useStok();
  const { dana } = useDana();
  const totalStock = stok.filter((row) => row.jenjang === scope.level).reduce((sum, row) => sum + row.beratKg, 0);
  const fund = dana.find((item) => item.id === "dana-kecamatan");
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold">Koordinasi Kecamatan</h2><p className="text-muted-foreground">Konsolidasi stok desa, penyaluran dana, dan pengiriman ke BUMD Kabupaten.</p></div><div className="grid gap-4 sm:grid-cols-2"><Metric label="Stok terkonsolidasi" value={`${totalStock.toLocaleString("id-ID")} kg`} /><Metric label="Dana insentif tersedia" value={formatRupiah(fund?.saldo ?? 0)} /></div><OperationalOverview /></div>;
}

function BumdDashboard() {
  const scope = SCOPE.bumd!;
  const { stok } = useStok();
  const { dana } = useDana();
  const { listings } = useMarketplace();
  const totalStock = stok.filter((row) => row.jenjang === scope.level).reduce((sum, row) => sum + row.beratKg, 0);
  const activeListings = listings.filter((item) => item.status === "aktif").length;
  const fund = dana.find((item) => item.id === "dana-kabupaten");
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold">BUMD Kabupaten</h2><p className="text-muted-foreground">Penerimaan material tingkat akhir, pengelolaan dana insentif, dan penawaran ke mitra.</p></div><div className="grid gap-4 sm:grid-cols-3"><Metric label="Stok BUMD" value={`${totalStock.toLocaleString("id-ID")} kg`} /><Metric label="Penawaran aktif" value={activeListings} /><Metric label="Dana insentif kabupaten" value={formatRupiah(fund?.saldo ?? 0)} /></div><OperationalOverview /></div>;
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
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold">Dashboard Kabupaten</h2><p className="text-muted-foreground">Pemantauan berjenjang dan neraca massa material. Pantau kapasitas, penyaluran, dan hasil pengolahan setiap wilayah.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Material dari setoran disetujui" value={`${totalMasuk.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} /><Metric label="Stok saat ini" value={`${totalStok.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} /><Metric label="Terkirim ke mitra" value={`${totalDikirim.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} /><Metric label="Input pengolahan tercatat" value={`${totalDiolah.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} /></div><Card><CardHeader><CardTitle>Neraca hasil pengolahan</CardTitle><CardDescription>Jumlah material yang diolah diurai menjadi produk, residu, dan kehilangan proses.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3"><Metric label="Produk dimanfaatkan" value={`${totalProduk.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} /><Metric label="Residu akhir" value={`${totalResidu.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} /><Metric label="Kehilangan proses tercatat" value={`${totalHilang.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`} /></CardContent></Card><OperationalOverview /><StockSummary /><TransferLog /><MarketLog /></div>;
}

function TransferLog() {
  const { transfer } = useTransfer();
  return <Card><CardHeader><CardTitle>Jejak perpindahan material</CardTitle><CardDescription>Setiap transfer menunjukkan asal, tujuan, berat, waktu, dan status penerimaan.</CardDescription></CardHeader><CardContent className="space-y-2">{transfer.map((item) => <div key={item.id} className="flex flex-col gap-1 rounded-lg border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{item.asalNama} → {item.tujuanNama}</p><p className="text-muted-foreground">{HARGA_SAMPAH[item.kategori].label} · {item.beratKg} kg · {formatTanggalPendek(item.dibuatPada)}</p><p className="text-xs text-muted-foreground">{item.beratDiterima !== undefined ? `Diterima ${item.beratDiterima} kg. ` : ""}{item.alasanSelisih || item.alasanTolak}</p></div><Badge variant={item.status === "diterima" ? "default" : item.status === "ditolak" ? "destructive" : "secondary"}>{item.status}</Badge></div>)}</CardContent></Card>;
}

function MarketLog() {
  const { listings } = useMarketplace();
  return <Card><CardHeader><CardTitle>Penyaluran marketplace</CardTitle><CardDescription>Material yang sudah dipesan dan diterima mitra.</CardDescription></CardHeader><CardContent className="space-y-2">{listings.map((item) => <ListingRow key={item.id} item={item} />)}</CardContent></Card>;
}

function OperationalOverview() {
 const {stok}=useStok(); const {transfer}=useTransfer(); const {dana}=useDana(); const {setoran}=useSetoran();
 const owners=[...new Map(stok.map(s=>[s.pemilikId,{id:s.pemilikId,name:s.namaPemilik,level:s.jenjang}])).values()];
 return <Card><CardHeader><CardTitle>Perhatian wilayah</CardTitle><CardDescription>Kapasitas, pengiriman, dana, dan residu yang perlu ditindaklanjuti.</CardDescription></CardHeader><CardContent className="space-y-3">{owners.map(owner=>{const total=stok.filter(s=>s.pemilikId===owner.id).reduce((a,s)=>a+s.beratKg,0);return <div key={owner.id} className="rounded border p-3 text-sm"><strong>{owner.name}</strong><p>{total.toLocaleString("id-ID")} / {CAPACITY_KG[owner.level].toLocaleString("id-ID")} kg {total>=CAPACITY_KG[owner.level]*0.8?"? mendekati penuh: jadwalkan penyaluran":"? kapasitas tersedia"}</p></div>;})}<p className="text-sm">{transfer.filter(t=>["menunggu","dikirim"].includes(t.status)).length} pengiriman belum selesai ? {transfer.filter(t=>t.status==="ditolak").length} pengiriman ditolak</p><p className="text-sm">Residu menunggu penanganan: {stok.filter(s=>s.klasifikasi==="residu").reduce((a,s)=>a+s.beratKg,0).toLocaleString("id-ID")} kg</p><p className="text-sm">Selisih penerimaan: {transfer.filter(t=>t.status==="diterima").reduce((a,t)=>a+t.beratKg-(t.beratDiterima??t.beratKg),0).toLocaleString("id-ID")} kg - lihat jejak transfer.</p>{dana.map(d=><p key={d.id} className="text-sm">{d.namaPemilik}: {formatRupiah(d.saldo)} {d.id==="dana-desa" && d.saldo<setoran.filter(s=>s.status==="terverifikasi").reduce((a,s)=>a+s.totalNilai,0)?"? dana belum cukup untuk antrean pengesahan":""}</p>)}</CardContent></Card>;
}
