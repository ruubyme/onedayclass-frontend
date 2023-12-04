import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { flaskAPI } from "../../api";

const PaymentSuccessPage = () => {
  const router = useRouter();
  const { classDateId, pg_token } = router.query;

  useEffect(() => {
    const confirmPayment = async () => {
      console.log(pg_token, classDateId);
      if (!pg_token || !classDateId) {
        return;
      }

      try {
        const response = await flaskAPI.post(
          `/${classDateId}/payment/success`,
          {
            pg_token: pg_token,
            paymentId: localStorage.getItem("paymentId"),
          }
        );
        const responseData = response.data;

        if (responseData.status === "success") {
          localStorage.removeItem("paymentId");
          toast.success("결제가 성공적으로 완료되었습니다.");
        } else {
          toast.error(responseData.message);
        }
      } catch {
        toast.error("결제 확인 중 오류가 발생했습니다. 다시 시도해주세요.");
      } finally {
        router.push(`/`);
      }
    };
    confirmPayment();
  }, [pg_token, classDateId]);
};

export default PaymentSuccessPage;
