import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Role = "master" | "admin" | "agent" | "customer";

interface User {
  id: number;
  username: string;
  role: Role;
  email?: string;
}

interface RoleContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
  isRefreshing: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const refreshSession = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Simulate session refresh
      await new Promise((resolve) => setTimeout(resolve, 500));
      return true;
    } catch {
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        logout,
        refreshSession,
        isRefreshing,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
