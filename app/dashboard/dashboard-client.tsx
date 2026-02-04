"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  History, 
  LogOut,
  Loader2,
  User,
  Package,
  CreditCard
} from "lucide-react"
import type { User as UserType } from "@/lib/auth"

interface DashboardClientProps {
  user: UserType
  deposits: any[]
  withdrawals: any[]
  products: any[]
  systemBanks: any[]
}

export function DashboardClient({ user, deposits, withdrawals, products, systemBanks }: DashboardClientProps) {
  const router = useRouter()
  const [depositOpen, setDepositOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Deposit form
  const [depositAmount, setDepositAmount] = useState("")
  const [depositBank, setDepositBank] = useState("")

  // Withdraw form
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawBank, setWithdrawBank] = useState("")
  const [withdrawAccount, setWithdrawAccount] = useState("")
  const [withdrawAccountName, setWithdrawAccountName] = useState("")

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
          bankId: parseInt(depositBank),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setSuccess("Permintaan deposit berhasil dibuat")
      setDepositOpen(false)
      setDepositAmount("")
      setDepositBank("")
      router.refresh()
    } catch (err) {
      setError("Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          bankName: withdrawBank,
          accountNumber: withdrawAccount,
          accountName: withdrawAccountName,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setSuccess("Permintaan penarikan berhasil dibuat")
      setWithdrawOpen(false)
      setWithdrawAmount("")
      setWithdrawBank("")
      setWithdrawAccount("")
      setWithdrawAccountName("")
      router.refresh()
    } catch (err) {
      setError("Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(typeof amount === "string" ? parseFloat(amount) : amount)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    }
    const labels: Record<string, string> = {
      pending: "Menunggu",
      approved: "Disetujui",
      rejected: "Ditolak",
    }
    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold">{user.fullName}</p>
              <p className="text-sm text-muted-foreground">Customer</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="h-8 w-8" />
              <span className="text-lg">Saldo Anda</span>
            </div>
            <p className="text-4xl font-bold">{formatCurrency(user.balance)}</p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
            <DialogTrigger asChild>
              <Button className="h-20 flex-col gap-2" variant="outline">
                <ArrowDownCircle className="h-6 w-6 text-green-500" />
                <span>Deposit</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deposit Dana</DialogTitle>
                <DialogDescription>Masukkan jumlah deposit dan pilih bank tujuan</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleDeposit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label>Jumlah Deposit</Label>
                  <Input
                    type="number"
                    placeholder="Masukkan jumlah"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="10000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bank Tujuan</Label>
                  <Select value={depositBank} onValueChange={setDepositBank} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {systemBanks.map((bank: any) => (
                        <SelectItem key={bank.id} value={bank.id.toString()}>
                          {bank.bank_name} - {bank.account_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Ajukan Deposit
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
            <DialogTrigger asChild>
              <Button className="h-20 flex-col gap-2" variant="outline">
                <ArrowUpCircle className="h-6 w-6 text-red-500" />
                <span>Withdraw</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tarik Dana</DialogTitle>
                <DialogDescription>Masukkan detail penarikan dana Anda</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleWithdraw} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label>Jumlah Penarikan</Label>
                  <Input
                    type="number"
                    placeholder="Masukkan jumlah"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="10000"
                    max={parseFloat(user.balance)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nama Bank</Label>
                  <Input
                    placeholder="Contoh: BCA, Mandiri, BNI"
                    value={withdrawBank}
                    onChange={(e) => setWithdrawBank(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nomor Rekening</Label>
                  <Input
                    placeholder="Nomor rekening tujuan"
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nama Pemilik Rekening</Label>
                  <Input
                    placeholder="Nama sesuai rekening"
                    value={withdrawAccountName}
                    onChange={(e) => setWithdrawAccountName(e.target.value)}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Ajukan Penarikan
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produk Tersedia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {products.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Belum ada produk tersedia</p>
              ) : (
                products.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </div>
                    <p className="font-semibold">{formatCurrency(product.price)}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Tabs defaultValue="deposits">
          <TabsList className="w-full">
            <TabsTrigger value="deposits" className="flex-1">
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex-1">
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Penarikan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposits" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Riwayat Deposit
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deposits.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Belum ada riwayat deposit</p>
                ) : (
                  <div className="space-y-3">
                    {deposits.map((deposit: any) => (
                      <div key={deposit.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{formatCurrency(deposit.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(deposit.created_at).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                        {getStatusBadge(deposit.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Riwayat Penarikan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {withdrawals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Belum ada riwayat penarikan</p>
                ) : (
                  <div className="space-y-3">
                    {withdrawals.map((withdrawal: any) => (
                      <div key={withdrawal.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{formatCurrency(withdrawal.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {withdrawal.bank_name} - {withdrawal.account_number}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(withdrawal.created_at).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
