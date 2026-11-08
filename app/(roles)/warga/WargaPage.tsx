"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Wallet,
  ArrowUpRight,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  ShoppingCart,
  Plus,
  Minus,
  Leaf,
  Truck,
  MessageCircle,
} from "lucide-react";
import {
  HARGA_SAMPAH,
  STATUS_SETORAN_LABEL,
  STATUS_PENUKARAN_LABEL,
  type KategoriSampah,
  type PenukaranItem,
} from "@/data/mock";
import { useSetoran, useWarga, usePenukaran, usePenjemputan, usePengaduan, useKatalog } from "@/lib/store";
import { formatRupiah, formatBerat, formatTanggalPendek, generateId } from "@/lib/utils";

const WARGA_ID = "w1";
const CATEGORY_KEYS = Object.keys(HARGA_SAMPAH) as KategoriSampah[];

function statusVariant(color: string): "default" | "secondary" | "destructive" | "outline" {
  if (color === "green") return "default";
  if (color === "red") return "destructive";
  if (color === "blue" || color === "amber" || color === "orange") return "secondary";
  return "outline";
}

export function WargaPage({
  activeNav,
  onNavChange,
}: {
  activeNav: string;
  onNavChange: (href: string) => void;
}) {
  const [wargaId, setWargaId] = useState(WARGA_ID);
  const { wargaList } = useWarga();
  const tab = activeNav === "/riwayat" ? "riwayat" : activeNav === "/tukar" ? "tukar" : activeNav === "/setor" ? "setor" : activeNav === "/panduan" ? "panduan" : "beranda";
  return (
    <div className="space-y-4">
    <label className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
      <span>Akun warga demo</span>
      <select value={wargaId} onChange={(event) => setWargaId(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground sm:max-w-xs">
        {wargaList.map((warga) => <option key={warga.id} value={warga.id}>{warga.nama} · {warga.desa}</option>)}
      </select>
    </label>
    <Tabs value={tab} onValueChange={(value) => onNavChange(value === "riwayat" ? "/riwayat" : value === "tukar" ? "/tukar" : value === "setor" ? "/setor" : value === "panduan" ? "/panduan" : "/")} className="space-y-4">
      <TabsList className="hidden md:inline-flex">
        <TabsTrigger value="beranda">Beranda</TabsTrigger>
        <TabsTrigger value="riwayat">Riwayat</TabsTrigger>
        <TabsTrigger value="setor">Setor / Jemput</TabsTrigger>
        <TabsTrigger value="tukar">Tukar Barang</TabsTrigger>
        <TabsTrigger value="panduan">Panduan</TabsTrigger>
      </TabsList>
      <TabsContent value="beranda"><WargaBeranda wargaId={wargaId} /></TabsContent>
      <TabsContent value="riwayat"><WargaRiwayat wargaId={wargaId} /></TabsContent>
      <TabsContent value="setor"><WargaLayanan wargaId={wargaId} /></TabsContent>
      <TabsContent value="tukar"><WargaTukar wargaId={wargaId} /></TabsContent>
      <TabsContent value="panduan"><WargaPanduan /></TabsContent>
    </Tabs>
    </div>
  );
}

// ---------- Beranda ----------
function WargaBeranda({ wargaId }: { wargaId: string }) {
  const { setoran } = useSetoran();
  const { getWarga } = useWarga();
  const warga = getWarga(wargaId);

  const mySetoran = useMemo(
    () => setoran.filter((s) => s.wargaId === wargaId),
    [setoran, wargaId]
  );
  const totalBerat = useMemo(
    () =>
      mySetoran
        .filter((s) => s.status === "saldo_ditambahkan" || s.status === "selesai")
        .reduce((sum, s) => sum + s.items.reduce((is2, i) => is2 + i.berat, 0), 0),
    [mySetoran]
  );
  const pending = mySetoran.filter(
    (s) =>
      s.status === "menunggu_verifikasi" ||
      s.status === "terverifikasi" ||
      s.status === "perlu_persetujuan"
  ).length;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{warga?.nama ?? "Warga"}</h2>
        <p className="text-sm text-muted-foreground">
          RT {warga?.rt}/RW {warga?.rw}, Desa {warga?.desa}, Kec. {warga?.kecamatan}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <Card size="sm" className="sm:[--card-spacing:--spacing(4)]">
          <CardHeader className="flex flex-row items-center justify-between px-3 pb-1 sm:px-4 sm:pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
              Saldo Manfaat
            </CardTitle>
            <Wallet className="size-3.5 shrink-0 text-muted-foreground sm:size-4" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="text-xl font-bold sm:text-2xl">{formatRupiah(warga?.saldo ?? 0)}</div>
            <p className="mt-1 text-[10px] leading-tight text-muted-foreground sm:text-xs">
              Saldo simulasi — dapat ditukarkan di Kopdes
            </p>
          </CardContent>
        </Card>
        <Card size="sm" className="sm:[--card-spacing:--spacing(4)]">
          <CardHeader className="flex flex-row items-center justify-between px-3 pb-1 sm:px-4 sm:pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
              Total Sampah Disetor
            </CardTitle>
            <TrendingUp className="size-3.5 shrink-0 text-muted-foreground sm:size-4" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="text-xl font-bold sm:text-2xl">{formatBerat(totalBerat)}</div>
            <p className="mt-1 text-[10px] leading-tight text-muted-foreground sm:text-xs">
              dari {mySetoran.filter((s) => s.status === "saldo_ditambahkan" || s.status === "selesai").length} setoran disetujui
            </p>
          </CardContent>
        </Card>
        <Card size="sm" className="sm:[--card-spacing:--spacing(4)]">
          <CardHeader className="flex flex-row items-center justify-between px-3 pb-1 sm:px-4 sm:pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
              Dalam Proses
            </CardTitle>
            <Clock className="size-3.5 shrink-0 text-muted-foreground sm:size-4" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="text-xl font-bold sm:text-2xl">{pending}</div>
            <p className="mt-1 text-[10px] leading-tight text-muted-foreground sm:text-xs">
              setoran menunggu verifikasi/persetujuan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Setoran terbaru */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Setoran Terbaru</CardTitle>
          <CardDescription>3 setoran terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          {mySetoran.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Package className="size-8 mx-auto mb-2 opacity-50" />
              Belum ada setoran
            </div>
          ) : (
            <div className="space-y-3">
              {mySetoran.slice(0, 3).map((s) => {
                const statusInfo = STATUS_SETORAN_LABEL[s.status];
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <ArrowUpRight className="size-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {s.items.map((i) => HARGA_SAMPAH[i.kategori].label).join(", ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTanggalPendek(s.tanggal)} · {s.items.reduce((a, i) => a + i.berat, 0).toFixed(1)} kg
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatRupiah(s.totalNilai)}
                      </p>
                      <Badge variant={statusVariant(statusInfo.color)} className="text-[10px] mt-1">
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panduan Pilah */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Leaf className="size-4 text-primary" />
            <CardTitle className="text-base">Panduan Pilah Sampah</CardTitle>
          </div>
          <CardDescription>Kategori sampah dan harga estimasi per kg</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.entries(HARGA_SAMPAH) as [KategoriSampah, (typeof HARGA_SAMPAH)[KategoriSampah]][]).map(
              ([key, val]) => (
                <div
                  key={key}
                  className="flex items-center gap-2.5 rounded-lg border p-2.5 text-sm"
                >
                  <span className="text-base" aria-hidden="true">{val.icon}</span>
                  <div>
                    <p className="font-medium leading-none">{val.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatRupiah(val.hargaPerKg)}/kg
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Riwayat ----------
function WargaRiwayat({ wargaId }: { wargaId: string }) {
  const { setoran } = useSetoran();
  const { penukaran } = usePenukaran();
  const mySetoran = useMemo(() => setoran.filter((s) => s.wargaId === wargaId), [setoran, wargaId]);
  const myPenukaran = useMemo(() => penukaran.filter((p) => p.wargaId === wargaId), [penukaran, wargaId]);

  return (
    <Tabs defaultValue="setoran" className="space-y-4">
      <TabsList>
        <TabsTrigger value="setoran">Setoran ({mySetoran.length})</TabsTrigger>
        <TabsTrigger value="penukaran">Penukaran ({myPenukaran.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="setoran">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Riwayat Setoran</CardTitle>
            <CardDescription>Seluruh riwayat setor sampah</CardDescription>
          </CardHeader>
          <CardContent>
            {mySetoran.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Belum ada setoran</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Berat</TableHead>
                    <TableHead className="text-right">Nilai</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mySetoran.map((s) => {
                    const statusInfo = STATUS_SETORAN_LABEL[s.status];
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                          {formatTanggalPendek(s.tanggal)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {s.items.map((item, idx) => (
                              <Badge key={idx} variant="outline" className="text-[10px]">
                                {HARGA_SAMPAH[item.kategori].icon} {HARGA_SAMPAH[item.kategori].label}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatBerat(s.items.reduce((a, i) => a + i.berat, 0))}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatRupiah(s.totalNilai)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(statusInfo.color)} className="text-[10px]">
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="penukaran">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Riwayat Penukaran</CardTitle>
            <CardDescription>Penukaran saldo ke barang kebutuhan pokok</CardDescription>
          </CardHeader>
          <CardContent>
            {myPenukaran.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Belum ada penukaran</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Barang</TableHead>
                    <TableHead className="text-right">Nilai</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myPenukaran.map((p) => {
                    const statusInfo = STATUS_PENUKARAN_LABEL[p.status];
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                          {formatTanggalPendek(p.tanggal)}
                        </TableCell>
                        <TableCell>
                          {p.items.map((i) => `${i.namaBarang} ×${i.jumlah}`).join(", ")}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatRupiah(p.totalNilai)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(statusInfo.color)} className="text-[10px]">
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// ---------- Setor, jadwal keliling, dan pengaduan ----------
function WargaLayanan({ wargaId }: { wargaId: string }) {
  const { penjemputan, addPenjemputan } = usePenjemputan();
  const { pengaduan, addPengaduan } = usePengaduan();
  const [metode, setMetode] = useState<"antar" | "keliling">("antar");
  const [tanggal, setTanggal] = useState("");
  const [titikKeliling, setTitikKeliling] = useState("");
  const [kategori, setKategori] = useState<KategoriSampah[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const wargaRequests = penjemputan.filter((item) => item.wargaId === wargaId);
  const wargaComplaints = pengaduan.filter((item) => item.wargaId === wargaId);
  const toggleCategory = (value: KategoriSampah) => setKategori((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);

  const submitRequest = () => {
    if (!tanggal || kategori.length === 0 || (metode === "keliling" && !titikKeliling)) {
      setFeedback("Pilih jadwal setor dan jenis sampah. Untuk setor keliling, pilih rute yang tersedia.");
      return;
    }
    const routeLabel = titikKeliling === "barat" ? "Rute Sukamanah Barat · Lapang Desa · 08.00–10.00" : "Rute Sukamanah Timur · Balai RW 05 · 10.30–12.00";
    addPenjemputan({ id: generateId("jm"), wargaId, tanggalJemput: tanggal, metode, alamat: metode === "keliling" ? routeLabel : "Titik setor Desa Sukamanah", kategori, status: "diajukan", createdAt: new Date().toISOString() });
    setKategori([]); setTanggal(""); setTitikKeliling("");
    setFeedback(metode === "keliling" ? "Kamu terdaftar pada jadwal setor keliling. Bawa sampah ke titik kumpul sesuai rute dan waktu." : "Jadwal setor tercatat. Petugas desa akan memverifikasi saat sampah diterima.");
  };
  const submitComplaint = () => {
    if (!subject.trim() || !message.trim()) {
      setFeedback("Isi subjek dan pesan pengaduan terlebih dahulu.");
      return;
    }
    addPengaduan({ id: generateId("pg"), wargaId, subjek: subject.trim(), pesan: message.trim(), status: "baru", dibuatPada: new Date().toISOString() });
    setSubject(""); setMessage("");
    setFeedback("Pengaduan tersimpan dan masuk ke antrean pengelola desa.");
  };

  return <div className="grid gap-4 xl:grid-cols-2">
    <div className="space-y-4">
      <Card><CardHeader><CardTitle>Ajukan setor sampah</CardTitle><CardDescription>Berat dan nilai final ditentukan petugas setelah penimbangan serta verifikasi di desa.</CardDescription></CardHeader><CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2"><Button variant={metode === "antar" ? "default" : "outline"} onClick={() => setMetode("antar")}>Antar ke desa</Button><Button variant={metode === "keliling" ? "default" : "outline"} onClick={() => setMetode("keliling")}>Setor keliling</Button></div>
        <p className="text-xs leading-5 text-muted-foreground">{metode === "keliling" ? "Petugas berkeliling sesuai rute dan jadwal wilayah. Warga membawa sampah ke titik kumpul; tidak ada penjemputan ke rumah." : "Bawa sampah langsung ke titik setor desa pada tanggal yang dipilih."}</p>
        <label className="block space-y-1 text-sm"><span>Tanggal setor</span><input type="date" min={new Date().toISOString().slice(0, 10)} value={tanggal} onChange={(event) => setTanggal(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3" /></label>
        {metode === "keliling" && <label className="block space-y-1 text-sm"><span>Pilih rute petugas keliling</span><select value={titikKeliling} onChange={(event) => setTitikKeliling(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3"><option value="">Pilih wilayah dan titik kumpul</option><option value="barat">Sukamanah Barat · Lapang Desa · 08.00–10.00</option><option value="timur">Sukamanah Timur · Balai RW 05 · 10.30–12.00</option></select><span className="block text-xs text-muted-foreground">Jadwal contoh untuk demo; petugas melayani beberapa titik di wilayahnya.</span></label>}
        <fieldset className="space-y-2"><legend className="text-sm font-medium">Jenis sampah terpilah</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{CATEGORY_KEYS.map((value) => <label key={value} className="flex items-center gap-2 rounded-md border p-2 text-sm"><input type="checkbox" checked={kategori.includes(value)} onChange={() => toggleCategory(value)} />{HARGA_SAMPAH[value].label}</label>)}</div></fieldset>
        <Button onClick={submitRequest}><Truck className="size-4" />{metode === "keliling" ? "Daftar jadwal keliling" : "Catat jadwal setor"}</Button>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Jadwal setor saya</CardTitle></CardHeader><CardContent className="space-y-2">{wargaRequests.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada jadwal setor terdaftar.</p> : wargaRequests.map((item) => <div key={item.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"><div className="text-sm"><p className="font-medium">{item.metode === "keliling" || (item.metode as string) === "jemput" ? "Setor keliling" : "Antar ke desa"} · {formatTanggalPendek(item.tanggalJemput)}</p><p className="text-muted-foreground">{item.alamat} · {item.kategori.map((type) => HARGA_SAMPAH[type].label).join(", ")}</p></div><Badge variant={item.status === "diajukan" ? "secondary" : "default"}>{item.status}</Badge></div>)}</CardContent></Card>
    </div>
    <div className="space-y-4">
      <Card><CardHeader><CardTitle>Pengaduan dan bantuan</CardTitle><CardDescription>Contoh kanal untuk masalah jadwal, pencatatan, atau penggunaan aplikasi.</CardDescription></CardHeader><CardContent className="space-y-3"><label className="block space-y-1 text-sm"><span>Subjek</span><input value={subject} onChange={(event) => setSubject(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3" placeholder="Contoh: jadwal setor keliling" /></label><label className="block space-y-1 text-sm"><span>Pesan</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} className="w-full rounded-md border bg-background p-3" placeholder="Jelaskan kebutuhan atau kendala" /></label><Button variant="outline" onClick={submitComplaint}><MessageCircle className="size-4" />Kirim pengaduan</Button></CardContent></Card>
      <Card><CardHeader><CardTitle>Riwayat pengaduan</CardTitle></CardHeader><CardContent className="space-y-2">{wargaComplaints.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada pengaduan.</p> : wargaComplaints.map((item) => <div key={item.id} className="rounded-lg border p-3 text-sm"><div className="flex justify-between gap-2"><strong>{item.subjek}</strong><Badge variant={item.status === "selesai" ? "default" : "secondary"}>{item.status}</Badge></div><p className="mt-1 text-muted-foreground">{item.pesan}</p></div>)}</CardContent></Card>
    </div>
    {feedback && <p role="status" className="rounded-md bg-primary/10 p-3 text-sm text-primary xl:col-span-2">{feedback}</p>}
  </div>;
}

function WargaPanduan() {
  return <div className="space-y-4"><div><h2 className="text-2xl font-bold">Panduan pemilahan</h2><p className="text-muted-foreground">Pisahkan sampah di rumah, jaga tetap kering dan bersih, lalu setorkan melalui titik desa atau titik kumpul rute keliling.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{(Object.entries(HARGA_SAMPAH) as [KategoriSampah, (typeof HARGA_SAMPAH)[KategoriSampah]][]).map(([key, value]) => <Card key={key}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><span aria-hidden="true">{value.icon}</span>{value.label}</CardTitle><CardDescription>Nilai ilustrasi maksimal {formatRupiah(value.hargaPerKg)}/kg</CardDescription></CardHeader><CardContent className="text-sm text-muted-foreground">Nilai aktual mengikuti berat, kualitas, daftar harga yang ditetapkan pengelola, dan verifikasi petugas.</CardContent></Card>)}</div><Card><CardHeader><CardTitle>Alur setelah disetor</CardTitle></CardHeader><CardContent><ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground"><li>Petugas menimbang dan memeriksa jenis serta kualitas.</li><li>Pengelola desa mengesahkan nilai setoran setelah dana insentif tersedia.</li><li>Saldo dapat dipakai untuk menukar kebutuhan pokok di Kopdes.</li><li>Material yang tak tertampung di desa diteruskan ke kecamatan, BUMD, atau mitra yang sesuai.</li></ol></CardContent></Card></div>;
}

// ---------- Tukar Barang ----------
function WargaTukar({ wargaId }: { wargaId: string }) {
  const { getWarga } = useWarga();
  const { addPenukaran } = usePenukaran();
  const { updateSaldo } = useWarga();
  const { katalog, updateKatalog } = useKatalog();
  const warga = getWarga(wargaId);

  const [cart, setCart] = useState<Record<string, number>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const cartTotal = useMemo(() => {
    return Object.entries(cart).reduce((sum, [barangId, qty]) => {
      const barang = katalog.find((b) => b.id === barangId);
      return sum + (barang ? barang.nilaiTukar * qty : 0);
    }, 0);
  }, [cart, katalog]);
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  const handleSubmit = useCallback(() => {
    if (!warga || cartTotal > warga.saldo || Object.entries(cart).some(([id, qty]) => (katalog.find((item) => item.id === id)?.stok ?? 0) < qty)) return;

    const items: PenukaranItem[] = Object.entries(cart)
      .map(([barangId, qty]) => {
        const barang = katalog.find((b) => b.id === barangId);
        if (!barang) return null;
        return {
          barangId,
          namaBarang: barang.nama,
          jumlah: qty,
          nilaiTukar: barang.nilaiTukar,
          subtotal: barang.nilaiTukar * qty,
        };
      })
      .filter(Boolean) as PenukaranItem[];

    addPenukaran({
      id: generateId("pn"),
      wargaId,
      tanggal: new Date().toISOString().slice(0, 10),
      items,
      totalNilai: cartTotal,
      status: "menunggu",
    });
    updateSaldo(wargaId, -cartTotal);
    updateKatalog(katalog.map((barang) => cart[barang.id] ? { ...barang, stok: barang.stok - cart[barang.id] } : barang));
    setCart({});
    setDialogOpen(false);
    setSuccessOpen(true);
  }, [cart, cartTotal, wargaId, warga, katalog, addPenukaran, updateSaldo, updateKatalog]);

  const categories = [...new Set(katalog.map((b) => b.kategori))];

  return (
    <div className="space-y-4">
      {/* Saldo info */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-sm text-muted-foreground">Saldo Tersedia</p>
            <p className="text-xl font-bold">{formatRupiah(warga?.saldo ?? 0)}</p>
          </div>
          <Wallet className="size-8 text-muted-foreground/30" />
        </CardContent>
      </Card>

      {/* Catalog */}
      {categories.map((cat) => (
        <Card key={cat}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">{cat}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {katalog.filter((b) => b.kategori === cat).map((barang) => {
                const qty = cart[barang.id] || 0;
                return (
                  <div
                    key={barang.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{barang.nama}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRupiah(barang.nilaiTukar)}/{barang.satuan} · Stok: {barang.stok}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      {qty > 0 && (
                        <>
                          <Button
                            variant="outline"
                            size="icon-xs"
                            onClick={() =>
                              setCart((prev) => {
                                const next = { ...prev };
                                if (next[barang.id] > 1) next[barang.id]--;
                                else delete next[barang.id];
                                return next;
                              })
                            }
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-medium tabular-nums">
                            {qty}
                          </span>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="icon-xs"
                        disabled={qty >= barang.stok}
                        onClick={() =>
                          setCart((prev) => ({
                            ...prev,
                            [barang.id]: (prev[barang.id] || 0) + 1,
                          }))
                        }
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Cart bar */}
      {cartCount > 0 && (
        <div className="sticky bottom-20 z-10 md:bottom-4">
          <Card className="shadow-lg border-primary/20">
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="text-sm text-muted-foreground">{cartCount} barang dipilih</p>
                <p className="text-lg font-bold">{formatRupiah(cartTotal)}</p>
                {cartTotal > (warga?.saldo ?? 0) && (
                  <p className="text-xs text-destructive mt-0.5">Saldo tidak mencukupi</p>
                )}
              </div>
              <Button
                onClick={() => setDialogOpen(true)}
                disabled={cartTotal > (warga?.saldo ?? 0)}
              >
                <ShoppingCart className="size-4" />
                Ajukan Penukaran
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirm dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Penukaran</DialogTitle>
            <DialogDescription>
              Tukarkan saldo {formatRupiah(cartTotal)} untuk {cartCount} barang?
              Ini adalah aksi simulasi pada prototype.
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <div className="space-y-1 text-sm">
            {Object.entries(cart).map(([barangId, qty]) => {
              const barang = katalog.find((b) => b.id === barangId);
              if (!barang) return null;
              return (
                <div key={barangId} className="flex justify-between py-1">
                  <span>{barang.nama} ×{qty}</span>
                  <span className="tabular-nums font-medium">
                    {formatRupiah(barang.nilaiTukar * qty)}
                  </span>
                </div>
              );
            })}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatRupiah(cartTotal)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>Ya, tukarkan (simulasi)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-primary" />
              Penukaran Berhasil
            </DialogTitle>
            <DialogDescription>
              Permintaan penukaran berhasil dikirim. Kopdes akan menyiapkan barang Anda.
              Status dapat dipantau di tab Riwayat.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSuccessOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
