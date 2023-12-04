import InformationEditContent from "./InformationEditContent";
import MyClassListContent from "./MyClassListContent";
import MyReviewContentByInstructor from "./MyReviewContentbyInstructor";
import TabPanel from "./TabPanel";
import Tab from "./Tap";
import { useState } from "react";

const MypageTabContainerByInstructor: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("informationEdit");
  return (
    <div className="pt-5 pl-1">
      <div>
        <Tab
          name="informationEdit"
          selectedTab={selectedTab}
          onSelect={() => setSelectedTab("informationEdit")}
        >
          <span>정보수정</span>
        </Tab>
        <Tab
          name="myClassList"
          selectedTab={selectedTab}
          onSelect={() => setSelectedTab("myClassList")}
        >
          <span>내 클래스보기</span>
        </Tab>

        <Tab
          name="review"
          selectedTab={selectedTab}
          onSelect={() => setSelectedTab("review")}
        >
          <span>리뷰관리</span>
        </Tab>
      </div>

      <div>
        <TabPanel name="informationEdit" selectedTab={selectedTab}>
          <InformationEditContent />
        </TabPanel>
        <TabPanel name="myClassList" selectedTab={selectedTab}>
          <MyClassListContent />
        </TabPanel>
        <TabPanel name="review" selectedTab={selectedTab}>
          <MyReviewContentByInstructor />
        </TabPanel>
      </div>
    </div>
  );
};

export default MypageTabContainerByInstructor;
