import { classBookingType } from "@/types/classTypes";
import { useEffect, useState } from "react";
import { fetchMyReservation } from "../pages/api";
import { weekdays } from "@/data/weekdatsData";
import Link from "next/link";
import { useRouter } from "next/router";
import { useUser } from "@/contexts/UserContext";
import Spinner from "./Spinner";

interface DetailReservationsType extends classBookingType {
  class_name: string;
  class_description: string;
  class_date: Date;
  has_reviewed: boolean;
}

/**예약시간 표기 변환 */
export const formatDate = (dateStr: Date) => {
  const date = new Date(dateStr);
  const weekday = weekdays[date.getUTCDay()];

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 1을 더함
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${weekday} ${hours}:${minutes}`;
};

const MyReservationContent: React.FC = () => {
  const [myReservationList, setMyReservationList] = useState<
    DetailReservationsType[]
  >([]);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { userId } = useUser();

  /**추가정보 가져오기 (클래스 정보, 예약시간) */
  const reservationLoadData = async () => {
    try {
      setIsLoading(true);
      if (userId) {
        const reservationData: DetailReservationsType[] =
          await fetchMyReservation(userId);

        setMyReservationList(reservationData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**라디오 버튼 상태에 따라 예약 목록 필터링 */
  const filteredReservations = myReservationList.filter((reservation) => {
    return filterStatus === reservation.status;
  });

  useEffect(() => {
    reservationLoadData();
  }, []);
  return (
    <div className="bg-gray-200 p-8">
      <h2 className="text-xl font-bold mb-4 text-gray-500 max-w-xl mx-auto">
        내 예약확인
      </h2>
      <div className="bg-white p-6 rounded-md shadow-md max-w-xl mx-auto">
        <div className="space-x-5 text-gray-600">
          <input
            type="radio"
            value="pending"
            name="status"
            onChange={(e) => setFilterStatus(e.target.value)}
            defaultChecked
          />
          예약중
          <input
            type="radio"
            value="cancelled"
            name="status"
            onChange={(e) => setFilterStatus(e.target.value)}
          />
          예약취소
          <input
            type="radio"
            value="confirmed"
            name="status"
            onChange={(e) => setFilterStatus(e.target.value)}
          />
          예약확정
        </div>
        {isLoading ? (
          <Spinner />
        ) : (
          filteredReservations.map((reservation, index) => (
            <div key={index} className="my-2 p-2 border bg-white rounded-lg">
              <Link href={`/student/class_detail/${reservation.class_id}`}>
                {/* 예약정보 */}
                <h3 className="font-bold text-gray-600">
                  {reservation.class_name}
                </h3>
                <div className="pb-2 text-sm text-gray-600">
                  {reservation.class_description}
                </div>
              </Link>
              <div className="text-sm text-blue-500 border-t pt-2 flex">
                {reservation.class_date && formatDate(reservation.class_date)}
                {reservation.status === "pending" ? (
                  <>
                    <div className="bg-green-200 text-green-500 rounded ml-5 px-1">
                      예약 중
                    </div>
                    <div className="flex items-center ml-auto space-x-2">
                      <button
                        onClick={() =>
                          router.push({
                            pathname: `/payment/${reservation.class_date_id}`,
                          })
                        }
                        className="bg-blue-200 text-blue-500 rounded px-1"
                      >
                        결제하기
                      </button>
                    </div>
                  </>
                ) : reservation.status === "confirmed" ? (
                  <>
                    <div className="bg-green-200 text-green-500 rounded ml-5 px-1">
                      예약 확정
                    </div>
                    {/* 수업 날짜가 현재보다 이전이면 리뷰 작성 버튼 표시 */}
                    {reservation.class_date &&
                      new Date(reservation.class_date) < new Date() &&
                      (reservation.has_reviewed ? (
                        <div className="ml-auto bg-gray-400 text-gray-300 rounded px-1">
                          작성완료
                        </div>
                      ) : (
                        <button
                          className="ml-auto bg-blue-200 rounded px-1"
                          onClick={() =>
                            router.push({
                              pathname: `/student/review/${reservation.id}`,
                              query: {
                                classId: reservation.class_id,
                                classDateId: reservation.class_date_id,
                              },
                            })
                          }
                        >
                          리뷰작성
                        </button>
                      ))}
                  </>
                ) : reservation.status === "cancelled" ? (
                  <div className="bg-red-200 text-red-500 rounded ml-5 px-1">
                    예약 취소
                  </div>
                ) : (
                  "오류"
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyReservationContent;
