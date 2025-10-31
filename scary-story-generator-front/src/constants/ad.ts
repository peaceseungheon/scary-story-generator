/** 광고 그룹 ID */
export const AD_GROUP_IDS = {
  REWARDED: 'ait-ad-test-rewarded-id',
  INTERSTITIAL: 'ait-ad-test-interstitial-id',
} as const;

/** 광고 재시도 설정 */
export const AD_RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  DELAYS_MS: [1000, 3000, 5000],
  WAIT_TIMEOUT_MS: 10000,
} as const;
