import { GetServerSidePropsContext } from "next";
import { flaskAPI } from "../../api";
import { ClassForm } from "@/types/classTypes";
import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/router";
import Script from "next/script";
import { createGeocoder } from "../../../components/Map";
import { useKakaoMapScript } from "../../../components/useKakaoMapScript";
import { toast } from "react-toastify";

interface ClassEditPageProps {
  classDetailInfo: ClassForm;
}

interface InformationAddress {
  address: string;
}

const defaultClassDetailInfo = {
  className: "",
  content: "",
  cost: "",
  curriculums: [],
  description: "",
  latitude: 0,
  location: "",
  longitude: 0,
  targetStudents: [],
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const classId = context.query.class_id;
  try {
    //class 추가 정보 가져오기
    const classDetailResponse = await flaskAPI.get(
      `/get_class_detail/${classId}`
    );
    const classDetailData = classDetailResponse.data;

    if (classDetailData.status === "error") {
      console.error("Server Error:", classDetailData.message);
    }

    return {
      props: {
        classDetailInfo: classDetailData.data,
      },
    };
  } catch (error) {
    console.error("Error fetching data: ", error);

    return {
      props: {
        classDetailInfo: defaultClassDetailInfo,
      },
    };
  }
};

const ClassEditPage: React.FC<ClassEditPageProps> = ({ classDetailInfo }) => {
  const [classData, setClassData] = useState(classDetailInfo);
  const [items, setItems] = useState<{
    curriculums: string[];
    targetStudents: string[];
  }>({
    curriculums: classDetailInfo.curriculums || [],
    targetStudents: classDetailInfo.targetStudents || [],
  });
  const [newCurriculum, setNewCurriculum] = useState("");
  const [newTargetStudent, setNewTargetStudent] = useState("");

  const router = useRouter();
  const instructor_id = useUser().userId;
  const classId = router.query.class_id;
  useKakaoMapScript();

  const handleChange = (
    field: keyof ClassForm,
    value: string | number | string[]
  ) => {
    setClassData((prevState) => {
      return { ...prevState, [field]: value };
    });
  };
  const addItem = (type: keyof typeof items) => {
    setItems((prev) => ({
      ...prev,
      [type]:
        type === "curriculums"
          ? [...prev.curriculums, newCurriculum]
          : [...prev.targetStudents, newTargetStudent],
    }));

    if (type === "curriculums") {
      setNewCurriculum(""); // curriculum을 추가한 후 입력값 초기화
    } else {
      setNewTargetStudent(""); // target_student를 추가한 후 입력값 초기화
    }
  };

  const editItem = (type: keyof typeof items, index: number, value: string) => {
    const updatedItems = { ...items };
    updatedItems[type][index] = value;
    setItems(updatedItems);
  };

  const deleteItem = (type: keyof typeof items, index: number) => {
    const updatedItems = { ...items };
    updatedItems[type].splice(index, 1);
    setItems(updatedItems);
  };

  /**수정사항 반영 */
  const handleSave = async (field: keyof ClassForm) => {
    let valueToSave: string | number | string[];
    let dataToSend;

    if (field === "location") {
      dataToSend = {
        instructor_id,
        class_id: classId,
        data: {
          location: classData.location,
          latitude: classData.latitude,
          longitude: classData.longitude,
        },
      };
    } else {
      // 커리큘럼 배열 내 빈 항목 여부 검사
      if (field === "curriculums") {
        const hasEmptyCurriculum = items.curriculums.some(
          (curriculum) => curriculum.trim() === ""
        );
        if (hasEmptyCurriculum) {
          toast.warning(
            "모든 커리큘럼 항목을 입력하거나 빈 항목을 제거해주세요."
          );
          return;
        }
      }

      if (field === "targetStudents") {
        const hasEmptytargetStudent = items.targetStudents.some(
          (student) => student.trim() === ""
        );
        if (hasEmptytargetStudent) {
          toast.warning(
            "모든 추천대상 항목을 입력하거나 빈 항목을 제거해주세요."
          );
          return;
        }
      }

      if (field === "curriculums" || field === "targetStudents") {
        valueToSave = items[field];
      } else {
        valueToSave = classData[field] || "";
      }

      dataToSend = {
        instructor_id,
        class_id: classId,
        data: {
          [field]: valueToSave,
        },
      };
    }

    try {
      const response = await flaskAPI.patch(`/class`, dataToSend);
      const responseData = response.data;

      if (responseData.status === "success") {
        if (field === "curriculums" || field === "targetStudents") {
          setItems((prevState) => ({
            ...prevState,
            [field]: valueToSave,
          }));
        } else {
          setClassData((prevState) => ({
            ...prevState,
            [field]: classData[field],
          }));
        }
        toast.success("성공적으로 수정되었습니다.");
      } else {
        toast.error("Server Error: ", responseData.message);
      }
    } catch (error) {
      console.error("Error: ", error);
      toast.error("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  //주소입력 api
  const onClickAddress = () => {
    new window.daum.Postcode({
      oncomplete: async function (data: InformationAddress) {
        setClassData((prevState) => ({
          ...prevState,
          location: data.address,
        }));

        const coords = await createGeocoder(data.address);
        setClassData((prevState) => ({
          ...prevState,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }));
      },
    }).open();
  };

  /**클래스 삭제 */
  const handleDeleteClass = async () => {
    const isConfirmed = window.confirm("해당 클래스를 삭제하시겠습니까?");

    if (!isConfirmed) return;

    try {
      const response = await flaskAPI.delete(
        `/class?instructor_id=${instructor_id}&class_id=${classId}`
      );
      const responseData = response.data;
      if (responseData.status === "success") {
        toast.success("클래스가 성공적으로 삭제되었습니다.");
        router.push("/instructor/myPage");
      } else {
        console.error("Server Error: ", responseData.message);
        toast.error("클래스를 삭제하는 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error: ", error);
      toast.error("클래스를 삭제하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="bg-gray-200 p-8">
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="beforeInteractive"
      />
      <div className="bg-white p-6 rounded-md shadow-md max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-500">클래스 수정</h2>
        {/* 클래스 이름  */}
        <div className="mt-4">
          <label className="block text-blue-600">CLASS 이름 </label>
          <input
            className="mt-1 p-1 border rounded-md mr-2 focus:outline-none focus:border-blue-400"
            value={classData.className}
            onChange={(e) => handleChange("className", e.target.value)}
          />
          <button
            className="bg-blue-300 text-white px-2 rounded border"
            onClick={() => handleSave("className")}
          >
            저장
          </button>
        </div>

        {/* 클래스 소개 */}
        <div className="mt-4">
          <label className="block text-blue-600">수업 소개</label>
          <input
            className="mt-1 p-1 border rounded-md  mr-2 focus:outline-none focus:border-blue-400"
            value={classData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
          <button
            className="bg-blue-300 text-white px-2 rounded border"
            onClick={() => handleSave("description")}
          >
            저장
          </button>
        </div>

        {/* 클래스 내용 */}
        <div className="mt-4">
          <label className="block text-blue-600">수업 내용 (생략가능)</label>
          <textarea
            value={classData.content}
            className="w-full h-60 p-3 border rounded-md shadow-sm focus:outline-none focus:border-blue-400 resize-none"
            onChange={(e) => handleChange("content", e.target.value)}
          />
          <button
            className="bg-blue-300 text-white mt-2 px-2 rounded border"
            onClick={() => handleSave("content")}
          >
            저장
          </button>
        </div>

        {/* 클래스 커리큘럼 */}
        <div className="mt-4">
          <label className="block text-blue-600 ">커리큘럼</label>
          {classData.curriculums && (
            <div>
              {items.curriculums.map((item, index) => (
                <div key={index}>
                  <input
                    className="mt-1 p-1 border rounded-md mr-2 focus:outline-none focus:border-blue-400"
                    value={item}
                    onChange={(e) =>
                      editItem("curriculums", index, e.target.value)
                    }
                  />
                  <button
                    className=" w-6 h-6 bg-red-300 px-1 rounded-full mx-2"
                    onClick={() => deleteItem("curriculums", index)}
                  >
                    -
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* 커리큘럼 추가 UI */}

        <input
          type="text"
          className="mt-1 p-1 border rounded-md mr-2 focus:outline-none focus:border-blue-400"
          value={newCurriculum}
          onChange={(e) => setNewCurriculum(e.target.value)}
          placeholder="새로운 커리큘럼 입력"
        />
        <button
          className="bg-blue-300 px-1 rounded-full mx-2 w-6 h-6"
          onClick={() => addItem("curriculums")}
        >
          +
        </button>
        <div className="pt-2"></div>
        <button
          className="bg-blue-300 text-white px-2 rounded border"
          onClick={() => handleSave("curriculums")}
        >
          저장
        </button>

        {/* 추천대상 */}
        <div className="mt-4">
          <label className="text-blue-600">추천대상</label>
          {classData.targetStudents && (
            <div>
              {items.targetStudents.map((item, index) => (
                <div key={index}>
                  <input
                    className="mt-1 p-1 border rounded-md mr-2 focus:outline-none focus:border-blue-400"
                    value={item}
                    onChange={(e) =>
                      editItem("targetStudents", index, e.target.value)
                    }
                  />
                  <button
                    className=" w-6 h-6 bg-red-300 px-1 rounded-full mx-2"
                    onClick={() => deleteItem("targetStudents", index)}
                  >
                    -
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* 타겟 학생 추가 UI */}
        <input
          type="text"
          className="mt-1 p-1 border rounded-md mr-2 focus:outline-none focus:border-blue-400"
          value={newTargetStudent}
          onChange={(e) => setNewTargetStudent(e.target.value)}
          placeholder="새로운 타겟 학생 입력"
        />
        <button
          className="bg-blue-300 px-1 rounded-full mx-2 w-6 h-6"
          onClick={() => addItem("targetStudents")}
        >
          +
        </button>
        <div className="pt-2"></div>
        <button
          className="bg-blue-300 text-white px-2 rounded border"
          onClick={() => handleSave("targetStudents")}
        >
          저장
        </button>
        {/* 클래스 위치 */}
        <div className="mt-4">
          <label htmlFor="location" className="block text-blue-600">
            위치
          </label>
          <input
            type="text"
            value={classData.location}
            className="mt-1 p-1 border rounded-md mr-2 focus:outline-none focus:border-blue-400"
            readOnly
            onClick={onClickAddress}
          />
          <button
            className="bg-blue-300 text-white px-2 rounded border"
            onClick={() => handleSave("location")}
          >
            저장
          </button>
        </div>

        {/* 클래스 비용 */}
        <div className="mt-4">
          <label className="block text-blue-600">비용</label>
          <input
            type="number"
            step="1"
            className="mt-1 p-1 border rounded-md mr-2 focus:outline-none focus:border-blue-400"
            value={classData.cost}
            onChange={(e) => handleChange("cost", e.target.value)}
          />
          <button
            className="bg-blue-300 text-white px-2 rounded border"
            onClick={() => handleSave("cost")}
          >
            저장
          </button>
        </div>

        {/* 클래스 삭제 */}
        <div className="mt-10">
          <button
            className="bg-red-400 text-white rounded px-2"
            onClick={handleDeleteClass}
          >
            삭제
          </button>
          <span className="text-xs px-1 text-red-500">
            * 등록하신 클래스의 데이터가 전부 사라집니다.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClassEditPage;
