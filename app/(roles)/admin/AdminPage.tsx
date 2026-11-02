"use client";

import { useState, useMemo } from "react";
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
  Users,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import {
  HARGA_SAMPAH,
  STATUS_PENUKARAN_LABEL,
  type Setoran,
} from "@/data/mock";
import { useSetoran, useWarga, usePenukaran } from "@/lib/store";
import { formatRupiah, formatBerat, formatTanggalPendek, generateId } from "@/lib/utils";
import { useDana, useStok, usePengaduan } from "@/lib/store";

function statusVariant(color: string): "default" | "secondary" | "destructive" | "outline" {
  if (color === "green") return "default";
  if (color === "red") return "destructive";
  return "secondary";
}

export function AdminPage({
  activeNav,
  onNavChange,
}: {
  activeNav: string;
  onNavChange: (href: string) => void;
}) {
  const tab = activeNav === "/saldo" ? "saldo" : activeNav === "/penukaran" ? "penukaran" : activeNav === "/pengaduan" ? "pengaduan" : "persetujuan";
  const { setoran } = useSetoran();
  const { wargaList } = useWarga();
  const { penukaran } = usePenukaran();

  const perluPersetujuan = useMemo(
    () => setoran.filter((s) => s.status === "terverifikasi"),
    [setoran]
  );
  const sudahDisetujui = useMemo(
    () => setoran.filter((s) => s.status === "saldo_ditambahkan" || s.status === "selesai"),
    [setoran]
  );
  const totalSaldoDisalurkan = useMemo(
    () => sudahDisetujui.reduce((sum, s) => sum + s.totalNilai, 0),
    [sudahDisetujui]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Desa</h2>
        <p className="text-muted-foreground">Persetujuan saldo, pencatatan, dan pengelolaan penukaran</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Warga</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wargaList.length}</div>
            <p className="text-xs text-muted-foreground">terdaftar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Perlu Persetujuan</CardTitle>
            <ShieldCheck className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{perluPersetujuan.length}</div>
            <p className="text-xs text-muted-foreground">setoran terverifikasi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Tersalurkan</CardTitle>
            <TrendingUp className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{formatRupiah(totalSaldoDisalurkan)}</div>
            <p className="text-xs text-muted-foreground">simulasi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Penukaran</CardTitle>
            <ClipboardList className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{penukaran.length}</div>
            <p className="text-xs text-muted-foreground">total permintaan</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={(value) => onNavChange(value === "saldo" ? "/saldo" : value === "penukaran" ? "/penukaran" : value === "pengaduan" ? "/pengaduan" : "/persetujuan")} className="space-y-4">
        <TabsList>
          <TabsTrigger value="persetujuan">
            Persetujuan
            {perluPersetujuan.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-[10px] px-1.5 py-0 h-5">
                {perluPersetujuan.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="saldo">Saldo Warga</TabsTrigger>
          <TabsTrigger value="penukaran">Penukaran</TabsTrigger>
          <TabsTrigger value="pengaduan">Pengaduan</TabsTrigger>
        </TabsList>

        <TabsContent value="persetujuan">
          <AdminPersetujuan perluPersetujuan={perluPersetujuan} />
        </TabsContent>
        <TabsContent value="saldo"><AdminSaldoWarga /></TabsContent>
        <TabsContent value="penukaran"><AdminPenukaran /></TabsContent>
        <TabsContent value="pengaduan"><AdminPengaduan /></TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Persetujuan ----------
function AdminPersetujuan({ perluPersetujuan }: { perluPersetujuan: Setoran[] }) {
  const { updateSetoranById } = useSetoran();
  const { wargaList, updateSaldo } = useWarga();
  const { deductDana } = useDana();
  const { stok, updateStok } = useStok();
  const [confirmDialog, setConfirmDialog] = useState<Setoran | null>(null);
  const [successDialog, setSuccessDialog] = useState<{ nama: string; nilai: number } | null>(null);
  const [fundingError, setFundingError] = useState("");

  const handleApprove = (s: Setoran) => {
    if (s.status !== "terverifikasi") return;
    const villageStock = stok.filter((row) => row.jenjang === "desa" && row.pemilikId === "desa-sukamanah").reduce((sum, row) => sum + row.beratKg, 0);
    const incomingWeight = s.items.reduce((sum, item) => sum + item.berat, 0);
    if (villageStock + incomingWeight > 300) {
      setFundingError("Kapasitas penampungan desa 300 kg akan terlampaui. Salurkan stok ke kecamatan sebelum setoran disetujui.");
      return;
    }
    const warga = wargaList.find((w) => w.id === s.wargaId);
    if (!deductDana("dana-desa", s.totalNilai, `Insentif ${warga?.nama ?? "Warga"}`, s.id)) {
      setFundingError("Dana insentif desa tidak mencukupi. Ajukan penyaluran dana melalui pengelola kecamatan.");
      return;
    }
    updateSetoranById(s.id, { status: "saldo_ditambahkan", adminId: "a1" });
    updateSaldo(s.wargaId, s.totalNilai);
    const now = new Date().toISOString();
    updateStok([
      ...stok,
      ...s.items.map((item) => ({
        id: generateId("st"),
        jenjang: "desa" as const,
        pemilikId: "desa-sukamanah",
        namaPemilik: "Desa Sukamanah",
        kategori: item.kategori,
        beratKg: item.berat,
        kualitas: item.kualitas,
        diperbaruiPada: now,
      })),
    ]);
    setConfirmDialog(null);
    setFundingError("");
    setSuccessDialog({ nama: warga?.nama ?? "Warga", nilai: s.totalNilai });
  };

  if (perluPersetujuan.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-muted-foreground text-sm">
          <CheckCircle2 className="size-8 mx-auto mb-2 opacity-50" />
          Tidak ada setoran menunggu persetujuan
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Setoran Menunggu Persetujuan</CardTitle>
          <CardDescription>Sudah diverifikasi oleh Petugas Desa — menunggu persetujuan saldo</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Warga</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Berat</TableHead>
                <TableHead className="text-right">Nilai</TableHead>
                <TableHead className="text-right">Saldo Saat Ini</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perluPersetujuan.map((s) => {
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
                            {HARGA_SAMPAH[item.kategori].icon} {HARGA_SAMPAH[item.kategori].label}
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
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatRupiah(warga?.saldo ?? 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="xs" onClick={() => setConfirmDialog(s)}>
                        <ShieldCheck className="size-3.5" />
                        Setujui
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirm */}
      <Dialog open={confirmDialog !== null} onOpenChange={(open) => !open && (setConfirmDialog(null), setFundingError(""))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Persetujuan Saldo</DialogTitle>
            <DialogDescription>
              Tambahkan saldo {confirmDialog ? formatRupiah(confirmDialog.totalNilai) : ""} ke akun{" "}
              {wargaList.find((w) => w.id === confirmDialog?.wargaId)?.nama ?? "warga"}?
              Ini adalah aksi simulasi pada prototype.
            </DialogDescription>
            {fundingError && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{fundingError}</p>}
          </DialogHeader>
          {confirmDialog && (
            <div className="text-sm space-y-1">
              {confirmDialog.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1">
                  <span>{HARGA_SAMPAH[item.kategori].icon} {HARGA_SAMPAH[item.kategori].label} · {formatBerat(item.berat)}</span>
                  <span className="tabular-nums font-medium">{formatRupiah(item.subtotal)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Saldo Ditambahkan</span>
                <span className="tabular-nums">{formatRupiah(confirmDialog.totalNilai)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>Batal</Button>
            <Button onClick={() => confirmDialog && handleApprove(confirmDialog)}>
              Ya, setujui (simulasi)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success */}
      <Dialog open={successDialog !== null} onOpenChange={(open) => !open && setSuccessDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-primary" />
              Saldo Berhasil Ditambahkan
            </DialogTitle>
            <DialogDescription>
              {successDialog?.nama} menerima saldo {successDialog ? formatRupiah(successDialog.nilai) : ""} (simulasi).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSuccessDialog(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------- Saldo Warga ----------
function AdminPengaduan() {
  const { pengaduan, updatePengaduanById } = usePengaduan();
  const { wargaList } = useWarga();
  if (pengaduan.length === 0) return <Card><CardContent className="py-12 text-center text-sm text-muted-foreground"><MessageCircle className="mx-auto mb-2 size-8 opacity-50" />Belum ada pengaduan dari warga.</CardContent></Card>;
  return <Card><CardHeader><CardTitle className="text-base">Pengaduan warga</CardTitle><CardDescription>Tindak lanjuti kendala jadwal, setoran, saldo, atau penggunaan aplikasi.</CardDescription></CardHeader><CardContent className="space-y-3">{pengaduan.map((item) => <div key={item.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-start sm:justify-between"><div className="space-y-1 text-sm"><p className="font-semibold">{item.subjek} <span className="font-normal text-muted-foreground">· {wargaList.find((person) => person.id === item.wargaId)?.nama ?? "Warga"}</span></p><p className="text-muted-foreground">{item.pesan}</p><p className="text-xs text-muted-foreground">{formatTanggalPendek(item.dibuatPada)}</p></div><div className="flex items-center gap-2"><Badge variant={item.status === "selesai" ? "default" : "secondary"}>{item.status}</Badge>{item.status === "baru" && <Button size="xs" variant="outline" onClick={() => updatePengaduanById(item.id, { status: "diproses" })}>Proses</Button>}{item.status !== "selesai" && <Button size="xs" onClick={() => updatePengaduanById(item.id, { status: "selesai" })}>Selesaikan</Button>}</div></div>)}</CardContent></Card>;
}

function AdminSaldoWarga() {
  const { wargaList } = useWarga();
  const { setoran } = useSetoran();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Saldo Manfaat Warga</CardTitle>
        <CardDescription>Data ilustrasi — saldo simulasi seluruh warga</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>RT/RW</TableHead>
              <TableHead>Desa</TableHead>
              <TableHead className="text-right">Total Setoran Disetujui</TableHead>
              <TableHead className="text-right">Saldo Saat Ini</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wargaList.map((w) => {
              const approved = setoran
                .filter((s) => s.wargaId === w.id && (s.status === "saldo_ditambahkan" || s.status === "selesai"))
                .reduce((sum, s) => sum + s.totalNilai, 0);
              return (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">{w.nama}</TableCell>
                  <TableCell className="text-muted-foreground">RT {w.rt}/RW {w.rw}</TableCell>
                  <TableCell className="text-muted-foreground">{w.desa}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatRupiah(approved)}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-primary">
                    {formatRupiah(w.saldo)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ---------- Penukaran ----------
function AdminPenukaran() {
  const { penukaran } = usePenukaran();
  const { wargaList } = useWarga();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Riwayat Penukaran</CardTitle>
        <CardDescription>Semua permintaan penukaran saldo ke Kopdes</CardDescription>
      </CardHeader>
      <CardContent>
        {penukaran.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">Belum ada penukaran</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Warga</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Barang</TableHead>
                <TableHead className="text-right">Nilai</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {penukaran.map((p) => {
                const warga = wargaList.find((w) => w.id === p.wargaId);
                const statusInfo = STATUS_PENUKARAN_LABEL[p.status];
                return (
                  <TableRow key={p.id}>
                    <TableCell className="text-muted-foreground font-mono text-xs">{p.id}</TableCell>
                    <TableCell className="font-medium">{warga?.nama ?? "-"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTanggalPendek(p.tanggal)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {p.items.map((i) => `${i.namaBarang} ×${i.jumlah}`).join(", ")}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
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
  );
}
