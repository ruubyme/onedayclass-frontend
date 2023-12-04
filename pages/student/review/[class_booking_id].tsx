import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/router";
import { useState } from "react";
import { fetchClassAddtionalData, fetchClassDate, flaskAPI } from "../../api";
import Rating from "../../../components/Rating";
import { GetServerSidePropsContext } from "next";
import { weekdays } from "@/data/weekdatsData";
import { toast } from "react-toastify";

interface ReviewWritePageProps {
  className: string;
  classDate: Date;
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const classId = Number(context.query.classId);
  const classDateId = Number(context.query.classDateId);
  const classDetailResponse = await fetchClassAddtionalData(classId);
  const className = classDetailResponse["class_name"];
  const classDateResponse = await fetchClassDate(classDateId);
  const classDate = classDateResponse.class_date;

  return {
    props: {
      className,
      classDate,
    },
  };
};

const ReviewWritePage: React.FC<ReviewWritePageProps> = ({
  className,
  classDate,
}) => {
  const router = useRouter();
  const bookingId = Number(router.query.class_booking_id);
  const classId = Number(router.query.classId);
  const classDateId = Number(router.query.classDateId);
  const { userId } = useUser();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**예약시간 표기 변환 */
  const formatDate = (dateStr: Date) => {
    const date = new Date(dateStr);
    const weekday = weekdays[date.getUTCDay()];

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 1을 더함
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${weekday} ${hours}:${minutes}`;
  };

  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await flaskAPI.post("/reviews", {
        classId,
        userId,
        classDateId,
        rating,
        comment,
        bookingId,
      });

      const responseData = response.data;
      if (responseData.status === "success") {
        toast.success("리뷰가 등록되었습니다.");
        router.push("/student/myPage");
      } else {
        toast.error(responseData.message);
        console.log("Server Error: ", response.data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleReviewSubmit}>
      <div className="bg-gray-200 p-8">
        <h2 className="text-xl font-bold mb-4 text-gray-500">리뷰 작성</h2>
        <div className="bg-white p-6 rounded-md shadow-md max-w-xl mx-auto">
          <h3>{className}</h3>
          <div className="text-blue-500 text-sm">{formatDate(classDate)}</div>
          <div onClick={() => setRating(0)} className="pb-2">
            <Rating value={rating} onSelect={setRating} />
          </div>
          <textarea
            name="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full h-60 p-3 border rounded-md shadow-sm focus:outline-none focus:border-blue-400 resize-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 bg-blue-500 text-white py-1 px-4 rounded-md hover:bg-blue-600"
          >
            등록
          </button>
        </div>
      </div>
    </form>
  );
};

export default ReviewWritePage;
