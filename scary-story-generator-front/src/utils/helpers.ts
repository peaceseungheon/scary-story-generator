/**
 * 지정된 시간(밀리초)만큼 대기하는 Promise를 반환합니다.
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 환경 변수 값을 숫자로 파싱합니다.
 */
export const parseNumberEnv = (value: string | number | undefined, fallback: number): number => {
  if (value === undefined) {
    return fallback;
  }

  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};
