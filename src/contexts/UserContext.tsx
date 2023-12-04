import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuthToken } from "../../components/useAuthToken";
interface UserContextType {
  isLogin: boolean;
  userId: number | null;
  role: string | null;
  login: (id: number, role: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);

  //useAuthToken훅을 사용하여 사용자 정보 가져오기
  const { user } = useAuthToken();

  useEffect(() => {
    if (user) {
      setIsLogin(true);
      setUserId(user.id);
      setRole(user.role);
    } else {
      setIsLogin(false);
      setUserId(null);
      setRole(null);
    }
  }, [user]);

  const login = (id: number, role: string) => {
    setIsLogin(true);
    setUserId(id);
    setRole(role);
  };

  const logout = () => {
    setIsLogin(false);
    setUserId(null);
    setRole(null);
  };

  return (
    <UserContext.Provider value={{ isLogin, userId, role, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser는 UserProvider 내에서 사용해야 합니다.");
  }
  return context;
};
