import { ClassForm, mapBoundsType } from "@/types/classTypes";
import { useEffect, useState } from "react";
import { flaskAPI } from "../pages/api";
import Link from "next/link";

interface NearbyClassListProps {
  mapBounds: mapBoundsType;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface classItemProps {
  classData: ClassForm;
}

/**class 하나당 표현해 줄 컴포넌트 */
const ClassItem: React.FC<classItemProps> = ({ classData }) => {
  return (
    <div className="my-2 p-2 border bg-white rounded-lg">
      <div className="font-bold text-gray-600">{classData.className}</div>
      <div className="pb-2 text-sm text-gray-600">{classData.description}</div>
      <div className="text-xs text-blue-500 border-t pt-2">
        {classData.location}
      </div>
      {classData.cost ? (
        <div className="text-xs">{classData.cost}원</div>
      ) : (
        <div className="text-xs">가격문의</div>
      )}
    </div>
  );
};

const NearbyClassList: React.FC<NearbyClassListProps> = ({
  mapBounds,
  setIsModalOpen,
}) => {
  const [classList, setClassList] = useState<ClassForm[]>([]);
  const { minLat, maxLat, minLng, maxLng } = mapBounds;

  const fetchClassList = async () => {
    try {
      const response = await flaskAPI.get(
        `/nearby_class_list?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}`
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

  useEffect(() => {
    fetchClassList();
  }, [mapBounds]);

  return (
    <div className="bg-gray-200 p-2">
      <div className="m-2">
        <div>
          총 <span className="text-blue-500 font-bold">{classList.length}</span>
          건
        </div>
        <div>
          {classList.map((classData, index) => {
            return (
              <div key={index}>
                <Link href={`/student/class_detail/${classData.classId}`}>
                  <ClassItem classData={classData} />
                </Link>
              </div>
            );
          })}
        </div>
        <button onClick={() => setIsModalOpen(false)}>닫기</button>
      </div>
    </div>
  );
};

export { ClassItem };
export default NearbyClassList;
