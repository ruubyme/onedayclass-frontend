import Image from "next/image";
import StarIconImage from "../public/images/starIcon.svg";
import { useEffect, useState } from "react";
import { flaskAPI } from "../pages/api";
import { useAuthToken } from "./useAuthToken";
import { toast } from "react-toastify";

interface BookMarkButtonProps {
  userId: number;
  classId: number;
}

const BookMarkButton: React.FC<BookMarkButtonProps> = ({ userId, classId }) => {
  const [isBookMark, setIsBookMark] = useState(false);
  useAuthToken();

  /**북마크 상태 조회 */
  const fetchBookMarkStatus = async () => {
    if (userId) {
      try {
        const response = await flaskAPI.get(
          `/user/${userId}/bookmarks?classId=${classId}`
        );
        const responseData = response.data;
        if (responseData.status === "success") {
          setIsBookMark(responseData.data);
        } else {
          console.error("Server Error: ", responseData.message);
        }
      } catch (error) {
        console.error("사용자 북마크 정보 요청 에러: ", error);
      }
    }
  };

  /**북마크 추가 */
  const fetchAddBookmark = async () => {
    try {
      const response = await flaskAPI.post(`/user/${userId}/bookmarks`, {
        classId: classId,
      });
      const responseData = response.data;
      if (responseData.status === "success") {
        toast.success("북마크에 추가되었습니다.");
      } else {
        console.error("Server Error: ", responseData.message);
        toast.error("오류가 발생했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      toast.error("오류가 발생했습니다. 다시 시도해주세요.");
      console.error("사용자 북마크 설정 에러", error);
    }
  };

  /**북마크 삭제 */
  const fetchRemoveBookmark = async () => {
    try {
      const response = await flaskAPI.delete(
        `/user/${userId}/bookmarks/${classId}`
      );
      const responseData = response.data;
      if (responseData.status === "success") {
        toast.success("북마크가 삭제되었습니다.");
      } else {
        console.error("Server Error: ", responseData.message);
        toast.error("오류가 발생했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      toast.error("오류가 발생했습니다. 다시 시도해주세요.");
      console.error("사용자 북마크 설정 에러", error);
    }
  };

  const handleBookmarkToggle = () => {
    if (!userId) {
      toast.error("해당 기능은 로그인이 필요합니다.");
      return;
    }

    if (isBookMark) {
      fetchRemoveBookmark();
    } else {
      fetchAddBookmark();
    }
    setIsBookMark((prev) => !prev);
  };

  useEffect(() => {
    fetchBookMarkStatus();
  }, []);
  return (
    <button onClick={handleBookmarkToggle}>
      <div className="w-10 h-10 relative">
        <Image
          src={StarIconImage}
          layout="fill"
          objectFit="cover"
          alt="bookmarkButton"
          className={isBookMark ? "" : "grayscale"}
        />
      </div>
    </button>
  );
};

export default BookMarkButton;
