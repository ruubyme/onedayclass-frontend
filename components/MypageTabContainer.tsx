import { useState } from "react";
import Tab from "./Tap";
import TabPanel from "./TabPanel";
import InformationEditContent from "./InformationEditContent";
import MyReservationContent from "./MyReservationContent";
import MyBookMarksContent from "./MyBookMarksContent";
import MyReviewContent from "./MyReviewContent";

const MypageTabContainer: React.FC = () => {
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
          name="reservationInfo"
          selectedTab={selectedTab}
          onSelect={() => setSelectedTab("reservationInfo")}
        >
          <span>내 예약보기</span>
        </Tab>
        <Tab
          name="bookmarks"
          selectedTab={selectedTab}
          onSelect={() => setSelectedTab("bookmarks")}
        >
          <span>북마크</span>
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
        <TabPanel name="reservationInfo" selectedTab={selectedTab}>
          <MyReservationContent />
        </TabPanel>
        <TabPanel name="bookmarks" selectedTab={selectedTab}>
          <MyBookMarksContent />
        </TabPanel>
        <TabPanel name="review" selectedTab={selectedTab}>
          <MyReviewContent />
        </TabPanel>
      </div>
    </div>
  );
};

export default MypageTabContainer;
