import React, { useEffect, useRef, useState } from "react";

type OptionType = {
  value: string;
  label: string;
};

interface DropdownProps {
  className?: string;
  name: string;
  value: string;
  options: OptionType[];
  onChange: (label: string, value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  className,
  name,
  value,
  options,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLDivElement | null>(null);

  const handleInputClick = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const handleBlur = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const isInside = inputRef.current?.contains(e.target as Node);
      if (!isInside) {
        setIsOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const classNames = `${className} relative flex items-center justify-between p-2 bg-gray-200 border border-gray-500 rounded-lg cursor-pointer ${
    isOpen ? "transform scale-y-100" : ""
  }`;

  const selectedOption = options.find((option) => option.value === value);

  const optionsClassNames = `my-2 absolute top-full right-0 left-0 z-10 p-4 overflow-hidden text-gray-400 bg-gray-200 rounded-lg transform ${
    isOpen ? "scale-y-100" : "scale-y-0"
  } transition-transform ease-in-out duration-200 origin-top`;

  return (
    <div
      className={classNames}
      onClick={handleInputClick}
      onBlur={handleBlur}
      ref={inputRef}
    >
      {selectedOption?.label}
      <span
        className={`transition-transform duration-2 ease-in ${
          isOpen ? "transform rotate-0" : "transform rotate-180"
        }`}
      >
        ▴
      </span>
      <div className={optionsClassNames}>
        {options.map((option) => {
          return (
            <div
              className={` py-2.5 px-4 cursor-pointer hover:bg-gray-600 ${
                value === option.value ? "bg-gray-600 text-white" : ""
              }`}
              key={option.value}
              onClick={() => onChange(option.label, option.value)}
            >
              {option.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dropdown;
