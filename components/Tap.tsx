interface TabProps {
  name: string;
  selectedTab: string;
  onSelect: () => void;
  children: React.ReactNode;
}

const Tab: React.FC<TabProps> = ({ name, selectedTab, onSelect, children }) => {
  const isActive = name === selectedTab;

  return (
    <button
      className={`
      px-4 py-1
       text-gray-600 
      ${isActive ? "bg-gray-200 py-2 px-5" : ""}
      rounded-t 
      border-b-0 
      border-l border-r border-t 
      border-gray-300 
    `}
      onClick={onSelect}
    >
      {children}
    </button>
  );
};

export default Tab;
