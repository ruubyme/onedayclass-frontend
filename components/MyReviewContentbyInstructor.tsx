import { useUser } from "@/contexts/UserContext";
import { ClassForm, reviewType } from "@/types/classTypes";
import { useState, useEffect } from "react";
import {
  fetchClassAddtionalData,
  fetchClassDate,
  fetchMyClassList,
  fetchReviewList,
  flaskAPI,
} from "../pages/api";
import Rating from "./Rating";
import { formatDate } from "./MyReservationContent";
import { renderContent } from "../pages/student/class_detail/[class_id]";
import InstructorComment from "./InstructorComment";
import { toast } from "react-toastify";
import Spinner from "./Spinner";

const MyReviewContentByInstructor: React.FC = () => {
  const { userId } = useUser();
  const [myReviewList, setMyReviewList] = useState<reviewType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMyReviewList = async () => {
    if (userId) {
      try {
        setIsLoading(true);
        const classListData: ClassForm[] = await fetchMyClassList(userId);
        const allReviews = await Promise.all(
          classListData.map(async (classItem) =>
            fetchReviewList({ classId: classItem.classId })
          )
        );
        setMyReviewList(allReviews.flat());
      } catch (error) {
        console.error("리뷰 요청 에러: ", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  /**comment 작성 */
  const handleInstructorCommentSubmit = async (
    reviewId: number,
    newComment: string
  ) => {
    try {
      const data = {
        comment: newComment,
      };

      const response = await flaskAPI.post(
        `${reviewId}/instructor_comment`,
        data
      );
      const responseData = response.data;

      if (responseData.status === "success") {
        setMyReviewList((prevReview) =>
          prevReview.map((review) =>
            review.id === reviewId
              ? { ...review, instructor_commnet: newComment }
              : review
          )
        );
        toast.success("댓글이 성공적으로 저장되었습니다.");
      } else {
        console.error("Server Error: ", responseData.message);
        toast.error("댓글 작성에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Error submitting comment: ", error);
      toast.error("댓글 작성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  /**comment 삭제 */
  const handleDeleteInstructorComment = async (reviewId: number) => {
    try {
      const response = await flaskAPI.delete(`${reviewId}/instructor_comment`);
      const responseData = response.data;
      if (responseData.status === "success") {
        toast.success("댓글이 삭제되었습니다.");

        //myReviewList 상태 업데이트
        setMyReviewList((prevReviews) =>
          prevReviews.map((review) => {
            if (review.id === reviewId) {
              return { ...review, instructor_comment: null };
            }
            return review;
          })
        );
      } else {
        console.error("Server Error: ", responseData.message);
        toast.error("댓글 삭제에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Error deleting comment: ", error);
      toast.error("댓글 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    fetchMyReviewList();
  }, [userId]);

  return (
    <div className="bg-gray-200 p-8">
      <h2 className="text-xl font-bold mb-4 text-gray-500 max-w-xl mx-auto">
        수강생들의 리뷰
      </h2>
      <div className="max-w-xl mx-auto">
        {isLoading ? (
          <Spinner />
        ) : myReviewList.length === 0 ? (
          <div>작성된 리뷰가 없습니다.</div>
        ) : (
          <div>
            {myReviewList.map((review, index) => (
              <div key={index} className="pb-2">
                <div className="my-2 p-2 border bg-white rounded-lg">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-gray-600">
                      {review.class_name}
                    </h3>
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
                <InstructorComment
                  review={review}
                  onCommentSubmit={handleInstructorCommentSubmit}
                  onDeleteComment={handleDeleteInstructorComment}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviewContentByInstructor;
