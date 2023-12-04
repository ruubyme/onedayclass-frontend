import { ClassForm } from "@/types/classTypes";
import { fetchMyClassList } from "../pages/api";
import { useUser } from "@/contexts/UserContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ClassItem } from "./NearbyClassList";

const MyClassListContent: React.FC = () => {
  const { userId } = useUser();
  const [myClassList, setMyClassList] = useState<ClassForm[]>([]);
  const classListLoadDate = async () => {
    if (userId) {
      const classListData: ClassForm[] = await fetchMyClassList(userId);
      setMyClassList(classListData);
    }
  };

  useEffect(() => {
    classListLoadDate();
  }, []);
  return (
    <div className="bg-gray-200 p-8">
      <div className="max-w-xl mx-auto">
        <div className="text-xl font-bold mb-4 text-gray-500 max-w-xl mx-auto">
          내 수업 목록
        </div>
        {myClassList.map((classData) => {
          return (
            <div key={classData.classId}>
              <Link href={`/instructor/edit/${classData.classId}`}>
                <ClassItem classData={classData} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyClassListContent;
