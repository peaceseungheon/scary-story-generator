import { saveBase64Data } from "@apps-in-toss/web-framework";
import type { StoryResult } from "@/types/story";
import { Button, Modal } from "@toss/tds-mobile";
import { useState } from "react";

interface ResultScreenProps {
  storyResult: StoryResult;
  onGoHome: () => void;
}

export const ResultScreen = ({ storyResult, onGoHome }: ResultScreenProps) => {
  const [modalOpen, setModalOpen] = useState(false);

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
    <div
      style={{
        padding: "24px",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "transparent",
      }}
    >
      <h1
        style={{
          fontSize: "24px",
          fontWeight: 700,
          marginBottom: "20px",
          color: "#FFFFFF",
        }}
      >
        {storyResult.title}
      </h1>
      <div
        style={{
          whiteSpace: "pre-wrap",
          lineHeight: "1.7",
          fontSize: "15px",
          color: "#cbd5e1",
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
            boxShadow: "0 6px 18px rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.03)",
          }}
        />
      )}
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <Button
          onClick={() => setModalOpen(true)}
          color="dark"
          style={{
            flex: 1,
            padding: "12px",
            fontSize: "16px",
            backgroundColor: "#2b3240",
            color: "#fff",
            border: "1px solid #3a4149",
            height: "60px",
          }}
        >
          스토리 복사
        </Button>
        <Modal open={modalOpen} onOpenChange={() => setModalOpen(false)}>
          <Modal.Overlay />
          <Modal.Content
            style={{
              padding: "32px 20px 20px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <p style={{ marginBottom: "24px" }}>
              스토리가 클립보드에 복사되었습니다.
            </p>
            <Button
              display="block"
              color="dark"
              onClick={() => setModalOpen(false)}
            >
              닫기
            </Button>
          </Modal.Content>
        </Modal>
        <Button
          onClick={handleDownloadImage}
          color="dark"
          style={{
            flex: 1,
            padding: "12px",
            fontSize: "16px",
            backgroundColor: "#2b3240",
            color: "#fff",
            border: "1px solid #3a4149",
            height: "60px",
          }}
        >
          이미지 저장
        </Button>
      </div>

      <Button
        onClick={onGoHome}
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "16px",
          backgroundColor: "#7B1424",
          color: "#fff",
          border: "1px solid #8f1f2f",
          height: "70px",
        }}
        color="dark"
      >
        새로운 스토리 만들기
      </Button>
    </div>
  );
};
