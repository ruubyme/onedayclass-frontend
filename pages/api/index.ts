import { reviewType } from "@/types/classTypes";
import axios from "axios";

const flaskAPI = axios.create({
  baseURL: "http://onedayclassbackend-production.up.railway.app/api",
});

/**instructor 의 myClass 리스트 가져오기 */
export const fetchMyClassList = async (id: number) => {
  try {
    const response = await flaskAPI.get(`/get_classes_by_instructor?id=${id}`);
    const responseData = response.data;
    if (responseData.status === "success") {
      return responseData.data;
    } else {
      console.error("Server Error: ", responseData.message);
      return [];
    }
  } catch (error) {
    console.error("Error, error");
    return [];
  }
};

/**user 정보 가져오기 */
export const fetchMyInfo = async (userId: number) => {
  try {
    const response = await flaskAPI.get(`/users/${userId}`);
    const responseData = response.data;
    if (responseData.status === "error") {
      console.error("Server Error: ", responseData.message);
      return {};
    }
    return responseData.data;
  } catch (error) {
    console.error("사용자 정보 요청 에러: ", error);
    return {};
  }
};

/**user가 예약한 예약정보 모두 가져오기 */
export const fetchMyReservation = async (userId: number) => {
  try {
    const response = await flaskAPI.get(`/class/${userId}/booking`);
    const responseData = response.data;
    if (responseData.status === "error") {
      console.error("Server Error: ", responseData.message);
      return [];
    }
    return responseData.data;
  } catch (error) {
    console.error("정보 요청 에러: ", error);
    return [];
  }
};

/**class_date_id로 class_date 조회하기 */
export const fetchClassDate = async (classDateId: number) => {
  try {
    const response = await flaskAPI.get(`/${classDateId}/dates`);
    const responseData = response.data;
    if (responseData.status === "error") {
      console.error("Server Error: ", responseData.message);
      return "";
    }
    return responseData.data;
  } catch (error) {
    console.error("예약시간 정보 요청 에러: ", error);
    return "";
  }
};

/**class_id로 모든 class_date 가져오기 */
export const fetchClassDateByClassId = async (classId: number) => {
  try {
    const response = await flaskAPI.get(`/class_dates/${classId}`);
    const responseData = response.data;
    if (responseData.status === "success") {
      return responseData.all_class_dates;
    } else {
      console.error("Server Error: ", responseData.message);
      return [];
    }
  } catch (error) {
    console.error("예약시간 정보 요청 에러: ", error);
    return [];
  }
};

/**class_id로 간단 정보 조회 */
export const fetchClassAddtionalData = async (classId: number) => {
  try {
    const response = await flaskAPI.get(`/class_additional_data/${classId}`);
    const responseData = response.data;
    if (responseData.status === "error") {
      console.error("Server Error: ", responseData.message);
      return {};
    }
    return responseData.data;
  } catch (error) {
    console.error("class 정보 요청 에러: ", error);
    return {};
  }
};

/**class_date_id로 클래스 정보 조회 */
export const fetchClassAddtionalDataByClassDateId = async (
  classDateId: number
) => {
  const defaultData = {
    class_name: "",
    cost: "",
    class_date: "",
  };
  try {
    const response = await flaskAPI.get(`/${classDateId}/classId`);
    const responseData = response.data;
    if (responseData.status === "error") {
      console.error("Server Error: ", responseData.message);
      return defaultData;
    }
    const { class_id } = responseData.data;
    const [classData, classDate] = await Promise.all([
      fetchClassAddtionalData(class_id),
      fetchClassDate(class_id),
    ]);

    return {
      ...classData,
      ...classDate,
    };
  } catch (error) {
    console.error("Error fetching class data: ", error);
    return defaultData;
  }
};

/**특정 유저 혹은 특정 클래스의 리뷰 모두 가져오기 */
export const fetchReviewList = async ({
  userId,
  classId,
}: {
  userId?: number;
  classId?: number;
}) => {
  try {
    let url = "/reviews";
    if (userId) {
      url += `?userId=${userId}`;
    }
    if (classId) {
      url += `?classId=${classId}`;
    }

    const response = await flaskAPI.get(url);
    const responseData = response.data;
    if (responseData.status === "error") {
      console.error("Server Error: ", responseData.message);
      return [];
    }
    const reviews: reviewType[] = responseData.data;
    return reviews;
  } catch (error) {
    console.error("review 정보 요청 에러: ", error);
    return [];
  }
};

export { flaskAPI };
