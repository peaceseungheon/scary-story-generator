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

  const [step, setStep] = useState<Step>("intro");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState<string>("");
  const stepRef = useRef<Step>(step);

  const { storyResult, isLoading, error, generateStory, resetStory, setError } =
    useStoryGeneration();

  const [adFinished, setAdFinished] = useState<boolean>(false);
  const [storyFinished, setStoryFinished] = useState<boolean>(false);
  const [storySuccess, setStorySuccess] = useState<boolean | null>(null);

  const { requestAd, loadAd } = useAdManagement({
    onAdCompleted: () => {
      setAdFinished(true);
      if (storyFinished) {
        if (storySuccess) setStep("result");
        else setStep("error");
      }
    },
    onAdSkipped: () => {
      // user skipped ad -> reset story and go home
      setAdFinished(false);
      setStoryFinished(false);
      setStorySuccess(null);
      resetStory();
      setStep("intro");
      setError("광고를 끝까지 시청해주세요");
    },
  });

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    window.history.pushState({ page: "app" }, "", "");

    const handlePopState = () => {
      const currentStep = stepRef.current;
      if (currentStep === "intro") return;
      window.history.pushState({ page: "app" }, "", "");
      handleGoHome();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isLoading) setStep("loading");
  }, [isLoading]);

  // 키워드 핸들러
  const handleKeywordChange = (value: string) => {
    setCurrentKeyword(value);
    setError("");
  };

  const handleAddKeyword = () => {
    const trimmed = currentKeyword.trim();
    if (!trimmed) return;
    if (keywords.length >= 10) {
      setError("키워드는 최대 10개까지 입력할 수 있습니다");
      return;
    }
    if (keywords.includes(trimmed)) {
      setError("이미 추가된 키워드입니다");
      return;
    }
    setKeywords((k) => [...k, trimmed]);
    setCurrentKeyword("");
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords((k) => k.filter((x) => x !== keywordToRemove));
    setError("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  // 제출: 광고 요청과 스토리 생성 병렬 시작
  const handleSubmit = () => {
    if (keywords.length === 0) {
      setError("최소 1개 이상의 키워드를 입력해주세요");
      return;
    }

    setStep("loading");

    // reset coordination
    setAdFinished(false);
    setStoryFinished(false);
    setStorySuccess(null);

    // start story generation immediately
    generateStory(keywords)
      .then((success) => {
        setStoryFinished(true);
        setStorySuccess(success);
        if (success) setStep("result");
        else setStep("error");
      })
      .catch(() => {
        setStoryFinished(true);
        setStorySuccess(false);
        setStep("error");
      });

    // request ad in parallel
    requestAd();
  };

  const handleGoHome = () => {
    setStep("intro");
    setKeywords([]);
    setCurrentKeyword("");
    resetStory();
    setError("");
    loadAd("rewarded");
  };

  // 렌더링
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

  if (step === "loading") return <LoadingScreen />;

  if (step === "result" && storyResult)
    return <ResultScreen storyResult={storyResult} onGoHome={handleGoHome} />;

  return <ErrorScreen error={error} onGoHome={handleGoHome} />;
}

export default StoryGeneratePage;
