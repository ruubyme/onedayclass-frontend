import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import InstructorNavbar from "../../components/InstructorNavbar";
import { useRouter } from "next/router";
import { useUser } from "@/contexts/UserContext";
import { toast } from "react-toastify";
import { fetchClassDateByClassId, fetchMyClassList, flaskAPI } from "../api";
import { GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import jwtDecode from "jwt-decode";
import { DecodedToken } from "../../components/useAuthToken";
import { ClassForm } from "@/types/classTypes";
import { EventInput } from "@fullcalendar/core/index.js";
import AttendeesModal from "../../components/AttendeesModal";

interface classDateDetailType {
  class_capacity: number;
  class_date: Date;
  class_date_id: number;
  remaining_seats: number;
  class_name: string;
}

interface MainProps {
  classDateDetails: classDateDetailType[];
}

export const formatTime = (dateStr: Date) => {
  const date = new Date(dateStr);

  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${hours}: ${minutes}`;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const token = parseCookies(context).token;
  if (!token) {
    return {
      props: {
        classDateDetails: [],
      },
    };
  }
  const userId = jwtDecode<DecodedToken>(token).sub;
  const classListResponse: ClassForm[] = await fetchMyClassList(userId);

  const classDateDetailsPromises = classListResponse.map(async (classItem) => {
    return fetchClassDateByClassId(classItem.classId);
  });
  const classDateDetails: classDateDetailType[] = await Promise.all(
    classDateDetailsPromises
  );

  return {
    props: {
      classDateDetails,
    },
  };
};

const Main: React.FC<MainProps> = ({ classDateDetails }) => {
  const { role } = useUser();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassDateId, setSelectedClassDateId] = useState<null | number>(
    null
  );

  const handleEventClick = (clickInfo: EventInput) => {
    setSelectedClassDateId(clickInfo.event.extendedProps.class_date_id);
    setIsModalOpen(true);
  };

  //role이 instructor가 아니면 접근을 막음
  useEffect(() => {
    if (role == "student") {
      router.push("/");
      toast.error("접근 권한이 없습니다.");
    }
  }, [role]);

  const events = classDateDetails
    .flat()
    .map((classDate: classDateDetailType) => {
      const localDate = new Date(classDate.class_date);
      const utcDate = new Date(
        localDate.getTime() + localDate.getTimezoneOffset() * 60000
      );
      return {
        title: classDate.class_name,
        start: utcDate.toISOString(),
        display: "block",
        extendedProps: {
          class_date_id: classDate.class_date_id,
        },
      };
    });
  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
      />
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
          <AttendeesModal
            classDateId={selectedClassDateId}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      )}
      <InstructorNavbar />
    </>
  );
};

export default Main;
