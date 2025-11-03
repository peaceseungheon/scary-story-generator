import { useState, useRef, useEffect } from "react";
import type { Step } from "@/types/story";
import { useAdManagement } from "@/hooks/useAdManagement";
import { useStoryGeneration } from "@/hooks/useStoryGeneration";
import {
  IntroScreen,
  LoadingScreen,
  ResultScreen,
  ErrorScreen,
} from "@/components/StoryGenerate";

function StoryGeneratePage() {
  // ============================================
  // 상태 관리
  // ============================================

  /** 현재 화면 상태 */
  const [step, setStep] = useState<Step>("intro");

  /** 사용자가 입력한 키워드 배열 (최대 10개) */
  const [keywords, setKeywords] = useState<string[]>([]);

  /** 현재 입력 중인 키워드 */
  const [currentKeyword, setCurrentKeyword] = useState<string>("");

  /** 현재 step의 최신 값을 유지 (이벤트 핸들러에서 사용) */
  const stepRef = useRef<Step>(step);

  // ============================================
  // 커스텀 훅
  // ============================================

  const { storyResult, isLoading, error, generateStory, resetStory, setError } =
    useStoryGeneration();

  const { requestAd, loadAd } = useAdManagement({
    onAdCompleted: () => {
      setStep("loading");
      generateStory(keywords).then((success) => {
        if (success) {
          setStep("result");
        } else {
          setStep("error");
        }
      });
    },
    onAdSkipped: () => {
      setStep("intro");
      setError("광고를 끝까지 시청해주세요");
    },
  });

  // ============================================
  // Effect Hooks
  // ============================================

  /**
   * step이 변경될 때마다 ref 업데이트
   */
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  /**
   * 뒤로가기 이벤트 핸들러
   */
  useEffect(() => {
    window.history.pushState({ page: "app" }, "", "");

    const handlePopState = () => {
      const currentStep = stepRef.current;

      if (currentStep === "intro") {
        return;
      }

      window.history.pushState({ page: "app" }, "", "");
      handleGoHome();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * 로딩 상태에 따라 step 업데이트
   */
  useEffect(() => {
    if (isLoading) {
      setStep("loading");
    }
  }, [isLoading]);

  // ============================================
  // 키워드 입력 관련 함수
  // ============================================

  /**
   * 키워드 입력 변경 핸들러
   */
  const handleKeywordChange = (value: string) => {
    setCurrentKeyword(value);
    setError("");
  };

  /**
   * 키워드 추가 (Enter 키 또는 버튼 클릭)
   */
  const handleAddKeyword = () => {
    const trimmedKeyword = currentKeyword.trim();

    if (!trimmedKeyword) {
      return;
    }

    if (keywords.length >= 10) {
      setError("키워드는 최대 10개까지 입력할 수 있습니다");
      return;
    }

    if (keywords.includes(trimmedKeyword)) {
      setError("이미 추가된 키워드입니다");
      return;
    }

    setKeywords([...keywords, trimmedKeyword]);
    setCurrentKeyword("");
    setError("");
  };

  /**
   * 키워드 삭제
   */
  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter((k) => k !== keywordToRemove));
    setError("");
  };

  /**
   * Enter 키 입력 핸들러
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  /**
   * 스토리 생성 요청
   */
  const handleSubmit = () => {
    if (keywords.length === 0) {
      setError("최소 1개 이상의 키워드를 입력해주세요");
      return;
    }

    requestAd();
  };

  /**
   * 홈(인트로) 화면으로 이동합니다.
   */
  const handleGoHome = () => {
    setStep("intro");
    setKeywords([]);
    setCurrentKeyword("");
    resetStory();
    setError("");
    loadAd("rewarded");
  };

  // ============================================
  // 렌더링
  // ============================================

  if (step === "intro") {
    return (
      <IntroScreen
        currentKeyword={currentKeyword}
        keywords={keywords}
        error={error}
        onKeywordChange={handleKeywordChange}
        onAddKeyword={handleAddKeyword}
        onRemoveKeyword={handleRemoveKeyword}
        onKeyPress={handleKeyPress}
        onSubmit={handleSubmit}
      />
    );
  }

  if (step === "loading") {
    return <LoadingScreen />;
  }

  if (step === "result" && storyResult) {
    return <ResultScreen storyResult={storyResult} onGoHome={handleGoHome} />;
  }

  return <ErrorScreen error={error} onGoHome={handleGoHome} />;
}

export default StoryGeneratePage;
