/** 애플리케이션의 현재 화면 상태 */
export type Step = "intro" | "loading" | "result" | "error";

/** 광고 타입: 보상형 또는 전면형 */
export type AdType = "rewarded" | "interstitial";

/** 스토리 생성 결과 */
export interface StoryResult {
  imageUrl: string;
  title: string;
  content: string;
}

/** API 응답 타입 */
export interface ApiResponse {
  success: boolean;
  imageUrl: string;
  title: string;
  content: string;
  error?: string;
}
