import { useRouter } from "next/router";
import searchImage from "../public/images/searchIconImage.svg";
import listImage from "../public/images/listIconImage.svg";
import Image from "next/image";
import Link from "next/link";

interface StudentNavbarProps {
  isModalOpen: boolean;
  setIsModalOpen: (state: boolean) => void;
}

const StudentNavbar: React.FC<StudentNavbarProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const router = useRouter();
  const handleClassSearch = () => {
    router.push("/student/classSearchPage");
  };
  return (
    <nav className="flex text-center cursor-pointer py-2">
      <div
        className="flex-1 border-x items-center"
        onClick={() => setIsModalOpen(!isModalOpen)}
      >
        <Image
          className="inline-block m-1"
          src={listImage}
          width={17}
          height={17}
          alt="listImage"
        />
        <span>내주변</span>
      </div>
      <div className="flex-1 border-x items-center" onClick={handleClassSearch}>
        <Image
          className="inline-block m-1"
          src={searchImage}
          width={17}
          height={17}
          alt="searchImage"
        />
        <span>취미찾기</span>
      </div>
      <div className="flex-1">
        <Link href="/student/myPage">
          <div>내정보</div>
        </Link>
      </div>
    </nav>
  );
};

export default StudentNavbar;
