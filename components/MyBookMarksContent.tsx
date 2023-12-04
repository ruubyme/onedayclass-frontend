import { useUser } from "@/contexts/UserContext";
import { flaskAPI } from "../pages/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import BookMarkButton from "./BookMarkButton";
import Spinner from "./Spinner";

interface BookmarkType {
  id: number;
  class_id: number;
  user_id: number;
  class_name?: string;
  class_description?: string;
}

const MyBookMarksContent: React.FC = () => {
  const { userId } = useUser();
  const [myBookmarkList, setMyBookmarkList] = useState<BookmarkType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBookmarkList = async () => {
    try {
      setIsLoading(true);
      const response = await flaskAPI.get(`/user/${userId}/bookmarks`);
      const responseData = response.data;
      if (responseData.status === "success") {
        const bookmarks = responseData.data;
        setMyBookmarkList(bookmarks);
      } else {
        console.error("Server Error: ", responseData.message);
      }
    } catch (error) {
      console.error("북마크 정보 요청 에러: ", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchBookmarkList();
  }, []);

  return (
    <div className="bg-gray-200 p-8">
      <h2 className="text-xl font-bold mb-4 text-gray-500 max-w-xl mx-auto">
        북마크
      </h2>
      {isLoading ? (
        <Spinner />
      ) : myBookmarkList.length === 0 ? (
        <div>북마크한 클래스가 없습니다.</div>
      ) : (
        <div className="bg-white p-6 rounded-md shadow-md max-w-xl mx-auto">
          {myBookmarkList.map((item, index) => (
            <div key={index} className="my-2 p-2 border bg-white rounded-lg">
              <Link href={`/student/class_detail/${item.class_id}`}>
                <h3 className="font-bold text-gray-600">{item.class_name}</h3>
                <div className="pb-2 text-sm text-blue-500">
                  {item.class_description}
                </div>
              </Link>
              <div className="text-sm text-blue-500 border-t pt-2 flex ">
                {userId && (
                  <BookMarkButton userId={userId} classId={item.class_id} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookMarksContent;
