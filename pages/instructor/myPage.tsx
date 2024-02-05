import { useUser } from "@/contexts/UserContext";
import MypageTabContainerByInstructor from "../../components/MypageTabContainerByInstructor";
import { useAuthToken } from "../../components/useAuthToken";
import { useEffect } from "react";
import { useRouter } from "next/router";
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
  });
  return (
    <div>
      <MypageTabContainerByInstructor />
    </div>
  );
};

export default MyPage;
