import React, { useState, useEffect } from "react";
import { flaskAPI } from "../pages/api";

interface AttendeesModalProps {
  classDateId: number | null;
  onClose: () => void;
}

interface attendeeType {
  class_date_id: number;
  class_id: number;
  email: string;
  id: number;
  name: string;
  phone_number: string;
  status: string;
  student_id: number;
}

const AttendeesModal: React.FC<AttendeesModalProps> = ({
  classDateId,
  onClose,
}) => {
  const [attendees, setAttendees] = useState<attendeeType[]>([]);

  const fetchAttendeesList = async (classDateId: number) => {
    const response = await flaskAPI(`/${classDateId}/attendees`);
    const responseData = response.data;
    if (responseData.status === "success") {
      console.log(responseData.data);
      setAttendees(responseData.data);
    } else {
      console.error(responseData.message);
    }
  };

  useEffect(() => {
    if (classDateId !== null) {
      fetchAttendeesList(classDateId);
    }
  }, [classDateId]);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-lg w-full mx-4 md:mx-0 p-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-semibold">예약자</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
          >
            닫기
          </button>
        </div>
        {attendees.length === 0 ? (
          <div className="my-4">예약자가 없습니다.</div>
        ) : (
          <ul className="list-none p-0 my-4 divide-y divide-gray-200">
            <li className="py-2">
              <div className="grid grid-cols-7 px-4 font-semibold">
                <div className="col-span-1">이름</div>
                <div className="col-span-3">이메일</div>
                <div className="col-span-2">전화번호</div>
                <div className="col-span-1">예약상태</div>
              </div>
            </li>
            {attendees.map((attendee, index) => (
              <li key={index} className="py-2">
                <div className="grid grid-cols-7 px-4">
                  <div className="text-sm col-span-1">{attendee.name}</div>
                  <div className="text-sm col-span-3">{attendee.email}</div>
                  <div className="text-sm col-span-2">
                    {attendee.phone_number}
                  </div>
                  <div className="text-sm col-span-1">
                    <span>{attendee.status === "pending" && "예약중"}</span>
                    <span className="text-red-500">
                      {attendee.status === "cancelled" && "예약취소"}
                    </span>
                    <span className="text-green-500">
                      {attendee.status === "confirmed" && "예약완료"}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AttendeesModal;
