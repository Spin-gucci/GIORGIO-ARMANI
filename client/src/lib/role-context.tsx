"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type UserRole = "master" | "admin" | "agent" | "customer";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface RoleContextType {
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
  isRefreshing: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<CurrentUser | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      try {
        setCurrentUserState(JSON.parse(stored));
      } catch {
        localStorage.removeItem("currentUser");
      }
    }
  }, []);

  const setCurrentUser = useCallback((user: CurrentUser | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, [setCurrentUser]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!currentUser) return false;
    
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setCurrentUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
          });
          return true;
        }
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [currentUser, setCurrentUser]);

  return (
    <RoleContext.Provider value={{ currentUser, setCurrentUser, logout, refreshSession, isRefreshing }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
