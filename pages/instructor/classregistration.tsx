import React, { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import axios from "axios";
import { DecodedToken, useAuthToken } from "../../components/useAuthToken";
import ClassDropdown from "../../components/ClassDropdown";
import Script from "next/script";
import { ClassForm, ClassTimeForm } from "@/types/classTypes";
import { createGeocoder } from "../../components/Map";
import { useKakaoMapScript } from "../../components/useKakaoMapScript";
import { GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { fetchMyClassList, flaskAPI } from "../api";
import jwtDecode from "jwt-decode";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

declare global {
  interface Window {
    daum: any;
  }
}

interface InformationAddress {
  address: string;
}

interface ClassRegistrationProps {
  classList: ClassForm[];
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const cookies = parseCookies(context);
  const token = cookies.token;
  const classList: ClassForm[] = await fetchMyClassList(
    jwtDecode<DecodedToken>(token).sub
  );

  return {
    props: {
      classList,
    },
  };
};

const ClassRegistration: React.FC<ClassRegistrationProps> = ({ classList }) => {
  const [selectedClass, setSelectedClass] = useState<string | null>("");
  const [targetStudents, setTargetStudents] = useState<string[]>([]);
  const [curriculums, setCurriculums] = useState<string[]>([]);

  useAuthToken();
  useKakaoMapScript();
  const router = useRouter();
  const defaultClassValues = {
    className: "",
    description: "",
    location: "",
    cost: 0,
    latitude: 0.0,
    longitude: 0.0,
    targetStudents: [],
    curriculums: [],
    content: "",
  };

  const {
    register: registerClass,
    handleSubmit: handleSubmitClass,
    setValue: setValueClass,
    formState: { errors: classErrors },
    reset: resetClass,
  } = useForm<ClassForm>({
    mode: "onSubmit",
    defaultValues: defaultClassValues,
  });
  const {
    register: registerTime,
    handleSubmit: handleSubmitTime,
    setValue: setValueTime,
    formState: { errors: timeErrors },
  } = useForm<ClassTimeForm>({
    mode: "onSubmit",
    defaultValues: {
      classDateTime: "",
      capacity: 0,
    },
  });

  // targetStudent, curriculumn 항목 추가 제거
  const addTargetStudent = () => {
    setTargetStudents([...targetStudents, ""]);
  };

  const removeTargetStudent = (index: number) => {
    const newStudents = [...targetStudents];
    newStudents.splice(index, 1);
    setTargetStudents(newStudents);
  };

  const addCurriculum = () => {
    setCurriculums([...curriculums, ""]);
  };

  const removeCurriculum = (index: number) => {
    const newCurriculums = [...curriculums];
    newCurriculums.splice(index, 1);
    setCurriculums(newCurriculums);
  };

  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    //입력폼 초기화
    resetClass(defaultClassValues);
    setTargetStudents([]);
    setCurriculums([]);
  };

  const onSubmitClass = async (data: ClassForm) => {
    data.targetStudents = targetStudents;
    data.curriculums = curriculums;

    //추천대상이나 커리큘럼에 빈 항목을 검사
    if (targetStudents.some((student) => student.trim() === "")) {
      toast.warning(
        "빈 추천 대상 항목이 있습니다. 제거하거나 값을 입력해주세요."
      );
      return;
    }

    if (curriculums.some((student) => student.trim() === "")) {
      toast.warning(
        "빈 커리큘럼 항목이 있습니다. 제거하거나 값을 입력해주세요."
      );
      return;
    }
    try {
      const response = await flaskAPI.post("/register_class", data, {
        responseType: "json",
      });
      const responseData = response.data;
      //등록 성공
      if (response.status === 200 && responseData.status === "success") {
        toast.success("성공적으로 등록되었습니다!");
        router.push("/");

        //입력폼 초기화
        resetClass(defaultClassValues);
        setTargetStudents([]);
        setCurriculums([]);
      } else if (response.status === 200 && responseData.status === "error") {
        //등록실패
        toast.error(responseData.message);
        console.log(responseData.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const onSubmitTime = async (data: ClassTimeForm) => {
    try {
      const response = await flaskAPI.post(
        `/add_class_time/${selectedClass}`,
        data,
        { responseType: "json" }
      );
      const responseData = response.data;
      //등록 성공
      if (response.status === 200 && responseData.status === "success") {
        toast.success("성공적으로 등록되었습니다!");
      } else if (response.status === 200 && responseData.status === "error") {
        //등록실패
        toast.error(responseData.message);
        console.log(responseData.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //주소입력 api
  const onClickAddress = () => {
    new window.daum.Postcode({
      oncomplete: async function (data: InformationAddress) {
        setValueClass("location", data.address);

        const coords = await createGeocoder(data.address);
        setValueClass("latitude", coords.latitude);
        setValueClass("longitude", coords.longitude);
      },
    }).open();
  };

  return (
    <div className="bg-gray-200 p-8">
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="beforeInteractive"
      />
      <div className="bg-white p-6 rounded-md shadow-md max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-500">
          {selectedClass === "" ? "CLASS 등록" : "CLASS 시간 등록"}
        </h2>
        <ClassDropdown
          selectedClass={selectedClass}
          handleClassChange={handleClassChange}
          classList={classList}
        />
        {selectedClass === "" ? (
          <form onSubmit={handleSubmitClass(onSubmitClass)}>
            <div className="mt-4">
              <label className="block text-blue-600">CLASS 이름</label>
              <input
                type="text"
                className="mt-1 p-1 border rounded-md focus:outline-none focus:border-blue-400"
                {...registerClass("className", { required: true })}
              />
              {classErrors.className && (
                <span className="text-xs mt-1 px-1">내용을 입력해주세요.</span>
              )}
            </div>
            <div className="mt-4">
              <label className="block text-blue-600 ">수업 소개</label>
              <input
                type="textarea"
                className="mt-1 p-1 border rounded-md focus:outline-none focus:border-blue-400"
                {...registerClass("description", { required: true })}
              />
              {classErrors.description && (
                <span className="text-xs mt-1 px-1">내용을 입력해주세요.</span>
              )}
            </div>
            <div className="mt-4">
              <label className="block text-blue-600">수업 내용</label>
              <textarea
                {...registerClass("content", { required: true })}
                className="w-full h-60 p-3 border rounded-md shadow-sm focus:outline-none focus:border-blue-400 resize-none"
              ></textarea>
              {classErrors.content && (
                <span className="text-xs mt-1 px-1">내용을 입력해주세요.</span>
              )}
            </div>
            <div className="mt-4">
              <label className="block text-blue-600">
                추천 대상 (생략가능)
              </label>
              {targetStudents.map((student, index) => (
                <div key={index}>
                  <input
                    type="text"
                    value={student}
                    className="mt-1 p-1 border rounded-md focus:outline-none focus:border-blue-400"
                    onChange={(e) => {
                      const newStudents = [...targetStudents];
                      newStudents[index] = e.target.value;
                      setTargetStudents(newStudents);
                    }}
                  />
                  <button
                    onClick={() => removeTargetStudent(index)}
                    className=" w-6 h-6 bg-red-300 px-1 rounded-full mx-2"
                  >
                    -
                  </button>
                </div>
              ))}
              <button
                onClick={addTargetStudent}
                className="bg-blue-300 px-1 rounded-full my-2 w-6 h-6"
              >
                +
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-blue-600">커리큘럼(생략가능)</label>
              {curriculums.map((curriculum, index) => (
                <div key={index}>
                  <input
                    type="text"
                    className="mt-1 p-1 border rounded-md focus:outline-none focus:border-blue-400"
                    value={curriculum}
                    onChange={(e) => {
                      const newCurriculums = [...curriculums];
                      newCurriculums[index] = e.target.value;
                      setCurriculums(newCurriculums);
                    }}
                  />
                  <button
                    onClick={() => removeCurriculum(index)}
                    className=" w-6 h-6 bg-red-300 px-1 rounded-full mx-2"
                  >
                    -
                  </button>
                </div>
              ))}
              <button
                onClick={addCurriculum}
                className="bg-blue-300 px-1 rounded-full my-2 w-6 h-6"
              >
                +
              </button>
            </div>

            <div className="mt-4">
              <label htmlFor="location" className="block text-blue-600">
                위치
              </label>
              <input
                id="location"
                type="text"
                className="mt-1 p-1 border rounded-md focus:outline-none focus:border-blue-400"
                readOnly
                onClick={onClickAddress}
                {...registerClass("location", { required: true })}
              />
              {classErrors.location && (
                <span className="text-xs mt-1 px-1">내용을 입력해주세요.</span>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-blue-600">비용</label>
              <input
                type="number"
                step="1"
                className="mt-1 p-1 border rounded-md focus:outline-none focus:border-blue-400"
                {...registerClass("cost", { required: true })}
              />
              {classErrors.cost && (
                <span className="text-xs mt-1 px-1">비용을 입력해주세요.</span>
              )}
            </div>
            <button
              type="submit"
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              등록하기
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitTime(onSubmitTime)}>
            <div className="mt-4">
              <label className="block text-blue-600">CLASS 날짜 및 시간</label>
              <input
                type="datetime-local"
                className="mt-1 p-1 border rounded-md"
                {...registerTime("classDateTime", { required: true })}
              />
              {timeErrors.classDateTime && (
                <span className="text-xs mt-1 px-1">내용을 입력해주세요.</span>
              )}
            </div>
            <div className="mt-4">
              <label className="block text-blue-600">수용 인원</label>
              <input
                type="number"
                className="mt-1 p-1 border rounded-md focus:outline-none focus:border-blue-400"
                {...registerTime("capacity", { required: true })}
              />
              {timeErrors.capacity && (
                <span className="text-xs mt-1 px-1">내용을 입력해주세요.</span>
              )}
            </div>
            <button
              type="submit"
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              등록하기
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ClassRegistration;
