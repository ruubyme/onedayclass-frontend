import { ClassDetailInfoType, classDate, reviewType } from "@/types/classTypes";
import BookButton from "../../../components/BookButton";

import axios from "axios";
import { GetServerSidePropsContext } from "next";
import React, { useEffect, useRef, useState } from "react";
import TabBar from "../../../components/TabBar";
import { useKakaoMapScript } from "../../../components/useKakaoMapScript";
import { createStaticMap } from "../../../components/Map";
import { DecodedToken, useAuthToken } from "../../../components/useAuthToken";
import { parseCookies } from "nookies";
import jwtDecode from "jwt-decode";
import BookMarkButton from "../../../components/BookMarkButton";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/router";
import { fetchReviewList, flaskAPI } from "../../api";
import { toast } from "react-toastify";
import ClassReviewContent from "../../../components/ClassReviewContent";

interface ClassDetailPageProps {
  classDetailInfo: ClassDetailInfoType;
  initialClassDates: classDate[];
  reviewList: reviewType[];
  averageRating: number;
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const classId = context.query.class_id;
  const cookies = parseCookies(context);
  const token = cookies.token;
  let userId;

  if (token) {
    userId = jwtDecode<DecodedToken>(token).sub;
  }

  try {
    //class 추가 정보 가져오기
    const classDetailResponse = await flaskAPI.get(
      `/get_class_detail/${classId}`
    );
    const classDetailData = classDetailResponse.data;
    if (classDetailData.status === "error") {
      console.error("Server Error:", classDetailData.message);
    }

    //class 예약 가능한 시간 가져오기
    const queryParams = userId ? `?student_id=${userId}` : "";
    console.log(queryParams);
    const classDatesResponse = await flaskAPI.get(
      `/class_dates/${classId}${queryParams}`
    );
    const classDatesData = classDatesResponse.data;

    if (classDatesData.status === "error") {
      console.error("Server Error:", classDatesData.message);
    }

    //classReview 가져오기
    const reviewList = await fetchReviewList({ classId: Number(classId) });

    //평점계산
    const totalRating = reviewList.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const averageRating =
      reviewList.length > 0 ? (totalRating / reviewList.length).toFixed(2) : 0;

    return {
      props: {
        classDetailInfo: classDetailData.data,
        initialClassDates: classDatesData.all_class_dates,
        reviewList: reviewList,
        averageRating,
      },
    };
  } catch (error) {
    console.error("Error fetching data: ", error);
    return {
      props: {
        classDetailInfo: {
          className: "",
          description: "",
          location: "",
          cost: 0,
          targetStudents: [],
          content: "",
          curriculums: [],
          latitude: 0,
          longitude: 0,
        },
        initialClassDates: [],
        reviewList: [],
        averageRating: 0,
      },
    };
  }
};

/**content 줄바꿈 형식으로 바꾸기 */
export const renderContent = (content: string) => {
  return content.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));
};

