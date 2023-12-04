import React, { useEffect } from "react";
import { useAuthToken } from "./useAuthToken";
import { ClassForm } from "@/types/classTypes";

interface ClassDropdownProps {
  selectedClass: string | null;
  handleClassChange: (newClass: string) => void;
  classList: ClassForm[];
}

const ClassDropdown: React.FC<ClassDropdownProps> = ({
  selectedClass,
  handleClassChange,
  classList,
}) => {
  useAuthToken();

  useEffect(() => {
    if (classList && classList.length === 0) {
      handleClassChange("");
    }
  }, [classList]);

  const onSelectChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = event.target.value;
    handleClassChange(selectedValue);
  };

  if (!classList) return <div>Loading class data ...</div>;
  if (classList && classList.length === 0) {
    return <div>등록된 수업이 없습니다.</div>;
  }

  return (
    <form>
      <select value={selectedClass || ""} onChange={onSelectChange}>
        <option value="">✏ 새로운 클래스 등록하기</option>
        {classList.map((classItem: any) => {
          return (
            <option key={classItem.classId} value={classItem.classId}>
              {classItem.className}
            </option>
          );
        })}
      </select>
    </form>
  );
};

export default ClassDropdown;
