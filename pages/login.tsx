import React, { useState } from "react";
import { setCookie, destroyCookie } from "nookies";
import { useRouter } from "next/router";
import { flaskAPI } from "./api";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { toast } from "react-toastify";

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const { login } = useUser();
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });

  /**JWT 토큰 저장 함수 */
  const setAuthToken = (token: string | null): void => {
    if (token) {
      //토큰이 존재할 경우 쿠키에 저장
      setCookie(null, "token", token, { path: "/" });
    } else {
      //토큰이 없을 경우 쿠키에서 제거
      destroyCookie(null, "token", { path: "/" });
    }
  };

  /**로그인 요청 처리 함수 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.warning("이메일과 비밀번호를 모두 입력해주세요.");
    } else {
      try {
        const response = await flaskAPI.post("/login", formData);
        const responseData = response.data;

        if (response.status === 200 && responseData.status === "success") {
          //로그인 성공 시 토큰 저장
          const { token, role, id } = responseData.data;
          setAuthToken(token);
          //로그인 성공 시 UserContext를 통해 로그인 상태 업데이트
          login(id, role);
          //localStorage 전체 삭제
          localStorage.clear();

          //role에 따라 다른 페이지로 redirect
          router.push(role === "student" ? "/" : "/instructor");
        } else {
          //로그인 실패
          console.error("Server Error: ", responseData.message);
          toast.error(`${responseData.message}`);
        }
      } catch (error) {
        console.error("로그인 요청 에러:", error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 m-4 max-w-xs w-full">
        <h2 className="text-2xl font-bold mb-8 text-gray-700">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-bold text-gray-600 block">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일"
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 block">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호"
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div className="flex justify-center">
            <button
              className="bg-gray-500 hover:bg-blue-500 w-1/3 text-white font-bold py-1 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              로그인
            </button>
          </div>
        </form>
        <div className="mt-8 flex justify-between items-center">
          <div className="text-sm font-bold text-gray-700">
            아직 회원이 아니신가요?
          </div>
          <div>
            <Link
              href="/signup"
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
