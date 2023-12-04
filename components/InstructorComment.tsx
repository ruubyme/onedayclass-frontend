import { reviewDetailType } from "@/types/classTypes";
import { useState } from "react";
import { renderContent } from "../pages/student/class_detail/[class_id]";

interface InstructorCommentProps {
  review: reviewDetailType;
  onCommentSubmit: (reviewId: number, comment: string) => void;
  onDeleteComment: (reviewId: number) => void;
}

const InstructorComment: React.FC<InstructorCommentProps> = ({
  review,
  onCommentSubmit,
  onDeleteComment,
}) => {
  const [comment, setComment] = useState(review.instructor_comment || "");
  const [isEditing, setIsEditing] = useState(!review.instructor_comment);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const handleCommentSubmit = () => {
    onCommentSubmit(review.id, comment);
    setIsEditing(false);
  };

  const handleCommentDelete = () => {
    onDeleteComment(review.id);
    setIsEditing(true);
    setComment("");
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  return (
    <div className="my-2 p-2 border bg-blue-200 rounded-lg relative">
      <div className="speech-bubble-tail"></div>
      {isEditing ? (
        <div className="flex flex-col">
          <textarea
            value={comment}
            onChange={handleCommentChange}
            className="w-full p-1 border rounded-md focus:outline-none focus:border-blue-400 bg-white bg-opacity-0"
            placeholder="댓글을 작성하세요."
          />
          <button
            onClick={handleCommentSubmit}
            className="self-start mt-2 text-blue-700 py-1 px-1 rounded hover:bg-white focus:outline-none"
          >
            확인
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-start">
          <div className="mb-2">{renderContent(comment)}</div>
          <div>
            <button
              onClick={handleEditClick}
              className="text-blue-700 py-1 px-1 rounded hover:bg-white focus:outline-none"
            >
              수정
            </button>
            <button
              className="text-red-700 py-1 px-1 rounded hover:bg-white focus:outline-none"
              onClick={handleCommentDelete}
            >
              삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorComment;
