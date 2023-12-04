import { useUser } from "@/contexts/UserContext";
import MypageTabContainer from "../../components/MypageTabContainer";
import { useAuthToken } from "../../components/useAuthToken";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "react-toastify";

const MyPage: React.FC = () => {
  useAuthToken();
  const { userId } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (!userId) {
      router.push("/");
      toast.error("로그인이 필요한 기능입니다.");
    }
  }, [userId]);

  return (
    <div>
      <div>
        <MypageTabContainer />
      </div>
    </div>
  );
};

export default MyPage;
