import { FC, useEffect, useRef } from "react";
import { classData } from "../pages";
import { flaskAPI } from "../pages/api";
import { useAuthToken } from "./useAuthToken";
import { toast } from "react-toastify";
import { LatLong, mapBoundsType } from "@/types/classTypes";
import { useKakaoMapScript } from "./useKakaoMapScript";

declare global {
  interface Window {
    kakao: any;
  }
}

interface MapProps {
  address: string;
  classAddresses: classData[];
  updateBounds: React.Dispatch<React.SetStateAction<mapBoundsType>>;
}

declare namespace kakao.maps {
  export class LatLng {
    constructor(latitude: number, longitude: number);
  }
}

/**주소로 좌표 검색 함수 */
const createGeocoder = async (address: string): Promise<LatLong> => {
  return new Promise((resolve, reject) => {
    window.kakao.maps.load(() => {
      const geocoder = new window.kakao.maps.services.Geocoder(); //주소-좌표 반환 객체 생성

      geocoder.addressSearch(address, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          resolve({
            latitude: result[0].y,
            longitude: result[0].x,
          });
        } else {
          toast.error("정확한 주소를 입력하세요.");
          reject(new Error("Geocoder: Address search failed"));
        }
      });
    });
  });
};

/**정적 지도 생성 */
const createStaticMap = (longitude: number, latitude: number) => {
  window.kakao.maps.load(() => {
    const staticMapContainer: HTMLElement | null =
      document.getElementById("staticMap");
    //마커표시
    const markerPosition = new window.kakao.maps.LatLng(longitude, latitude);
    const marker = {
      position: markerPosition,
    };

    if (staticMapContainer) {
      const staticOption = {
        center: new window.kakao.maps.LatLng(longitude, latitude),
        level: 3,
        marker: marker,
      };
      const staticMap = new window.kakao.maps.StaticMap(
        staticMapContainer,
        staticOption
      );
    }
  });
};

const Map: FC<MapProps> = ({ address, classAddresses, updateBounds }) => {
  const mapRef = useRef<any>(null);
  const { user } = useAuthToken();
  const isScriptLoaded = useKakaoMapScript();

  /**class추가 정보 얻어오기 */
  const fetchClassAdditionalData = async (class_id: number) => {
    try {
      //API호출 및 classAdditionalData 얻어오기
      const response = await flaskAPI.get(`/class_additional_data/${class_id}`);
      const responseData = response.data;
      if (responseData.status === "success") {
        const classData = responseData.data;
        return classData;
      } else {
        console.error("Server Error:", responseData.message);
        toast.error("시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  /**map 생성 함수 */
  const createMap = async (address: string) => {
    const onLoadKakaoMap = async () => {
      try {
        let coords = { latitude: 37.517198, longitude: 126.891434 };
        if (address) {
          coords = await createGeocoder(address);
        }
        const kakaoCoords: kakao.maps.LatLng = new window.kakao.maps.LatLng(
          coords.latitude,
          coords.longitude
        );
        const container = document.getElementById("map");
        const options = {
          center: kakaoCoords,
          level: 3,
        };
        const map = new window.kakao.maps.Map(container, options);
        mapRef.current = map;
        createMarker(kakaoCoords);
        await createClassMarker(classAddresses);
      } catch (error) {
        console.error(error);
      }
    };
    onLoadKakaoMap();
  };

  /**address Marker 생성 */
  const createMarker = (coords: kakao.maps.LatLng) => {
    new window.kakao.maps.Marker({
      map: mapRef.current,
      position: coords,
    });
  };

  /**class ImageMarker 생성 */
  const createClassMarker = async (classList: classData[]) => {
    const markerPromises = classList.map(async (classData) => {
      const class_id = classData.class_id;
      const classAddress = classData.location;
      try {
        const classCoordsObj = await createGeocoder(classAddress);

        const classCoords: kakao.maps.LatLng = new window.kakao.maps.LatLng(
          classCoordsObj.latitude,
          classCoordsObj.longitude
        );

        const classMarker = new window.kakao.maps.Marker({
          map: mapRef.current,
          position: classCoords,
          image: new window.kakao.maps.MarkerImage(
            "/images/class_marker.png",
            new window.kakao.maps.Size(30, 30)
          ),
        });

        await createOverlayOnMarkerClick(classMarker, class_id);
      } catch (error) {
        console.error(error);
      }
    });

    //모든 마커가 생성될 때까지 기다림
    await Promise.all(markerPromises);
  };

  /**classMarker Click 함수 */
  const createOverlayOnMarkerClick = async (marker: any, class_id: number) => {
    const overlay = new window.kakao.maps.CustomOverlay({
      map: mapRef.current,
      position: marker.getPosition(),
    });

    let isClicked = false;

    window.kakao.maps.event.addListener(marker, "click", async () => {
      if (!isClicked) {
        const classAdditionalData = await fetchClassAdditionalData(class_id);
        const overlayContent = `
        <div class="overlay">
          <a href="/student/class_detail/${class_id}">${classAdditionalData.class_name}</a>
          <div>${classAdditionalData.class_description}</div>
          <button id="overlayCloseBtn_${class_id}">Close</button>
        </div>
      `;

        overlay.setContent(overlayContent);
        overlay.setMap(mapRef.current);
        isClicked = !isClicked;
      }
      /**close Button click 시 overlay 닫힘 */
      window.document
        .getElementById(`overlayCloseBtn_${class_id}`)
        ?.addEventListener("click", (event) => {
          event?.stopPropagation(); //이벤트 버블링을 막음
          if (isClicked) {
            overlay.setMap(null);
            isClicked = !isClicked;
          }
        });
    });
  };

  /**현재위치 button 이벤트  */
  const moveToAddress = async () => {
    const coords = await createGeocoder(address);
    const kakaoCoords: kakao.maps.LatLng = new window.kakao.maps.LatLng(
      coords.latitude,
      coords.longitude
    );
    mapRef.current.setCenter(kakaoCoords);
  };

  /**현재 지도의 경계 좌표 가져오기 */
  const getMapBounds = () => {
    const bounds = mapRef.current.getBounds();

    const swLatLng = bounds.getSouthWest(); //남서쪽 좌표
    const neLatLng = bounds.getNorthEast(); //북동쪽 좌표
    const minLat = swLatLng.getLat();
    const minLng = swLatLng.getLng();
    const maxLat = neLatLng.getLat();
    const maxLng = neLatLng.getLng();

    updateBounds({
      minLat,
      minLng,
      maxLat,
      maxLng,
    });
  };

  useEffect(() => {
    if (isScriptLoaded) {
      createMap(address);
    }
  }, [address, isScriptLoaded]);

  useEffect(() => {
    if (mapRef.current) {
      getMapBounds();
      //지도가 이동할 때 이벤트 리스너 추가
      window.kakao.maps.event.addListener(mapRef.current, "dragend", () => {
        getMapBounds();
      });

      //지도의 줌 레벨이 변경될 때의 이벤트 리스너 추가
      window.kakao.maps.event.addListener(
        mapRef.current,
        "zoom_changed",
        () => {
          getMapBounds();
        }
      );
    }
  }, [mapRef.current]);

  return (
    <>
      <div className="relative w-full h-[80vh]">
        <div id="map" className="w-full h-full" />
        {user && (
          <button
            className="absolute bottom-4 right-4 z-10 bg-blue-500 text-white p-2 rounded"
            onClick={moveToAddress}
          >
            내 위치
          </button>
        )}
      </div>
    </>
  );
};

export default Map;
export { createGeocoder, createStaticMap };
