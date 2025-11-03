import { Button } from "@toss/tds-mobile";
import { saveBase64Data } from "@apps-in-toss/web-framework";
import type { StoryResult } from "@/types/story";

interface ResultScreenProps {
  storyResult: StoryResult;
  onGoHome: () => void;
}

export const ResultScreen = ({ storyResult, onGoHome }: ResultScreenProps) => {
  const handleCopyStory = async () => {
    try {
      await navigator.clipboard.writeText(storyResult.content);
      alert("스토리가 클립보드에 복사되었습니다.");
    } catch (err) {
      console.error("복사 실패:", err);
      // fallback: create textarea
      try {
        const el = document.createElement("textarea");
        el.value = storyResult.content;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        alert("스토리가 클립보드에 복사되었습니다.");
      } catch (e) {
        console.error("복사 대체 방법 실패:", e);
        alert("스토리 복사에 실패했습니다.");
      }
    }
  };

  const handleDownloadImage = async () => {
    try {
      const imageUrl = storyResult.imageUrl;
      if (!imageUrl) {
        alert("저장할 이미지가 없습니다.");
        return;
      }

      // data URI
      if (imageUrl.startsWith("data:")) {
        const base64Data = imageUrl.split(",")[1];
        const mimeType = imageUrl.match(/data:([^;]+);/)?.[1] || "image/png";

        await saveBase64Data({
          data: base64Data!,
          fileName: `story-image-${Date.now()}.png`,
          mimeType,
        });
        return;
      }

      // URL: fetch and convert to base64
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") resolve(reader.result);
          else reject(new Error("이미지 데이터를 읽을 수 없습니다."));
        };
        reader.onerror = () =>
          reject(reader.error ?? new Error("이미지 읽기 오류"));
        reader.readAsDataURL(blob);
      });

      const base64Data = dataUrl.split(",")[1];
      if (!base64Data) throw new Error("잘못된 이미지 데이터");

      await saveBase64Data({
        data: base64Data!,
        fileName: `story-image-${Date.now()}.png`,
        mimeType: blob.type || "image/png",
      });
    } catch (err) {
      console.error("이미지 저장 실패:", err);
      alert("이미지 저장에 실패했습니다.");
    }
  };
  return (
    <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
      <h1
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}
      >
        {storyResult.title}
      </h1>
      <div
        style={{
          whiteSpace: "pre-wrap",
          lineHeight: "1.7",
          fontSize: "15px",
          color: "#191F28",
          marginBottom: "32px",
        }}
      >
        {storyResult.content}
      </div>
      {storyResult.imageUrl && (
        <img
          src={storyResult.imageUrl}
          alt="스토리 대표 이미지"
          style={{
            width: "100%",
            maxWidth: "500px",
            borderRadius: "12px",
            marginBottom: "24px",
          }}
        />
      )}
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <Button
          onClick={handleCopyStory}
          style={{ flex: 1, padding: "12px", fontSize: "16px" }}
        >
          스토리 복사
        </Button>
        <Button
          onClick={handleDownloadImage}
          style={{ flex: 1, padding: "12px", fontSize: "16px" }}
        >
          이미지 저장
        </Button>
      </div>

      <Button
        onClick={onGoHome}
        style={{ width: "100%", padding: "14px", fontSize: "16px" }}
      >
        새로운 스토리 만들기
      </Button>
    </div>
  );
};
