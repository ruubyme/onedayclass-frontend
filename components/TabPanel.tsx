interface TabPanelProps {
  name: string;
  selectedTab: string;
  children: React.ReactNode;
}

const TabPanel: React.FC<TabPanelProps> = ({ name, selectedTab, children }) => {
  if (name !== selectedTab) return null;
  return <div>{children}</div>;
};

export default TabPanel;
