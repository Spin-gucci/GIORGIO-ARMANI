"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AuthPage() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regInvitationCode, setRegInvitationCode] = useState("");
  const [agentInfo, setAgentInfo] = useState<{ valid: boolean; agentName?: string } | null>(null);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("currentUser");
      }
    }
  }, []);

  // Verify invitation code when it changes
  useEffect(() => {
    const verifyCode = async () => {
      if (regInvitationCode.length < 3) {
        setAgentInfo(null);
        return;
      }
      
      setVerifyingCode(true);
      try {
        const response = await fetch(`/api/verify-invitation/${encodeURIComponent(regInvitationCode)}`);
        const data = await response.json();
        setAgentInfo(data);
      } catch {
        setAgentInfo({ valid: false });
      }
      setVerifyingCode(false);
    };

    const debounce = setTimeout(verifyCode, 500);
    return () => clearTimeout(debounce);
  }, [regInvitationCode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        const user = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        };
        setCurrentUser(user);
        localStorage.setItem("currentUser", JSON.stringify(user));
        setMessage({ type: "success", text: `Selamat datang, ${data.user.name}!` });
      } else {
        setMessage({ type: "error", text: data.message || "Email atau password salah" });
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan saat login" });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentInfo?.valid) {
      setMessage({ type: "error", text: "Silakan masukkan kode undangan yang valid dari Agent" });
      return;
    }

    setIsRegistering(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          invitationCode: regInvitationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message || "Akun Anda sedang menunggu persetujuan Admin." });
        // Clear form
        setRegName("");
        setRegEmail("");
        setRegPhone("");
        setRegPassword("");
        setRegInvitationCode("");
        setAgentInfo(null);
      } else {
        setMessage({ type: "error", text: data.message || "Terjadi kesalahan saat mendaftar" });
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan saat mendaftar" });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    setMessage({ type: "success", text: "Berhasil keluar" });
  };

  // If user is logged in, show dashboard based on role
  if (currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img 
              src="/download.png" 
              alt="Giorgio Armani" 
              className="h-24 w-24 mx-auto mb-4"
            />
            <h2 className="text-xl font-semibold">Selamat Datang, {currentUser.name}!</h2>
            <p className="text-muted-foreground capitalize">Role: {currentUser.role}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Anda telah berhasil login. Panel {currentUser.role} akan segera tersedia.
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              Keluar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-0">
          <div className="flex justify-center mb-2">
            <img 
              src="/download.png" 
              alt="Giorgio Armani" 
              className="h-40 w-40"
            />
          </div>          
        </CardHeader>
        <CardContent>
          {message && (
            <div className={`mb-4 p-3 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}`}>
              {message.text}
            </div>
          )}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">
                <LogIn className="h-4 w-4 mr-2" />
                Masuk
              </TabsTrigger>
              <TabsTrigger value="register">
                <UserPlus className="h-4 w-4 mr-2" />
                Daftar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    placeholder="nama@email.com" 
                    required 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password" 
                    type="password" 
                    required 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Masuk Sekarang"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-invitation">Kode Undangan</Label>
                  <div className="relative">
                    <Input 
                      id="reg-invitation" 
                      placeholder="Masukkan kode dari Agent Anda" 
                      required 
                      value={regInvitationCode}
                      onChange={(e) => setRegInvitationCode(e.target.value.toUpperCase())}
                      className={agentInfo?.valid ? "border-green-500 pr-10" : agentInfo === null ? "" : "border-red-500 pr-10"}
                    />
                    {verifyingCode && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {!verifyingCode && agentInfo?.valid && (
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                    {!verifyingCode && agentInfo && !agentInfo.valid && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {agentInfo?.valid && agentInfo.agentName && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Terdaftar di bawah Agent: <strong>{agentInfo.agentName}</strong>
                    </p>
                  )}
                  {agentInfo && !agentInfo.valid && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Kode undangan tidak ditemukan
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Nama Lengkap</Label>
                  <Input 
                    id="reg-name" 
                    placeholder="Masukkan nama sesuai KTP" 
                    required 
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input 
                    id="reg-email" 
                    type="email" 
                    placeholder="nama@email.com" 
                    required 
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Nomor Telepon (WhatsApp)</Label>
                  <Input 
                    id="reg-phone" 
                    placeholder="0812..." 
                    required 
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input 
                    id="reg-password" 
                    type="password" 
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Minimal 6 karakter</p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isRegistering || !agentInfo?.valid}
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Daftar Akun Kerja"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col text-center space-y-2">
          <p className="text-xs text-muted-foreground italic">
            Copyright 2026 Giorgio Armani S.p.A. - All Rights Reserved
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
