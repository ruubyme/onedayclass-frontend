import { reviewType } from "@/types/classTypes";
import Rating from "./Rating";
import { formatDate } from "./MyReservationContent";
import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface ClassReviewContentProps {
  reviewList: reviewType[];
}

SwiperCore.use([Navigation, Pagination]);

const ClassReviewContent: React.FC<ClassReviewContentProps> = ({
  reviewList,
}) => {
  const swiperRef = useRef<SwiperCore>();

  return (
    <div>
      <div className="text-sm">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          navigation={true}
          scrollbar={{ draggable: true }}
          pagination={{
            type: "fraction",
          }}
        >
          {reviewList.length === 0 ? (
            <div>작성된 후기가 없습니다.</div>
          ) : (
            <>
              {reviewList.map((review) => (
                <SwiperSlide key={review.id}>
                  <div className="bg-gray-500 bg-opacity-25 rounded p-2 mb-2">
                    <h3 className="font-bold">수강생 후기</h3>
                    <Rating value={review.rating} />
                    <div className="text-blue-700">
                      {formatDate(review.created_at)}
                    </div>
                    <div>{review.comment}</div>
                  </div>
                  {review.instructor_comment && (
                    <div className="my-2 p-2 border bg-blue-200 rounded-lg relative">
                      <div className="speech-bubble-tail"></div>
                      <h3 className="font-bold">강사님</h3>
                      <div>{review.instructor_comment}</div>
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </>
          )}
        </Swiper>
      </div>
    </div>
  );
};

export default ClassReviewContent;
