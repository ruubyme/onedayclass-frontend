import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Script from "next/script";
import { useRouter } from "next/router";
import { UserInformationType } from "@/types/userTypes";
import { toast } from "react-toastify";

declare global {
  interface Window {
    daum: any;
  }
}

export interface InformationAddress {
  address: string;
  zonecode: string;
}

const Signup: React.FC = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserInformationType>({
    mode: "onSubmit",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone_number: "",
      address: "",
      zonecode: "",
      address_detail: "",
      role: "",
    },
  });
  const router = useRouter();

  const onSubmit = async (data: UserInformationType) => {
    try {
      //입력한 데이터를 서버로 전송
      const response = await axios.post(
        "http://127.0.0.1:8080/api/signup",
        data
      );
      const responseData = response.data;
      if (response.status === 200 && responseData.status === "error") {
        toast.error(responseData.message);
      } else if (response.status === 200 && responseData.status === "success") {
        router.push("http://localhost:3000/login");
      }
    } catch (error) {
      console.error(error);
    }
    console.log(data);
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

  return (
    <div className="bg-gray-200 p-8">
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="beforeInteractive"
      />
      <h2 className="text-xl font-bold mb-4 text-gray-500">회원가입</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-md shadow-md max-w-xl mx-auto"
      >
        <div className="mt-4">
          <label htmlFor="name" className="block text-blue-600">
            이름
          </label>
          <input
            id="name"
            type="text"
            className="mt-1 p-1 border rounded-md focus:outline-none focus:border-blue-400"
            {...register("name", {
              required: "이름을 입력해주세요",
              maxLength: {
                value: 15,
                message: "최대 15글자까지 입력이 가능합니다.",
              },
            })}
          />
          {errors?.name && (
            <p className="text-xs mt-1 px-1">{errors.name?.message}</p>
          )}
        </div>
        <div className="mt-4">
          <label htmlFor="email" className="block text-blue-600">
            Email
          </label>
          <input
            id="이메일"
            type="text"
            className="mt-1 p-1 border rounded-md focus:outline-none focus:border-blue-400"
            {...register("email", {
              required: "반드시 입력해주세요",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "이메일 형식으로 입력해주세요",
              },
            })}
          />
          {errors?.email && (
            <p className="text-xs mt-1 px-1">{errors.email?.message}</p>
          )}
        </div>
        <div className="mt-4">
          <label htmlFor="password" className="block text-blue-600">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            className="mt-1 p-1 border rounded-md focus:outline-none focus:border-blue-400"
            {...register("password", {
              required: "비밀번호를 입력해주세요.",
            })}
          />
          {errors?.password && (
            <p className="text-xs mt-1 px-1">{errors.password?.message}</p>
          )}
        </div>
        <div className="mt-4">
          <label htmlFor="phone_number" className="block text-blue-600">
            전화번호
          </label>
          <input
            id="phone_number"
            type="text"
            className="mt-1 p-1 border rounded-md focus:outline-none focus:border-blue-400"
            {...register("phone_number", {
              required: "전화번호를 입력해주세요.",
            })}
          />
          {errors?.phone_number && (
            <p className="text-xs mt-1 px-1">{errors.phone_number?.message}</p>
          )}
        </div>
        <div className="mt-4">
          <label htmlFor="address" className="block text-blue-600">
            주소
          </label>
          <input
            id="address"
            type="text"
            readOnly
            onClick={onClickAddress}
            className="mt-1 mr-1 p-1 border rounded-md focus:outline-none focus:border-blue-400"
            {...register("address", { required: "주소를 입력해주세요." })}
          />
          <button onClick={onClickAddress} className="text-blue-600">
            검색
          </button>
          <div></div>
          <input
            id="zonecode"
            type="text"
            className="mt-1 p-1 mr-2 border rounded-md focus:outline-none focus:border-blue-400"
            readOnly
            {...register("zonecode")}
          />
          <input
            id="address_detail "
            type="text"
            placeholder="상세주소입력 (선택)"
            className="mt-1 p-1 border rounded-md focus:outline-none focus:border-blue-400"
            {...register("address_detail")}
          />
          {errors?.address && (
            <p className="text-xs mt-1 px-1">{errors.address?.message}</p>
          )}
        </div>
        <div className="mt-4">
          <div className="flex space-x-2">
            <label className="text-blue-600">유형 선택</label>
            <span className="text-xs mt-1">
              *사용용도에 알맞게 선택해주세요.
            </span>
          </div>
          <div className="space-x-5 border rounded-md py-5 px-1">
            <label>
              <input
                type="radio"
                value="student"
                className=""
                {...register("role", { required: "반드시 하나 선택해주세요" })}
              />
              수강생
            </label>
            <label>
              <input
                type="radio"
                value="instructor"
                {...register("role", { required: "반드시 하나 선택해주세요" })}
              />
              강사
            </label>
          </div>
          {errors?.role && (
            <p className="text-xs mt-1 px-1">{errors.role?.message}</p>
          )}
        </div>
        <button
          className="mt-4 bg-blue-500 text-white py-1 px-4 rounded-md hover:bg-blue-600"
          type="submit"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
