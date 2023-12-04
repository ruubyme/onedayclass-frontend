import { useRouter } from "next/router";
import { useEffect } from "react";
import { destroyCookie } from "nookies";
import { useUser } from "@/contexts/UserContext";

const Logout: React.FC = () => {
  const router = useRouter();
  const { logout } = useUser();

  useEffect(() => {
    logout();
    //쿠키에서 'token'을 제거함
    destroyCookie(null, "token");

    //localStorage 전체 삭제
    localStorage.clear();

    //메인페이지로 redirection
    router.push("/");
  }, []);

  return <div>Logout ...</div>;
};

export default Logout;
