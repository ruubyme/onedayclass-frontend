import { useRouter } from "next/router";

const InstructorNavbar: React.FC = () => {
  const router = useRouter();

  const handleClassRegistrationClick = () => {
    router.push("instructor/classregistration");
  };

  const handleMypageClick = () => {
    router.push("instructor/myPage");
  };

  return (
    <nav className="flex text-center cursor-pointer py-2">
      <div
        className="flex-1 border-x items-center"
        onClick={handleClassRegistrationClick}
      >
        <div>클래스등록</div>
      </div>
      <div className="flex-1 border-x items-center" onClick={handleMypageClick}>
        <div>내정보</div>
      </div>
    </nav>
  );
};

export default InstructorNavbar;
