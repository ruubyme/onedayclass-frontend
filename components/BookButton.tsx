import { classDate } from "@/types/classTypes";
import { formatDate } from "./MyReservationContent";

interface BookButtonProps {
  classDate: classDate;
  onClick: (classId: number, classDateId: number) => void;
  onCancel: (classId: number, classDateId: number) => void;
}

const BookButton: React.FC<BookButtonProps> = ({
  classDate,
  onClick,
  onCancel,
}) => {
  return (
    <div className="p-4 shadow rounded">
      <span className="text-gray-700">{formatDate(classDate.class_date)}</span>
      {classDate.user_has_booked === "pending" ? (
        <button
          className="ml-4 px-4 py-1 bg-gray-400 text-white rounded"
          onClick={() => onCancel(classDate.class_id, classDate.class_date_id)}
        >
          예약취소
        </button>
      ) : classDate.user_has_booked === "confirmed" ? (
        <button
          disabled
          className="ml-4 px-4 py-1 bg-green-400 text-white rounded"
        >
          예약확정
        </button>
      ) : (
        <button
          className={`ml-4 px-4 py-1 rounded ${
            classDate.remaining_seats
              ? "hover:bg-blue-300"
              : "bg-gray-400 text-white"
          }`}
          onClick={() =>
            classDate.remaining_seats &&
            onClick(classDate.class_id, classDate.class_date_id)
          }
          disabled={!classDate.remaining_seats}
        >
          {classDate.remaining_seats
            ? `예약하기 (${classDate.remaining_seats} 자리 남음)`
            : "정원마감"}
        </button>
      )}
    </div>
  );
};

export default BookButton;
