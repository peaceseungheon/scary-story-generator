import { useState } from 'react';
import type { StoryResult, ApiResponse } from '@/types/story';
import { DEFAULT_API_URL, DEFAULT_REQUEST_TIMEOUT_MS, DEFAULT_RETRY_LIMIT, DEFAULT_RETRY_DELAY_MS } from '@/constants/api';
import { parseNumberEnv, sleep } from '@/utils/helpers';

export const useStoryGeneration = () => {
  const [storyResult, setStoryResult] = useState<StoryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  /**
   * 타임아웃을 포함한 fetch 요청
   */
  const fetchWithTimeout = (url: string, options: RequestInit, timeout: number): Promise<Response> => {
    return Promise.race([
      fetch(url, options),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), timeout)
      )
    ]);
  };

  /**
   * 서버에 키워드를 전달하여 스토리를 생성합니다.
   */
  const generateStory = async (keywords: string[]) => {
    if (keywords.length === 0) {
      setError('키워드를 다시 입력해주세요');
      return false;
    }

    setIsLoading(true);
    setError('');

    // 키워드 배열을 쉼표로 연결하여 전달
    const keywordString = keywords.join(', ');

    const metaEnv = (import.meta).env ?? {};
    const apiUrl = metaEnv.VITE_API_URL || DEFAULT_API_URL;
    const timeoutMs = parseNumberEnv(metaEnv.VITE_REQUEST_TIMEOUT_MS, DEFAULT_REQUEST_TIMEOUT_MS);
    const retryLimit = parseNumberEnv(metaEnv.VITE_REQUEST_RETRY_LIMIT, DEFAULT_RETRY_LIMIT);
    const retryDelay = parseNumberEnv(metaEnv.VITE_REQUEST_RETRY_DELAY_MS, DEFAULT_RETRY_DELAY_MS);

    try {
      /**
       * API 요청 (재시도 로직 포함)
       */
      const request = async (attempt: number): Promise<Response> => {
        try {
          const response = await fetchWithTimeout(
            `${apiUrl}/api/generate`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ keyword: keywordString }),
            },
            timeoutMs
          );

          return response;
        } catch (requestError) {
          if (
            attempt < retryLimit &&
            requestError instanceof Error &&
            requestError.message === 'REQUEST_TIMEOUT'
          ) {
            console.warn(`⏱️ 요청 타임아웃 - 재시도 ${attempt + 1}/${retryLimit}`);
            await sleep(retryDelay);
            return request(attempt + 1);
          }

          throw requestError;
        }
      };

      const res = await request(0);

      if (!res.ok) {
        try {
          const errorData = await res.json() as ApiResponse;
          throw new Error(errorData.error || '스토리를 생성할 수 없어요. 다시 시도해주세요');
        } catch (parseError) {
          if (parseError instanceof Error && parseError.message) {
            throw parseError;
          }
          throw new Error('스토리를 생성할 수 없어요. 다시 시도해주세요');
        }
      }

      const data = await res.json() as ApiResponse;

      if (!data.success) {
        throw new Error(data.error || '스토리를 생성할 수 없어요. 다시 시도해주세요');
      }

      // 결과 저장
      setStoryResult({
        imageUrl: data.imageUrl,
        title: data.title,
        content: data.content,
      });

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('스토리 생성 실패', err);

      if (err instanceof Error && err.message === 'REQUEST_TIMEOUT') {
        setError('요청 시간이 너무 오래 걸려 중단되었어요. 잠시 후 다시 시도해주세요.');
      } else {
        setError(err instanceof Error ? err.message : '스토리를 생성할 수 없어요. 다시 시도해주세요');
      }

      setIsLoading(false);
      return false;
    }
  };

  const resetStory = () => {
    setStoryResult(null);
    setError('');
  };

  return {
    storyResult,
    isLoading,
    error,
    generateStory,
    resetStory,
    setError,
  };
};
