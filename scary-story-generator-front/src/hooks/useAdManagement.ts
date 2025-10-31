import { useState, useRef, useEffect } from 'react';
import { GoogleAdMob } from '@apps-in-toss/web-framework';
import type { AdType } from '@/types/story';
import { AD_GROUP_IDS, AD_RETRY_CONFIG } from '@/constants/ad';

interface UseAdManagementProps {
  onAdCompleted: () => void;
  onAdSkipped: () => void;
}

export const useAdManagement = ({ onAdCompleted, onAdSkipped }: UseAdManagementProps) => {
  const [adLoaded, setAdLoaded] = useState<boolean>(false);
  const [adShowing, setAdShowing] = useState<boolean>(false);
  const [adType, setAdType] = useState<AdType>('rewarded');
  const [waitingForAd, setWaitingForAd] = useState<boolean>(false);

  const cleanupRef = useRef<(() => void) | undefined>(undefined);
  const rewardEarnedRef = useRef<boolean>(false);
  const retryCountRef = useRef<number>(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const adWaitTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /**
   * 타임아웃 및 cleanup 정리 유틸리티
   */
  const clearAllTimers = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = undefined;
    }
    if (adWaitTimeoutRef.current) {
      clearTimeout(adWaitTimeoutRef.current);
      adWaitTimeoutRef.current = undefined;
    }
  };

  /**
   * 광고를 로드합니다.
   */
  const loadAd = (type: AdType) => {
    try {
      const currentRetry = retryCountRef.current;
      const adGroupId = type === 'rewarded' ? AD_GROUP_IDS.REWARDED : AD_GROUP_IDS.INTERSTITIAL;
      const adTypeName = type === 'rewarded' ? '보상형' : '전면형';

      console.log(`\n📥 [${adTypeName}] 광고 로드 시도 ${currentRetry + 1}회`);

      const isSupported = GoogleAdMob.loadAppsInTossAdMob.isSupported?.();
      console.log('🔍 loadAppsInTossAdMob.isSupported():', isSupported);

      if (isSupported !== true) {
        console.warn(`❌ ${adTypeName} 광고 기능 미지원. isSupported:`, isSupported);

        if (type === 'rewarded') {
          console.log('🔄 전면형 광고로 전환');
          setAdType('interstitial');
          retryCountRef.current = 0;
          loadAd('interstitial');
        } else {
          console.warn('⚠️ 광고 없이 진행');
        }
        return;
      }

      cleanupRef.current?.();
      cleanupRef.current = undefined;

      setAdLoaded(false);
      console.log(`🔄 ${adTypeName} 광고 로드 시작...`);

      const cleanup = GoogleAdMob.loadAppsInTossAdMob({
        options: { adGroupId },
        onEvent: (event) => {
          if (event.type === 'loaded') {
            console.log(`✅ ${adTypeName} 광고 로드 완료:`, event.data);
            setAdLoaded(true);
            setAdType(type);
            retryCountRef.current = 0;
          }
        },
        onError: (loadError) => {
          console.error(`❌ ${adTypeName} 광고 로드 실패:`, loadError);
          setAdLoaded(false);

          const errorMessage = loadError?.message || JSON.stringify(loadError) || '';

          if (errorMessage.includes('No ad to show')) {
            if (retryCountRef.current < AD_RETRY_CONFIG.MAX_ATTEMPTS) {
              const delay = AD_RETRY_CONFIG.DELAYS_MS[retryCountRef.current] || 5000;
              console.log(`⏱️ ${delay / 1000}초 후 ${adTypeName} 광고 재시도 (${retryCountRef.current + 1}/${AD_RETRY_CONFIG.MAX_ATTEMPTS})`);

              retryTimeoutRef.current = setTimeout(() => {
                retryCountRef.current += 1;
                loadAd(type);
              }, delay);
            } else {
              console.warn(`⚠️ ${adTypeName} 광고 ${AD_RETRY_CONFIG.MAX_ATTEMPTS}회 실패`);

              if (type === 'rewarded') {
                console.log('🔄 전면형 광고로 전환');
                setAdType('interstitial');
                retryCountRef.current = 0;
                loadAd('interstitial');
              } else {
                console.warn('⚠️ 광고 없이 진행');
                retryCountRef.current = 0;
              }
            }
          } else {
            console.error(`광고 로드 실패: ${errorMessage}`);

            if (type === 'rewarded') {
              console.warn('⚠️ 전면형 광고로 전환');
              setAdType('interstitial');
              retryCountRef.current = 0;
              loadAd('interstitial');
            } else {
              console.warn('⚠️ 광고 없이 진행');
            }
          }
        },
      });

      cleanupRef.current = cleanup;
    } catch (loadError) {
      console.error(`⚠️ ${type === 'rewarded' ? '보상형' : '전면형'} 광고 로드 예외:`, loadError);
      setAdLoaded(false);

      if (type === 'rewarded') {
        console.warn('⚠️ 전면형 광고로 전환');
        setAdType('interstitial');
        retryCountRef.current = 0;
        loadAd('interstitial');
      } else {
        console.warn('⚠️ 광고 없이 진행');
      }
    }
  };

  /**
   * 광고를 표시합니다.
   */
  const showAd = () => {
    try {
      const adGroupId = adType === 'rewarded' ? AD_GROUP_IDS.REWARDED : AD_GROUP_IDS.INTERSTITIAL;
      const adTypeName = adType === 'rewarded' ? '보상형' : '전면형';

      console.log(`✅ [${adTypeName}] 광고 표시 시작`);
      setAdShowing(true);
      rewardEarnedRef.current = false;

      GoogleAdMob.showAppsInTossAdMob({
        options: { adGroupId },
        onEvent: (event) => {
          switch (event.type) {
            case 'requested':
              console.log(`✅ [${adTypeName}] 광고 표시 요청 완료`);
              break;

            case 'show':
              console.log(`✅ [${adTypeName}] 광고 컨텐츠 표시 시작`);
              break;

            case 'impression':
              console.log(`✅ [${adTypeName}] 광고 노출 완료`);
              break;

            case 'clicked':
              console.log(`✅ [${adTypeName}] 광고 클릭됨`);
              break;

            case 'userEarnedReward':
              console.log('🎁 보상 획득!', event.data);
              rewardEarnedRef.current = true;
              break;

            case 'dismissed':
              console.log(`[${adTypeName}] 광고 닫힘`);

              if (adType === 'rewarded') {
                if (rewardEarnedRef.current) {
                  console.log('✅ 보상형 광고 완료 - 스토리 생성 진행');
                  onAdCompleted();
                } else {
                  console.warn('⚠️ 보상형 광고 중도 종료 - 스토리 생성하지 않음');
                  onAdSkipped();
                }
              } else {
                console.log('✅ 전면형 광고 닫힘 - 스토리 생성 진행');
                onAdCompleted();
              }

              setAdShowing(false);
              loadAd('rewarded');
              break;

            case 'failedToShow':
              console.warn(`⚠️ [${adTypeName}] 광고 표시 실패 - 광고 없이 진행:`, event.data);
              setAdShowing(false);
              onAdCompleted();
              loadAd('rewarded');
              break;
          }
        },
        onError: (showError) => {
          console.error(`❌ [${adTypeName}] 광고 표시 에러:`, showError);
          setAdShowing(false);
          console.warn('⚠️ 광고 표시 에러 발생 - 광고 없이 진행');
          onAdCompleted();
          loadAd('rewarded');
        }
      });
    } catch (error) {
      console.error('❌ 광고 표시 중 예외 발생:', error);
      setAdShowing(false);
      onAdCompleted();
      loadAd('rewarded');
    }
  };

  /**
   * 광고 표시 요청 (광고가 로드되지 않았을 경우 대기)
   */
  const requestAd = () => {
    try {
      const isSupported = GoogleAdMob.showAppsInTossAdMob.isSupported?.();
      console.log('🔍 showAppsInTossAdMob.isSupported():', isSupported);
      console.log('📊 adLoaded 상태:', adLoaded);
      console.log('📊 광고 타입:', adType);

      if (isSupported !== true) {
        console.warn('광고 표시 기능 미지원. isSupported:', isSupported);
        onAdCompleted();
        return;
      }

      if (adLoaded === false) {
        console.log('⏳ 광고 로드 대기 중 - 로딩 화면 표시');
        setWaitingForAd(true);

        adWaitTimeoutRef.current = setTimeout(() => {
          console.warn(`⚠️ 광고 로드 타임아웃 (${AD_RETRY_CONFIG.WAIT_TIMEOUT_MS / 1000}초) - 광고 없이 진행`);
          setWaitingForAd(false);
          onAdCompleted();
        }, AD_RETRY_CONFIG.WAIT_TIMEOUT_MS);

        return;
      }

      showAd();
    } catch (error) {
      console.error('❌ 광고 표시 중 예외 발생:', error);
      onAdCompleted();
    }
  };

  /**
   * 광고 로드 완료 시 대기 중이었다면 광고 표시
   */
  useEffect(() => {
    if (waitingForAd && adLoaded) {
      console.log('✅ 광고 로드 완료 - 광고 표시');
      setWaitingForAd(false);

      if (adWaitTimeoutRef.current) {
        clearTimeout(adWaitTimeoutRef.current);
        adWaitTimeoutRef.current = undefined;
      }

      showAd();
    }
  }, [adLoaded, waitingForAd]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * 컴포넌트 마운트 시 광고 로드 및 언마운트 시 정리
   */
  useEffect(() => {
    loadAd('rewarded');

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = undefined;
      clearAllTimers();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    adLoaded,
    adShowing,
    adType,
    waitingForAd,
    requestAd,
    loadAd,
  };
};
