"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardCheck,
  Scale,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  AlertTriangle,
  Search,
  X,
} from "lucide-react";
import {
  HARGA_SAMPAH,
  type KategoriSampah,
  type SetoranItem,
  type Setoran,
} from "@/data/mock";
import { useSetoran, useWarga } from "@/lib/store";
import { formatRupiah, formatBerat, formatTanggalPendek, generateId } from "@/lib/utils";
import { usePenjemputan } from "@/lib/store";
import type { Penjemputan } from "@/data/mock";
import { VillageStockPanel } from "@/app/(roles)/jaringan/NetworkPage";

function getRecordPickupId() {
  return sessionStorage.getItem("sajati_record_pickup");
}
function subscribeRecordPickup(callback: () => void) {
  window.addEventListener("sajati_record_pickup_change", callback);
  return () => window.removeEventListener("sajati_record_pickup_change", callback);
}

export function PetugasPage({
  activeNav,
  onNavChange,
}: {
  activeNav: string;
  onNavChange: (href: string) => void;
}) {
  const tab = activeNav === "/petugas/catat" || activeNav === "/petugas/pilah" ? "catat" : activeNav === "/petugas/rute-keliling" ? "jemput" : activeNav === "/petugas/stok" ? "stok" : "antrian";
  const { setoran, addSetoran, updateSetoranById } = useSetoran();
  const { wargaList } = useWarga();
  const { penjemputan, updatePenjemputanById } = usePenjemputan();
  const recordPickupId = useSyncExternalStore(subscribeRecordPickup, getRecordPickupId, () => null);
  const recordPickup = penjemputan.find((item) => item.id === recordPickupId) ?? null;
  const isDashboard = activeNav === "/petugas" || activeNav === "/";
  const pageTitle = isDashboard ? "Ringkasan Petugas" : tab === "antrian" ? "Antrian Verifikasi" : tab === "jemput" ? "Rute Setor Keliling" : tab === "stok" ? "Stok & Pilah Desa" : "Catat Setoran";

  const menunggu = useMemo(
    () => setoran.filter((s) => s.status === "menunggu_verifikasi"),
    [setoran]
  );
  const terverifikasi = useMemo(
    () => setoran.filter((s) => s.status === "terverifikasi" || s.status === "perlu_persetujuan"),
    [setoran]
  );
  const todayCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return setoran.filter((s) => s.tanggal === today).length;
  }, [setoran]);
  const totalBeratHariIni = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return setoran
      .filter((s) => s.tanggal === today)
      .reduce((sum, s) => sum + s.items.reduce((a, i) => a + i.berat, 0), 0);
  }, [setoran]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{pageTitle}</h2>
        <p className="text-muted-foreground">{tab === "jemput" ? "Kelola warga yang terdaftar pada rute dan titik kumpul wilayah." : tab === "stok" ? "Pilah stok yang sudah tercatat sebagai dapat atau tidak dapat dikelola." : tab === "catat" ? "Catat berat dan kualitas sampah yang sudah diterima." : "Verifikasi setoran warga dan pantau sampah masuk."}</p>
      </div>

      {/* Stats */}
      {isDashboard && <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Antrian</CardTitle>
            <AlertTriangle className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menunggu.length}</div>
            <p className="text-xs text-muted-foreground">menunggu verifikasi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Terverifikasi</CardTitle>
            <CheckCircle2 className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{terverifikasi.length}</div>
            <p className="text-xs text-muted-foreground">menunggu admin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Setoran Hari Ini</CardTitle>
            <ClipboardCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount}</div>
            <p className="text-xs text-muted-foreground">setoran masuk</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Berat Hari Ini</CardTitle>
            <Scale className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBerat(totalBeratHariIni)}</div>
            <p className="text-xs text-muted-foreground">total berat masuk</p>
          </CardContent>
        </Card>
      </div>}

      <Tabs value={tab} className="space-y-4">
        <TabsContent value="antrian">
          <AntrianVerifikasi
            menunggu={menunggu}
            wargaList={wargaList}
            onVerifikasi={(id) => updateSetoranById(id, { status: "terverifikasi", petugasId: "p1" })}
            onTolak={(id, alasan) => updateSetoranById(id, { status: "ditolak", petugasId: "p1", alasanTolak: alasan })}
          />
        </TabsContent>

        <TabsContent value="catat">
          <CatatSetoran
            key={recordPickup?.id ?? "manual"}
            wargaList={wargaList}
            onSubmit={(s) => addSetoran(s)}
            initialWargaId={recordPickup?.wargaId}
            penjemputanId={recordPickup?.id}
            onCompleted={recordPickup ? () => {
              updatePenjemputanById(recordPickup.id, { status: "selesai" });
              sessionStorage.removeItem("sajati_record_pickup");
              window.dispatchEvent(new Event("sajati_record_pickup_change"));
              onNavChange("/petugas/rute-keliling");
            } : undefined}
          />
        </TabsContent>
        <TabsContent value="jemput">
          <AntrianPenjemputan
            penjemputan={penjemputan}
            wargaList={wargaList}
            onStatus={(id, status) => updatePenjemputanById(id, { status })}
            onRecord={(item) => {
              sessionStorage.setItem("sajati_record_pickup", item.id);
              window.dispatchEvent(new Event("sajati_record_pickup_change"));
              onNavChange("/petugas/catat");
            }}
          />
        </TabsContent>
        <TabsContent value="stok"><VillageStockPanel /></TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Antrian ----------
