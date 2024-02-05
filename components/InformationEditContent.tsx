import { useUser } from "@/contexts/UserContext";
import { useState, useEffect } from "react";
import { useKakaoMapScript } from "./useKakaoMapScript";
import { UserInformationType } from "@/types/userTypes";
import { fetchMyInfo, flaskAPI } from "../pages/api";
import Script from "next/script";
import { InformationAddress } from "../pages/signup";
import { useForm } from "react-hook-form";
import { useAuthToken } from "./useAuthToken";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

interface PasswordChangeType {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const InformationEditContent: React.FC = () => {
  const defaultInformation = {
    name: "",
    email: "",
    password: "",
    phone_number: "",
    address: "",
    zonecode: "",
    role: "",
    address_detail: "",
  };
  const [userInfoData, setUserInfoData] =
    useState<UserInformationType>(defaultInformation);
  useKakaoMapScript();
  useAuthToken();
  const router = useRouter();
  const [isPasswordEdited, setIspasswordEdited] = useState(false);
  const { userId } = useUser();
  const {
    register: registerUserInfo,
    formState: { errors: userInfoErrors },
    setValue,
    handleSubmit: handleUserInfoSubmit,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      ...defaultInformation,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    getValues,
    reset,
    formState: { errors: passwordErrors },
  } = useForm<PasswordChangeType>({
    mode: "onBlur",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  /**사용자 정보 가져오기 */
  const fetchUserInformation = async () => {
    if (userId) {
      const userInformation = await fetchMyInfo(userId);
      setUserInfoData(userInformation);
      //userForm 필드 값 업데이트
      Object.keys(userInformation).forEach((key) => {
        setValue(key as keyof UserInformationType, userInformation[key]);
      });
    }
  };

  /**수정사항 반영 */
  const onSubmitUserInfo = async (data: UserInformationType) => {
    const updatedData = Object.keys(data).reduce((acc, key) => {
      const dataKey = key as keyof UserInformationType;
      if (data[dataKey] !== userInfoData[dataKey]) {
        acc[dataKey] = data[dataKey];
      }
      return acc;
    }, {} as Partial<UserInformationType>);

    //변경된 사항이 없을 때
    if (Object.keys(updatedData).length === 0) {
      toast.error("변경된 사항이 없습니다.");
      return;
    }
    try {
      const response = await flaskAPI.patch(`/users/${userId}`, updatedData);
      const responseData = response.data;

      if (responseData.status === "success") {
        setUserInfoData(data);
        toast.success("성공적으로 수정되었습니다.");
      } else {
      }
    } catch (error) {
      console.error("Error: ", error);
      toast.error("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };
  /**비밀번호 변경 */
  const onSubmitPassword = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => {
    try {
      const response = await flaskAPI.patch(`/users/${userId}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      const responseData = response.data;

      if (responseData.status === "success") {
        toast.success("비밀번호가 성공적으로 수정되었습니다.");
        reset();
      } else {
        toast.error(responseData.message);
      }
    } catch (error) {
      console.error("Error: ", error);
      toast.error("비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleDeleteUser = async () => {
    const isConfirmed = window.confirm(
      "계정을 정말로 삭제하시겠습니까? 해당 계정과 관련된 데이터는 모두 삭제되며, 이후 해당 계정으로 로그인하실 수 없습니다."
    );
    if (!isConfirmed) return;

    try {
      const response = await flaskAPI.delete(`/users/${userId}`);
      const responseData = response.data;
      if (responseData.status === "success") {
        toast.success("계정삭제가 완료되었습니다.");
        router.push("/logout");
      } else {
        toast.error(responseData.message);
      }
    } catch (error) {
      toast.error("계정삭제 도중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  //주소 api 사용
  const onClickAddress = () => {
    new window.daum.Postcode({
      oncomplete: function (data: InformationAddress) {
        setValue("address", data.address);
        setValue("zonecode", data.zonecode);
        document.getElementById("address_detail")?.focus();
      },
    }).open();
  };

  useEffect(() => {
    fetchUserInformation();
  }, [userId]);

  return (
    <div className="bg-gray-200 p-8">
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="beforeInteractive"
      />
      <h2 className="text-xl font-bold mb-4 text-gray-500 max-w-xl mx-auto">
        회원정보 수정
      </h2>
      <div className="bg-white p-6 rounded-md shadow-md max-w-xl mx-auto">
        <form onSubmit={handleUserInfoSubmit(onSubmitUserInfo)}>
          {/* 이름 */}
          <div className="mt-4">
            <label className="block text-blue-600">이름 </label>
            <input
              className="mt-1 p-1 border rounded-md mr-2 focus:outline-none focus:border-blue-400"
              {...registerUserInfo("name", {
                required: "이름을 입력해주세요.",
                maxLength: {
                  value: 15,
                  message: "최대 15글자까지 입력이 가능합니다.",
                },
              })}
            />
            {userInfoErrors?.name && (
              <p className="text-xs mt-1 px-1">
                {userInfoErrors.name?.message}
              </p>
            )}
          </div>

          {/*Email 수정불가*/}
          <div className="mt-4">
            <label className="block text-blue-600">Email</label>
            <input
              {...registerUserInfo("email")}
              className="mt-1 p-1 border rounded-md  mr-2 focus:outline-none focus:border-blue-400"
              readOnly
            />
          </div>

          {/* 전화번호 */}
          <div className="mt-4">
            <label className="block text-blue-600">전화번호 </label>
            <input
              className="mt-1 p-1 border rounded-md mr-2 focus:outline-none focus:border-blue-400"
              {...registerUserInfo("phone_number", {
                required: "전화번호를 입력해주세요.",
              })}
            />
            {userInfoErrors?.phone_number && (
              <p className="text-xs mt-1 px-1">
                {userInfoErrors.phone_number?.message}
              </p>
            )}
          </div>

          {/* 주소 */}
          <div className="mt-4">
            <label className="block text-blue-600">주소 </label>
            <input
              id="address"
              className="mt-1 p-1 border rounded-md mr-2 focus:outline-none focus:border-blue-400"
              readOnly
              {...registerUserInfo("address", {
                required: "주소를 입력해주세요. ",
              })}
              onClick={onClickAddress}
            />
            <input
              id="zonecode"
              type="text"
              className="mt-1 p-1 mr-2 border rounded-md focus:outline-none focus:border-blue-400"
              {...registerUserInfo("zonecode")}
              readOnly
            />
            <input
              id="address_detail"
              type="text"
              placeholder="상세주소입력 (선택)"
              {...registerUserInfo("address_detail")}
              className="mt-1 p-1 border rounded-md focus:outline-none focus:border-blue-400"
            />
            {userInfoErrors?.address && (
              <p className="text-xs mt-1 px-1">
                {userInfoErrors.address?.message}
              </p>
            )}
          </div>

          {/* 유형(선택불가) */}
          <div className="mt-4">
            <label className="block text-blue-600">유형</label>
            <div>{userInfoData?.role === "student" ? "수강생" : "강사"}</div>
          </div>

          {/* 저장버튼  */}
          <div className="flex justify-between">
            <div></div>
            <button
              className="mt-4 bg-blue-500 text-white py-1 px-4 rounded-md hover:bg-blue-600"
              type="submit"
            >
              Save
            </button>
          </div>
        </form>

        {/* 비밀번호 */}
        <div className="mt-4">
          <label className="block text-blue-600">비밀번호 </label>
          <input
            type="password"
            className="mt-1 p-1 border rounded-md mr-2 focus:outline-none focus:border-blue-400"
            placeholder="******"
            readOnly
          />
          <button type="button" onClick={() => setIspasswordEdited(true)}>
            변경
          </button>
          {isPasswordEdited && (
            <form
              className="space-y-2"
              onSubmit={handlePasswordSubmit(onSubmitPassword)}
            >
              <input
                type="password"
                {...registerPassword("currentPassword", {
                  required: "현재 비밀번호를 입력해주세요.",
                })}
                required
                className="block mt-1 p-1 mr-2 border rounded-md focus:outline-none focus:border-blue-400"
                placeholder="현재 비밀번호 "
              />
              <input
                type="password"
                {...registerPassword("newPassword", {
                  required: "새 비밀번호를 입력해주세요.",
                })}
                required
                className="block mt-1 p-1 mr-2 border rounded-md focus:outline-none focus:border-blue-400"
                placeholder="새 비밀번호"
              />
              <input
                type="password"
                {...registerPassword("confirmNewPassword", {
                  required: "새 비밀번호 확인란을 입력해주세요.",
                  validate: (value) =>
                    value === getValues("newPassword") ||
                    "비밀번호가 일치하지 않습니다.",
                })}
                className="mt-1 p-1 mr-2 border rounded-md focus:outline-none focus:border-blue-400"
                placeholder="새 비밀번호 확인"
              />
              {passwordErrors.confirmNewPassword && (
                <span className="text-xs mt-1 px-1">
                  {passwordErrors.confirmNewPassword.message}
                </span>
              )}
              <button className="block" type="submit">
                비밀번호 변경
              </button>
            </form>
          )}
        </div>

        {/* 계정삭제 */}
        <div className="mt-10">
          <button
            className="bg-red-400 text-white rounded px-2"
            onClick={handleDeleteUser}
          >
            계정삭제
          </button>
          <span className="text-xs px-1 text-red-500">
            * 등록하신 계정정보가 아에 삭제됩니다. 이후 로그인이 불가능합니다.
          </span>
        </div>
      </div>
    </div>
  );
};

export default InformationEditContent;
