import Map from "../components/Map";
import StudentNavbar from "../components/StudentNavbar";
import { useEffect, useState } from "react";
import { DecodedToken } from "../components/useAuthToken";
import { GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { flaskAPI } from "./api";
import jwtDecode from "jwt-decode";
import { classData } from "@/types/classTypes";
import NearbyClassList from "../components/NearbyClassList";
import axios from "axios";

interface MainPageProps {
  initialAddress: string;
  initialClasses: classData[];
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const cookies = parseCookies(context);
  const token = cookies.token;
  let userAddress = null;
  let initialClasses: classData[] = [];

  if (token) {
    /**user_address 가져오기 */
    const userId = jwtDecode<DecodedToken>(token).sub;
    const userRole = jwtDecode<DecodedToken>(token).role;

    if (userRole === "instructor") {
      return {
        redirect: {
          destination: "/instructor",
          permanent: false,
        },
      };
    }

    try {
      const userAddressresponse = await flaskAPI.get(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userAddressData = userAddressresponse.data;
      if (userAddressData.status === "success") {
        userAddress = userAddressData.data["address"] || "";
      } else {
        console.error("Server Error: ", userAddressData.message);
      }
    } catch (error) {
      console.error("사용자 정보 요청 에러: ", error);
    }
  }

  /**classAddresses 데이터 가져오기 */
  try {
    const classAddressresponse = await flaskAPI.get(`/class_addresses`);
    const classAddressesData = classAddressresponse.data;
    if (classAddressesData.status === "success") {
      initialClasses = classAddressesData.data || [];
    } else {
      console.error("Servier Error: ", classAddressesData.message);
    }
  } catch (error) {
    console.error("class 정보 요청 에러: ", error);
  }

  return {
    props: {
      initialAddress: userAddress,
      initialClasses,
    },
  };
};

const Main: React.FC<MainPageProps> = ({ initialAddress, initialClasses }) => {
  const [inputValue, setInputValue] = useState(initialAddress || "");
  const [address, setAddress] = useState(inputValue);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [mapBounds, setMapBounds] = useState({
    minLat: 0.0,
    maxLat: 0.0,
    minLng: 0.0,
    maxLng: 0.0,
  });
  const [test, setTest] = useState<string>("");

  const testfunction = async () => {
    const response = await axios.get(
      "https://port-0-flask-199u12dlrwtlmsu.sel5.cloudtype.app/print"
    );
    setTest(response.data);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  /**주소 검색 */
  const handleAddressSubmit = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      setAddress(inputValue);
      localStorage.setItem("lastAddress", inputValue);
    }
  };

  useEffect(() => {
    const savedAddress = localStorage.getItem("lastAddress");
    if (savedAddress) {
      setAddress(savedAddress);
      setInputValue(savedAddress);
    }
    testfunction();
  }, []);

  return (
    <>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleAddressSubmit}
        placeholder="주소(시/도/구, 도로명, 지번) 을 검색하세요."
        className="w-80 mt-4"
      />
      {
        <Map
          address={address?.toString()}
          classAddresses={initialClasses}
          updateBounds={setMapBounds}
        />
      }
      <StudentNavbar
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
      {isModalOpen && (
        <NearbyClassList
          mapBounds={mapBounds}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </>
  );
};

export default Main;
export type { classData };
