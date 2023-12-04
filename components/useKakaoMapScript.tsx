import { useEffect, useState } from "react";

/**kakao 맵 스크립트 로드 */
export const useKakaoMapScript = () => {
  const [isScriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      setScriptLoaded(true);
      return;
    }

    const kakaoMapScript = document.createElement("script");
    kakaoMapScript.async = true;
    kakaoMapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAOMAP_APPKEY}&autoload=false&libraries=services`;
    kakaoMapScript.onload = () => {
      window.kakao.maps.load(() => {
        setScriptLoaded(true);
      });
    };
    document.head.appendChild(kakaoMapScript);
  }, []);

  return isScriptLoaded;
};
