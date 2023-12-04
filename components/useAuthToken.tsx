import { useEffect, useState } from "react";
import { parseCookies } from "nookies";
import { useRouter } from "next/router";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { User } from "@/types/userTypes";
import { flaskAPI } from "../pages/api";

export interface DecodedToken {
  sub: number;
  role: string;
}

/**로그인 유지를 위한 커스텀 훅 */
export const useAuthToken = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const cookies = parseCookies();
    const token = cookies.token;

    if (token) {
      //토큰이 존재할 경우 헤더에 포함시킴
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // `flaskAPI` 인스턴스에 대한 헤더 설정
      flaskAPI.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      //토큰에서 사용자 정보를 추출
      const decodedToken = jwt_decode<DecodedToken>(token);
      setUser({
        id: decodedToken.sub,
        role: decodedToken.role,
      });
    } else {
      //토큰이 없을 경우 헤더에서 제거
      delete axios.defaults.headers.common["Authorization"];
      delete flaskAPI.defaults.headers.common["Authorization"];
    }
  }, []);

  return { user };
};
