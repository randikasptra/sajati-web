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
  Package,
  CheckCircle2,
  ShoppingBag,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import {
  STATUS_PENUKARAN_LABEL,
} from "@/data/mock";
import { useKatalog, usePenukaran, useWarga } from "@/lib/store";
import { formatRupiah, formatTanggalPendek } from "@/lib/utils";

function statusVariant(color: string): "default" | "secondary" | "destructive" | "outline" {
  if (color === "green") return "default";
  if (color === "red") return "destructive";
  return "secondary";
}

export function KopdesPage({
  activeNav,
  onNavChange,
}: {
  activeNav: string;
  onNavChange: (href: string) => void;
}) {
  const tab = activeNav === "/katalog" ? "katalog" : activeNav === "/riwayat" ? "riwayat" : "permintaan";
  const { penukaran } = usePenukaran();

  const menunggu = useMemo(() => penukaran.filter((p) => p.status === "menunggu"), [penukaran]);
  const disiapkan = useMemo(() => penukaran.filter((p) => p.status === "disiapkan"), [penukaran]);
  const selesai = useMemo(
    () => penukaran.filter((p) => p.status === "selesai" || p.status === "diserahkan"),
    [penukaran]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Kopdes</h2>
        <p className="text-muted-foreground">Koperasi Desa — pengelolaan katalog dan penukaran barang</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Permintaan Baru</CardTitle>
            <ShoppingBag className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menunggu.length}</div>
            <p className="text-xs text-muted-foreground">menunggu diproses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sedang Disiapkan</CardTitle>
            <Package className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{disiapkan.length}</div>
            <p className="text-xs text-muted-foreground">siap diserahkan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Selesai</CardTitle>
            <CheckCircle2 className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selesai.length}</div>
            <p className="text-xs text-muted-foreground">penukaran selesai</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={(value) => onNavChange(value === "katalog" ? "/katalog" : value === "riwayat" ? "/riwayat" : "/permintaan")} className="space-y-4">
        <TabsList>
          <TabsTrigger value="permintaan">
            Permintaan
            {(menunggu.length + disiapkan.length) > 0 && (
              <Badge variant="destructive" className="ml-2 text-[10px] px-1.5 py-0 h-5">
                {menunggu.length + disiapkan.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="katalog">Katalog</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="permintaan"><KopdesPermintaan /></TabsContent>
        <TabsContent value="katalog"><KopdesKatalog /></TabsContent>
        <TabsContent value="riwayat"><KopdesRiwayat /></TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Permintaan ----------
function KopdesPermintaan() {
  const { penukaran, updatePenukaranById } = usePenukaran();
  const { wargaList } = useWarga();
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    action: "siapkan" | "serahkan";
    nama: string;
  } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const aktif = useMemo(
    () => penukaran.filter((p) => p.status === "menunggu" || p.status === "disiapkan"),
    [penukaran]
  );

  const handleAction = () => {
    if (!confirmAction) return;
    const { id, action } = confirmAction;
    if (action === "siapkan") {
      updatePenukaranById(id, { status: "disiapkan" });
      setSuccessMsg("Barang sedang disiapkan");
    } else {
      updatePenukaranById(id, { status: "selesai" });
      setSuccessMsg("Barang telah diserahkan ke warga");
    }
    setConfirmAction(null);
  };

  if (aktif.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-muted-foreground text-sm">
          <Package className="size-8 mx-auto mb-2 opacity-50" />
          Tidak ada permintaan aktif
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Permintaan Penukaran Aktif</CardTitle>
          <CardDescription>Permintaan dari warga yang perlu diproses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Warga</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Barang</TableHead>
                <TableHead className="text-right">Nilai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aktif.map((p) => {
                const warga = wargaList.find((w) => w.id === p.wargaId);
                const statusInfo = STATUS_PENUKARAN_LABEL[p.status];
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{warga?.nama ?? "-"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTanggalPendek(p.tanggal)}<span className="block break-all font-mono text-xs">Kode: {p.id.toUpperCase()}</span>
                    </TableCell>
                    <TableCell>
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
                    <TableCell className="text-right">
                      {p.status === "menunggu" && (
                        <Button
                          size="xs"
                          onClick={() =>
                            setConfirmAction({
                              id: p.id,
                              action: "siapkan",
                              nama: warga?.nama ?? "Warga",
                            })
                          }
                        >
                          Siapkan
                          <ArrowRight className="size-3" />
                        </Button>
                      )}
                      {p.status === "disiapkan" && (
                        <Button
                          size="xs"
                          onClick={() =>
                            setConfirmAction({
                              id: p.id,
                              action: "serahkan",
                              nama: warga?.nama ?? "Warga",
                            })
                          }
                        >
                          Serahkan
                          <CheckCircle2 className="size-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirm */}
      <Dialog open={confirmAction !== null} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.action === "siapkan" ? "Siapkan Barang?" : "Konfirmasi Penyerahan"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.action === "siapkan"
                ? `Tandai permintaan dari ${confirmAction.nama} sedang disiapkan?`
                : `Tandai barang sudah diserahkan ke ${confirmAction?.nama}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Batal</Button>
            <Button onClick={handleAction}>
              {confirmAction?.action === "siapkan" ? "Ya, siapkan" : "Ya, sudah diserahkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success */}
      <Dialog open={successMsg !== null} onOpenChange={(open) => !open && setSuccessMsg(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-primary" />
              Berhasil
            </DialogTitle>
            <DialogDescription>{successMsg}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSuccessMsg(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------- Katalog ----------
function KopdesKatalog() {
  const { katalog, updateBarang } = useKatalog();
  const categories = [...new Set(katalog.map((b) => b.kategori))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Katalog Kebutuhan Pokok</CardTitle>
        <CardDescription>Barang yang tersedia untuk penukaran saldo manfaat</CardDescription>
      </CardHeader>
      <CardContent>
        {categories.map((cat, catIdx) => (
          <div key={cat}>
            {catIdx > 0 && <Separator className="my-4" />}
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {cat}
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead className="text-right">Nilai Tukar</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead>Satuan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {katalog.filter((b) => b.kategori === cat).map((barang) => (
                  <TableRow key={barang.id}>
                    <TableCell className="font-medium">{barang.nama}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatRupiah(barang.nilaiTukar)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon-xs" variant="outline" aria-label={`Kurangi stok ${barang.nama}`} disabled={barang.stok <= 0} onClick={() => updateBarang(barang.id, { stok: Math.max(0, barang.stok - 1) })}>−</Button>
                        <Badge variant={barang.stok <= 10 ? "destructive" : "outline"} className="text-[10px] tabular-nums">{barang.stok}</Badge>
                        <Button size="icon-xs" variant="outline" aria-label={`Tambah stok ${barang.nama}`} onClick={() => updateBarang(barang.id, { stok: barang.stok + 1 })}>+</Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{barang.satuan}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------- Riwayat ----------
function KopdesRiwayat() {
  const { penukaran } = usePenukaran();
  const { wargaList } = useWarga();
  const selesai = useMemo(
    () => penukaran.filter((p) => p.status === "selesai" || p.status === "diserahkan"),
    [penukaran]
  );

  if (selesai.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-muted-foreground text-sm">
          <ClipboardList className="size-8 mx-auto mb-2 opacity-50" />
          Belum ada riwayat penukaran selesai
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Riwayat Penukaran Selesai</CardTitle>
        <CardDescription>Penukaran yang sudah diserahkan ke warga</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Warga</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Barang</TableHead>
              <TableHead className="text-right">Nilai</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selesai.map((p) => {
              const warga = wargaList.find((w) => w.id === p.wargaId);
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{warga?.nama ?? "-"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTanggalPendek(p.tanggal)}<span className="block break-all font-mono text-xs">Kode: {p.id.toUpperCase()}</span>
                  </TableCell>
                  <TableCell>{p.items.map((i) => `${i.namaBarang} ×${i.jumlah}`).join(", ")}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {formatRupiah(p.totalNilai)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="text-[10px]">Selesai</Badge>
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