function AntrianPenjemputan({
  penjemputan,
  wargaList,
  onStatus,
  onRecord,
}: {
  penjemputan: Penjemputan[];
  wargaList: ReturnType<typeof useWarga>["wargaList"];
  onStatus: (id: string, status: Penjemputan["status"]) => void;
  onRecord: (item: Penjemputan) => void;
}) {
  const active = penjemputan.filter((item) => item.status !== "selesai" && item.status !== "dibatalkan");
  if (active.length === 0) return <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Belum ada warga terdaftar pada jadwal setor keliling.</CardContent></Card>;
  return <Card><CardHeader><CardTitle className="text-base">Jadwal setor langsung dan rute keliling</CardTitle><CardDescription>Warga memilih rute dan titik kumpul. Setelah sampah diterima di titik layanan, catat hasil timbang.</CardDescription></CardHeader><CardContent className="space-y-3">{active.map((item) => {
    const warga = wargaList.find((person) => person.id === item.wargaId);
    const keliling = item.metode === "keliling" || (item.metode as string) === "jemput";
    const received = item.status === "diterima" || item.status === "dijemput";
    return <div key={item.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"><div className="text-sm"><p className="font-medium">{warga?.nama ?? "Warga"} · {keliling ? "Setor keliling" : "Antar ke desa"}</p><p className="text-muted-foreground">{item.alamat} · {formatTanggalPendek(item.tanggalJemput)}</p><p className="text-xs text-muted-foreground">Jenis: {item.kategori.map((type) => HARGA_SAMPAH[type].label).join(", ")} · Status: {item.status}</p></div><div className="flex flex-wrap gap-2">{item.status === "diajukan" && <Button size="sm" onClick={() => onStatus(item.id, "dijadwalkan")}>Konfirmasi jadwal</Button>}{item.status === "dijadwalkan" && <Button size="sm" onClick={() => onStatus(item.id, "diterima")}>Konfirmasi setoran diterima</Button>}{received && <Button size="sm" onClick={() => onRecord(item)}>Catat hasil timbang</Button>}</div></div>;
  })}</CardContent></Card>;
}

function AntrianVerifikasi({
  menunggu,
  wargaList,
  onVerifikasi,
  onTolak,
}: {
  menunggu: Setoran[];
  wargaList: ReturnType<typeof useWarga>["wargaList"];
  onVerifikasi: (id: string) => void;
  onTolak: (id: string, alasan: string) => void;
}) {
  const [tolakDialog, setTolakDialog] = useState<{ id: string; nama: string } | null>(null);
  const [alasanTolak, setAlasanTolak] = useState("");
  const [verifikasiDialog, setVerifikasiDialog] = useState<{ id: string; nama: string } | null>(null);

  if (menunggu.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-muted-foreground text-sm">
          <CheckCircle2 className="size-8 mx-auto mb-2 opacity-50" />
          Tidak ada setoran menunggu verifikasi
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Setoran Menunggu Verifikasi</CardTitle>
          <CardDescription>Periksa kategori, berat, dan kualitas sebelum memverifikasi</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Warga</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Berat</TableHead>
                <TableHead className="text-right">Nilai</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menunggu.map((s) => {
                const warga = wargaList.find((w) => w.id === s.wargaId);
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{warga?.nama ?? "-"}</p>
                        <p className="text-xs text-muted-foreground">RT {warga?.rt}/RW {warga?.rw}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTanggalPendek(s.tanggal)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {s.items.map((item, idx) => (
                          <Badge key={idx} variant="outline" className="text-[10px]">
                            {HARGA_SAMPAH[item.kategori].icon} {HARGA_SAMPAH[item.kategori].label} ({formatBerat(item.berat)})
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatBerat(s.items.reduce((a, i) => a + i.berat, 0))}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatRupiah(s.totalNilai)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="xs"
                          className="text-destructive"
                          onClick={() =>
                            setTolakDialog({ id: s.id, nama: warga?.nama ?? "Warga" })
                          }
                        >
                          <XCircle className="size-3.5" />
                          Tolak
                        </Button>
                        <Button
                          size="xs"
                          onClick={() =>
                            setVerifikasiDialog({ id: s.id, nama: warga?.nama ?? "Warga" })
                          }
                        >
                          <CheckCircle2 className="size-3.5" />
                          Verifikasi
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Verify dialog */}
      <Dialog
        open={verifikasiDialog !== null}
        onOpenChange={(open) => !open && setVerifikasiDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verifikasi Setoran</DialogTitle>
            <DialogDescription>
              Verifikasi setoran dari {verifikasiDialog?.nama}? Setoran akan diteruskan ke Admin Desa untuk persetujuan saldo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifikasiDialog(null)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                if (verifikasiDialog) onVerifikasi(verifikasiDialog.id);
                setVerifikasiDialog(null);
              }}
            >
              Ya, verifikasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog
        open={tolakDialog !== null}
        onOpenChange={(open) => {
          if (!open) { setTolakDialog(null); setAlasanTolak(""); }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Setoran</DialogTitle>
            <DialogDescription>
              Setoran dari {tolakDialog?.nama} akan ditolak. Berikan alasan penolakan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="alasan">Alasan Penolakan</Label>
            <Textarea
              id="alasan"
              value={alasanTolak}
              onChange={(e) => setAlasanTolak(e.target.value)}
              placeholder="Contoh: Sampah belum terpilah dengan baik"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setTolakDialog(null); setAlasanTolak(""); }}>
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={!alasanTolak.trim()}
              onClick={() => {
                if (tolakDialog) onTolak(tolakDialog.id, alasanTolak);
                setTolakDialog(null);
                setAlasanTolak("");
              }}
            >
              Tolak Setoran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------- Catat Setoran Baru ----------
function CatatSetoran({
  wargaList,
  onSubmit,
  initialWargaId,
  penjemputanId,
  onCompleted,
}: {
  wargaList: ReturnType<typeof useWarga>["wargaList"];
  onSubmit: (s: Setoran) => void;
  initialWargaId?: string;
  penjemputanId?: string;
  onCompleted?: () => void;
}) {
  const [wargaId, setWargaId] = useState(initialWargaId ?? "");
  const [wargaSearch, setWargaSearch] = useState(() => wargaList.find((w) => w.id === initialWargaId)?.nama ?? "");
  const [items, setItems] = useState<SetoranItem[]>([]);
  const [kategori, setKategori] = useState<KategoriSampah>("plastik");
  const [berat, setBerat] = useState("");
  const [kualitas, setKualitas] = useState<"baik" | "sedang" | "kurang">("baik");
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const selectedWarga = wargaList.find((w) => w.id === wargaId);
  const matchingWarga = wargaSearch.trim().length < 2 || wargaId
    ? []
    : wargaList.filter((w) => `${w.nama} ${w.rt} ${w.rw} ${w.desa} ${w.kecamatan} ${w.telepon}`.toLowerCase().includes(wargaSearch.trim().toLowerCase())).slice(0, 6);

  const totalNilai = items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleAddItem = () => {
    const beratNum = parseFloat(berat);
    if (isNaN(beratNum) || beratNum <= 0) return;
    const harga = HARGA_SAMPAH[kategori].hargaPerKg;
    const mult = kualitas === "baik" ? 1 : kualitas === "sedang" ? 0.8 : 0.5;
    const nilaiPerKg = Math.round(harga * mult);
    setItems((prev) => [
      ...prev,
      { kategori, berat: beratNum, kualitas, nilaiPerKg, subtotal: Math.round(nilaiPerKg * beratNum) },
    ]);
    setBerat("");
  };

  const handleSubmit = () => {
    if (!wargaId || items.length === 0) return;
    onSubmit({
      id: generateId("s"),
      wargaId,
      penjemputanId,
      tanggal: new Date().toISOString().slice(0, 10),
      items,
      status: "menunggu_verifikasi",
      petugasId: "p1",
      totalNilai,
      createdAt: new Date().toISOString(),
    });
    setWargaId("");
    setWargaSearch("");
    setItems([]);
    setSuccessMessage("Berat hasil timbang tersimpan dan setoran masuk ke antrean verifikasi. Pemilahan kelayakan dilakukan dari stok desa setelah setoran disetujui.");
    setSuccessOpen(true);
    onCompleted?.();
  };

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pilah dan Timbang Setoran</CardTitle>
            <CardDescription>Berat baru dicatat setelah sampah ditimbang petugas di titik layanan desa atau rute keliling.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warga-search">Cari warga</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="warga-search" value={wargaSearch} onChange={(event) => { setWargaSearch(event.target.value); setWargaId(""); }} placeholder="Nama, RT/RW, desa, atau nomor HP" className="pl-9 pr-10" autoComplete="off" />
                {wargaSearch && <button type="button" aria-label="Hapus pencarian warga" onClick={() => { setWargaSearch(""); setWargaId(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"><X className="size-4" /></button>}
              </div>
              {selectedWarga && <p className="text-xs font-medium text-emerald-800">Dipilih: {selectedWarga.nama} · RT {selectedWarga.rt}/RW {selectedWarga.rw}, {selectedWarga.desa}</p>}
              {matchingWarga.length > 0 && <div className="max-h-48 overflow-y-auto rounded-lg border bg-background p-1">{matchingWarga.map((w) => <button key={w.id} type="button" onClick={() => { setWargaId(w.id); setWargaSearch(w.nama); }} className="flex w-full flex-col rounded-md px-3 py-2 text-left hover:bg-muted"><span className="text-sm font-semibold">{w.nama}</span><span className="text-xs text-muted-foreground">RT {w.rt}/RW {w.rw} · Desa {w.desa} · {w.telepon}</span></button>)}</div>}
              {!wargaId && wargaSearch.trim().length >= 2 && matchingWarga.length === 0 && <p className="text-xs text-muted-foreground">Warga tidak ditemukan. Coba nama atau nomor HP lain.</p>}
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Jenis sampah hasil timbang</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Kategori</Label>
                  <Select value={kategori} onValueChange={(v) => setKategori((v ?? "plastik") as KategoriSampah)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(HARGA_SAMPAH).map(([key, val]) => (
                        <SelectItem key={key} value={key}>
                          {val.icon} {val.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Hasil timbang (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={berat}
                    onChange={(e) => setBerat(e.target.value)}
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Kualitas</Label>
                <div className="flex gap-2">
                  {(["baik", "sedang", "kurang"] as const).map((q) => (
                    <Button
                      key={q}
                      type="button"
                      variant={kualitas === q ? "default" : "outline"}
                      size="sm"
                      onClick={() => setKualitas(q)}
                      className="capitalize"
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>

              {berat && parseFloat(berat) > 0 && (
                <p className="text-xs text-muted-foreground">
                  Estimasi: {formatRupiah(
                    Math.round(
                      HARGA_SAMPAH[kategori].hargaPerKg *
                        (kualitas === "baik" ? 1 : kualitas === "sedang" ? 0.8 : 0.5) *
                        parseFloat(berat)
                    )
                  )}
                </p>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddItem}
                disabled={!berat || parseFloat(berat) <= 0}
              >
                <Plus className="size-3.5" />
                Tambah Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ringkasan Setoran</CardTitle>
            <CardDescription>{items.length} item tercatat</CardDescription>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada item. Tambah item di form sebelah kiri.
              </p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Berat</TableHead>
                      <TableHead className="text-right">Kualitas</TableHead>
                      <TableHead className="text-right">Nilai</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {HARGA_SAMPAH[item.kategori].icon} {HARGA_SAMPAH[item.kategori].label}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatBerat(item.berat)}
                        </TableCell>
                        <TableCell className="text-right capitalize">{item.kualitas}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {formatRupiah(item.subtotal)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                          >
                            <Trash2 className="size-3 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Separator className="my-3" />

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Nilai</span>
                  <span className="text-lg font-bold tabular-nums">{formatRupiah(totalNilai)}</span>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!wargaId || items.length === 0}
                  className="w-full mt-4"
                >
                  Simpan Setoran
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-primary" />
              Setoran Berhasil Dicatat
            </DialogTitle>
            <DialogDescription>
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSuccessOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
