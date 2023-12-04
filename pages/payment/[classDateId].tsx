import { useRouter } from "next/router";
import { useState } from "react";
import { fetchClassAddtionalDataByClassDateId, flaskAPI } from "../api";
import { toast } from "react-toastify";
import { GetServerSidePropsContext } from "next";
import { formatDate } from "../../components/MyReservationContent";

export interface classDataResponseType {
  class_name: string;
  class_date: Date;
  cost: string;
}

interface PaymentPageProps {
  classInfo: classDataResponseType;
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const classDateId = Number(context.query.classDateId);
  const classDataResponse: classDataResponseType =
    await fetchClassAddtionalDataByClassDateId(classDateId);

  return {
    props: {
      classInfo: classDataResponse,
    },
  };
};

const PaymentPage: React.FC<PaymentPageProps> = ({ classInfo }) => {
  const router = useRouter();
  const { classDateId } = router.query;

  const handlePayment = async () => {
    try {
      const response = await flaskAPI.post(`/${classDateId}/payment`);
      const responseData = response.data;
      if (responseData.status === "success") {
        localStorage.setItem("paymentId", responseData.data.paymentId);
        window.location.href = responseData.data.next_redirect_pc_url;
      } else {
        console.error("Server Error: ", responseData.message);
        toast.error(responseData.message);
      }
    } catch (error) {
      console.error("결제 요청 에러: ", error);
      toast.error("결제 요청에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-10 bg-gray-100 rounded-md shadow-md mt-4">
      {classInfo ? (
        <div>
          <h1 className="text-2xl font-bold mb-4 text-gray-700">결제 정보</h1>
          <div className="grid grid-cols-1 grid-rows-3 gap-2 border rounded-t-md p-2">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">
              {classInfo.class_name}
            </h2>
            <p className="text-blue-500 mb-2">
              {formatDate(classInfo.class_date)}
            </p>
            <p className="text-lg font-bold mb-4 text-gray-700">
              결제금액: {classInfo.cost} 원
            </p>
          </div>
          <button
            className="rounded-md hover:bg-blue-300 "
            onClick={handlePayment}
          >
            결제하기
          </button>
        </div>
      ) : (
        <p className="text-gray-600">클래스 정보를 불러오는 중 ...</p>
      )}
    </div>
  );
};

export default PaymentPage;
