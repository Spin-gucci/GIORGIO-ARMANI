"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  LogOut,
  User,
  Check,
  X
} from "lucide-react"
import type { User as UserType } from "@/lib/auth"

interface AgentDashboardProps {
  user: UserType
  deposits: any[]
  withdrawals: any[]
  stats: any
}

export function AgentDashboard({ user, deposits, withdrawals, stats }: AgentDashboardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(typeof amount === "string" ? parseFloat(amount) : amount)
  }

  const handleTransaction = async (type: 'deposit' | 'withdrawal', id: number, action: 'approve' | 'reject') => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/${type}s/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action === 'approve' ? 'approved' : 'rejected' }),
      })

      if (res.ok) {
        setSuccess(`Transaksi berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}`)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || "Terjadi kesalahan")
      }
    } catch (err) {
      setError("Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold">{user.fullName}</p>
              <p className="text-sm text-muted-foreground">Agent</p>
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
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Pending Deposits</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.pending_deposits}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-muted-foreground">Pending Withdrawals</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.pending_withdrawals}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="deposits" className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="deposits" className="flex-1">
              <ArrowDownCircle className="h-4 w-4 mr-2" />Deposits
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex-1">
              <ArrowUpCircle className="h-4 w-4 mr-2" />Withdrawals
            </TabsTrigger>
          </TabsList>

          {/* Deposits Tab */}
          <TabsContent value="deposits">
            <Card>
              <CardHeader>
                <CardTitle>Deposit Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deposits.map((d: any) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-medium">{d.full_name}</TableCell>
                          <TableCell>{formatCurrency(d.amount)}</TableCell>
                          <TableCell>{getStatusBadge(d.status)}</TableCell>
                          <TableCell>{new Date(d.created_at).toLocaleDateString("id-ID")}</TableCell>
                          <TableCell>
                            {d.status === "pending" && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="default" onClick={() => handleTransaction('deposit', d.id, 'approve')} disabled={loading}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleTransaction('deposit', d.id, 'reject')} disabled={loading}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Bank</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((w: any) => (
                        <TableRow key={w.id}>
                          <TableCell className="font-medium">{w.full_name}</TableCell>
                          <TableCell>{formatCurrency(w.amount)}</TableCell>
                          <TableCell>{w.bank_name} - {w.account_number}</TableCell>
                          <TableCell>{getStatusBadge(w.status)}</TableCell>
                          <TableCell>
                            {w.status === "pending" && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="default" onClick={() => handleTransaction('withdrawal', w.id, 'approve')} disabled={loading}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleTransaction('withdrawal', w.id, 'reject')} disabled={loading}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