const ClassDetailPage: React.FC<ClassDetailPageProps> = ({
  classDetailInfo,
  initialClassDates,
  reviewList,
  averageRating,
}) => {
  const sortClassDates = (dates: classDate[]) => {
    if (Array.isArray(dates)) {
      const currentDate = new Date();

      //지난 예약 날짜 제거
      const filteredDates = dates.filter(
        (date) => new Date(date.class_date) > currentDate
      );
      const sortedClassDates = [...filteredDates].sort((a, b) => {
        return (
          new Date(a.class_date).getTime() - new Date(b.class_date).getTime()
        );
      });
      return sortedClassDates;
    }
    return [];
  };

  useAuthToken();
  const { userId } = useUser();
  const router = useRouter();
  const classId = Number(router.query.class_id);

  const [classDates, setClassDates] = useState(
    sortClassDates(initialClassDates)
  );
  const introRef = useRef(null);
  const curriculumRef = useRef(null);
  const locationRef = useRef(null);
  const reviewRef = useRef(null);
  const reservationRef = useRef(null);

  const isScriptLoaded = useKakaoMapScript();
  /**TabBar에 필요한 데이터 */
  const tabs = [
    {
      name: "intro",
      label: "클래스 소개",
      ref: introRef,
    },
    ...(classDetailInfo.curriculums?.length > 0
      ? [
          {
            name: "curriculum",
            label: "커리큘럼",
            ref: curriculumRef,
          },
        ]
      : []),
    {
      name: "location",
      label: "위치",
      ref: locationRef,
    },
    {
      name: "review",
      label: "후기",
      ref: reviewRef,
    },
    {
      name: "reservation",
      label: "수업예약",
      ref: reservationRef,
    },
  ];

  /**클래스 예약하기 */
  const bookClass = async (classId: number, classDateId: number) => {
    try {
      const response = await flaskAPI.post("/class/booking", {
        classId,
        classDateId,
      });
      const responseData = response.data;
      if (responseData.status === "success") {
        toast.success("예약이 완료되었습니다.");
        setClassDates(responseData.data);

        //예약 성공 후 결제 진행 여부
        if (window.confirm("예약이 완료되었습니다. 결제를 진행하시겠습니까?")) {
          toast.dismiss();
          router.push(`/payment/${classDateId}`);
        }
      } else {
        toast.error(
          "예약 중 오류가 발생했습니다. 다시 시도해주세요. ServerError: " +
            responseData.message
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Booking error: ", error);
        if (error.response && error.response.status === 400) {
          toast.error(error.response.data.message);
        } else if (error.response && error.response.status === 401) {
          toast.error("로그인이 필요한 기능입니다.");
        } else {
          toast.error("예약 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
      }
    }
  };

  /**클래스 예약 취소하기 */
  const cancelReservation = async (classId: number, classDateId: number) => {
    const isConfirmed = window.confirm("예약을 취소하시겠습니까?");

    if (!isConfirmed) return;
    try {
      const response = await flaskAPI.patch("/class/booking", {
        classId,
        classDateId,
      });
      const responseData = response.data;

      if (responseData.status === "success") {
        toast.success("예약이 취소되었습니다.");
        setClassDates(responseData.data);
      } else {
        toast.error(
          "예약 취소 중 오류가 발생했습니다. 다시 시도해주세요. ServerError: " +
            responseData.message
        );
      }
    } catch (error) {
      toast.error("예약 취소 중 오류가 발생했습니다. 다시 시도해주세요.");
      console.error("CancleBook error: ", error);
    }
  };

  useEffect(() => {
    if (isScriptLoaded) {
      createStaticMap(classDetailInfo.latitude, classDetailInfo.longitude);
    }
  }, [classDetailInfo, isScriptLoaded]);

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <div className="text-2xl font-bold">{classDetailInfo.className}</div>
        <div className="text-lg">{classDetailInfo.description}</div>
        <div>
          비용 :
          {classDetailInfo.cost == null ? (
            <span> 가격문의</span>
          ) : (
            <span> 1회 {classDetailInfo.cost}원</span>
          )}
        </div>
        {userId && <BookMarkButton userId={userId} classId={classId} />}
      </div>

      {/* 클래스 정보들      */}
      <div className="bg-gray-100 rounded-md shadow space-y-10 relative">
        <div className="sticky top-0 z-50 bg-white">
          <TabBar tabs={tabs} />
        </div>
        {/* 클래스 소개 */}
        <div ref={introRef} className="space-y-10 ">
          <span className="relative">
            <span
              className="absolute inset-x-0 bottom-1 bg-blue-400 bg-opacity-40"
              style={{ height: "5px" }}
            ></span>
            <span className="text-xl font-semibold">클래스 소개</span>
          </span>
          <div>{renderContent(classDetailInfo.content)}</div>
          {classDetailInfo.targetStudents?.length !== 0 && (
            <div className="space-y-10">
              <span className="relative">
                <span
                  className="absolute inset-x-0 bottom-1 bg-blue-400 bg-opacity-40"
                  style={{ height: "5px" }}
                ></span>
                <span className="text-xl font-semibold">
                  이런 분들이 들으면 좋아요
                </span>
              </span>

              <ul className="max-w-md space-y-2  list-disc list-inside bg-blue-300 bg-opacity-30 rounded-xl p-1 py-3">
                {classDetailInfo.targetStudents.map((student, index) => (
                  <li key={index} className="text-gray-700">
                    {student}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {/* 커리큘럼 */}
        <div ref={curriculumRef}>
          {classDetailInfo.curriculums?.length !== 0 && (
            <div className="space-y-10">
              <span className="relative">
                <span
                  className="absolute inset-x-0 bottom-1 bg-blue-400 bg-opacity-40"
                  style={{ height: "5px" }}
                ></span>
                <span className="text-xl font-semibold">커리큘럼</span>
              </span>

              <ul className="max-w-md space-y-2 list-decimal list-inside bg-blue-300 bg-opacity-30 rounded-xl p-1 py-3">
                {classDetailInfo.curriculums.map((curriculum, index) => (
                  <li key={index} className="text-gray-700">
                    {curriculum}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {/* 위치 */}
        <div ref={locationRef} className="space-y-10">
          <span className="relative">
            <span
              className="absolute inset-x-0 bottom-1 bg-blue-400 bg-opacity-40 "
              style={{ height: "5px" }}
            ></span>
            <span className="text-xl font-semibold">위치</span>
          </span>
          <div className="space-y-3">
            <div className="text-gray-700">{classDetailInfo.location}</div>
            <div
              id="staticMap"
              style={{ width: "250px", height: "250px" }}
            ></div>
          </div>
        </div>
      </div>

      {/* 리뷰 */}
      <div ref={reviewRef} className="bg-gray-100 rounded-md shadow space-y-10">
        <span className="relative">
          <span
            className="absolute inset-x-0 bottom-1 bg-blue-400 bg-opacity-40 "
            style={{ height: "5px" }}
          ></span>
          <span className="text-xl font-semibold">후기</span>
        </span>
        <div className="space-x-2 space-y-2">
          <span>총 {reviewList.length} 건 /</span>
          <span className="text-gray-500">평점 {averageRating} 점</span>
          <ClassReviewContent reviewList={reviewList} />
        </div>
      </div>

      {/* 예약하기 */}
      <div
        ref={reservationRef}
        className="bg-gray-100 rounded-md shadow space-y-10"
      >
        <span className="relative">
          <span
            className="absolute inset-x-0 bottom-1 bg-blue-400 bg-opacity-40"
            style={{ height: "5px" }}
          ></span>
          <span className="text-xl mb-4 font-semibold">예약하기</span>
        </span>
        <div>
          {classDates?.length > 0 ? (
            classDates.map((date) => (
              <BookButton
                key={date.class_date_id}
                classDate={date}
                onClick={bookClass}
                onCancel={cancelReservation}
              />
            ))
          ) : (
            <div className="text-gray-700">등록된 수업 시간대가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassDetailPage;
