import { RefObject } from "@fullcalendar/core/preact";
import React from "react";

interface TabType {
  name: string;
  ref: RefObject<HTMLElement>;
  label: string;
}

interface TabBarProps {
  tabs: TabType[];
}

const TabBar: React.FC<TabBarProps> = ({ tabs }) => {
  const handleTabClick = (ref: RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full shadow-md z-10">
      <div className="flex space-x-5">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => handleTabClick(tab.ref)}
            className="py-2 px-4 text-gray-500 hover:text-blue-600"
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabBar;
