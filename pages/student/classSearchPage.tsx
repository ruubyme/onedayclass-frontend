import { ClassForm } from "@/types/classTypes";
import react, { useEffect, useState } from "react";
import { flaskAPI } from "../api";
import { ClassItem } from "../../components/NearbyClassList";
import Dropdown from "../../components/Dropdown";
import { cityOptions, districtOptions } from "@/data/locationData";
import SearchForm from "../../components/SearchForm";
import Link from "next/link";

const ClassListPage: React.FC = () => {
  const [classList, setClassList] = useState<ClassForm[]>([]);
  const [selectedCity, setSelectedCity] = useState("전체");
  const [selectedDistrict, setSelectedDistrict] = useState("전체");
  const [keyword, setKeyword] = useState("");

  /**class 데이터 가져오기 */
  const fetchClassList = async () => {
    try {
      //쿼리 파라미터 생성
      const queryParams = new URLSearchParams();
      if (selectedCity !== "전체") {
        queryParams.append("city", selectedCity);
      }
      if (selectedDistrict !== "전체") {
        queryParams.append("district", selectedDistrict);
      }

      //쿼리 파라미터를 사용하여 API 요청
      const response = await flaskAPI.get(
        `/class_list?${queryParams.toString()}`
      );
      const responseData = response.data;
      if (responseData.status === "success") {
        setClassList(responseData.data);
      } else {
        console.error("ServerError: ", responseData.message);
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  /**dropdown메뉴 "도/시" 선택 */
  const handleCityChange = (label: string, value: string) => {
    setSelectedCity(value);
    setSelectedDistrict("전체");
    localStorage.setItem("selectedCity", value);
    localStorage.setItem("selectedDistrict", "전체");
  };
  /**dropdown메뉴 "시/구/군" 선택 */
  const handleDistrictChange = (label: string, value: string) => {
    setSelectedDistrict(value);
    localStorage.setItem("selectedDistrict", value);
  };

  const selectedCityIndex = cityOptions.findIndex(
    (city) => city.value === selectedCity
  );

  /**keyword 검색 */
  const handleSearch = (keyword: string) => {
    setKeyword(keyword);
    localStorage.setItem("lastKeyword", keyword);
  };

  const fliteredClassList = classList.filter(
    (item) => !keyword || item.className.includes(keyword)
  );

  useEffect(() => {
    const savedCity = localStorage.getItem("selectedCity");
    const savedDistrict = localStorage.getItem("selectedDistrict");
    const savedKeyword = localStorage.getItem("lastKeyword");
    if (savedCity) {
      setSelectedCity(savedCity);
    }
    if (savedDistrict) {
      setSelectedDistrict(savedDistrict);
    }
    if (savedKeyword) {
      setKeyword(savedKeyword);
    }
    fetchClassList();
  }, [selectedCity, selectedDistrict, keyword]);

  return (
    <div className="p-4">
      <div className="flex space-x-4 pb-5">
        <Dropdown
          name="city"
          value={selectedCity}
          options={cityOptions}
          onChange={handleCityChange}
          className="w-1/3"
        />
        <Dropdown
          name="district"
          value={selectedDistrict}
          options={districtOptions[selectedCityIndex]}
          onChange={handleDistrictChange}
          className="w-1/3"
        />
      </div>
      <div>
        <SearchForm onSearch={handleSearch} />
      </div>
      <div>
        {fliteredClassList.length !== 0 ? (
          fliteredClassList.map((classData, index) => {
            return (
              <div key={index}>
                <Link href={`/student/class_detail/${classData.classId}`}>
                  <ClassItem classData={classData} />
                </Link>
              </div>
            );
          })
        ) : (
          <div>등록된 클래스가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default ClassListPage;
