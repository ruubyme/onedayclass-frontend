import { reviewType } from "@/types/classTypes";
import { useState, useEffect } from "react";
import { formatDate } from "./MyReservationContent";
import Rating from "./Rating";
import { fetchReviewList, flaskAPI } from "../pages/api";
import { renderContent } from "../pages/student/class_detail/[class_id]";
import { useUser } from "@/contexts/UserContext";
import Spinner from "./Spinner";
import { toast } from "react-toastify";

const MyReviewContent: React.FC = () => {
  const [myReviewList, setMyReviewList] = useState<reviewType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useUser();

  const fetchMyReviewList = async () => {
    try {
      if (userId) {
        setIsLoading(true);
        const reviewListData = await fetchReviewList({ userId: userId });
        setMyReviewList(reviewListData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    const isConfirmed = window.confirm("리뷰를 삭제하시겠습니까?");

    if (!isConfirmed) return;

    try {
      const response = await flaskAPI.delete(`reviews/${reviewId}`);
      const responseData = response.data;
      if (responseData.status === "success") {
        toast.success("리뷰가 삭제되었습니다.");
        setMyReviewList((currentReviews) =>
          currentReviews.filter((review) => review.id !== reviewId)
        );
      } else {
        console.error("Server Error: ", responseData.message);
      }
    } catch (error) {
      console.error("리뷰 삭제 요청 에러: ", error);
    }
  };

  useEffect(() => {
    fetchMyReviewList();
  }, [userId]);

  return (
    <div className="bg-gray-200 p-8">
      <h2 className="text-xl font-bold mb-4 text-gray-500">내가 작성한 리뷰</h2>
      <div>
        {isLoading ? (
          <Spinner />
        ) : myReviewList.length === 0 ? (
          <div>작성된 리뷰가 없습니다.</div>
        ) : (
          <>
            {myReviewList.map((review, index) => (
              <div key={index}>
                <div className="my-2 p-2 border bg-white rounded-lg">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-gray-600">
                      {review.class_name}
                    </h3>
                    <button
                      className="bg-gray-200 rounded-lg px-1 text-sm text-gray-500"
                      onClick={() => handleDeleteReview(review.id)}
                    >
                      삭제
                    </button>
                  </div>
                  <div>
                    <span className="pb-2 text-sm text-gray-600">수강날짜</span>
                    <span className="text-sm text-blue-500">
                      {formatDate(review.class_date)}
                    </span>
                  </div>
                  <div>
                    <span className="pb-2 text-sm text-gray-600">작성날짜</span>
                    <span className="text-sm text-blue-500">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <Rating value={review.rating} />
                    <div>{renderContent(review.comment)}</div>
                  </div>
                </div>

                {review.instructor_comment && (
                  <div className="my-2 p-2 border bg-blue-200 rounded-lg relative">
                    <div className="speech-bubble-tail"></div>
                    <h3 className="font-bold">강사님</h3>
                    <div>{review.instructor_comment}</div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default MyReviewContent;
