import Image from "next/image";
import Link from "next/link";
import userImage from "../public/images/userImage.svg";
import logoImage from "../public/images/logoImage.png";
import { useUser } from "@/contexts/UserContext";

const Header: React.FC = () => {
  const { isLogin } = useUser();

  return (
    <header className="flex justify-between items-center p-3 pb-5 shadow-md">
      <Link href="/">
        <Image src={logoImage} width={150} height={20} alt="logoImage" />
      </Link>
      <div>
        {isLogin ? (
          <div className="flex items-center space-x-2">
            <Image
              src={userImage}
              width={20}
              height={20}
              alt="userImage"
              className="rounded-full"
            />

            <Link href="/logout">
              <div className="text-neutral-400 text-sm">logout</div>
            </Link>
          </div>
        ) : (
          <Link href="/login">
            <div className="text-neutral-400 text-sm">login</div>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
