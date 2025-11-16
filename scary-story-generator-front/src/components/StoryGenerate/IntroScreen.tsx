import { TextField, Modal, Button } from "@toss/tds-mobile";
import { useState } from "react";

interface IntroScreenProps {
  currentKeyword: string;
  keywords: string[];
  error: string;
  onKeywordChange: (value: string) => void;
  onAddKeyword: () => void;
  onRemoveKeyword: (keyword: string) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

export const IntroScreen = ({
  currentKeyword,
  keywords,
  error,
  onKeywordChange,
  onAddKeyword,
  onRemoveKeyword,
  onKeyPress,
  onSubmit,
}: IntroScreenProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          fontSize: "28px",
          fontWeight: "bold",
          marginBottom: "8px",
          color: "#FFFFFF",
        }}
      >
        무서운 썰 생성기
      </h1>

      <p style={{ fontSize: "14px", color: "#c0c7cf", marginBottom: "24px" }}>
        스토리에 포함할 키워드를 입력하세요 (최대 10개)
      </p>

      {/* 키워드 입력 필드 (입력창 + 추가 버튼을 같은 행으로 정렬) */}
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            alignItems: "center",
            justifyContent: "start",
          }}
        >
          <TextField
            variant="line"
            value={currentKeyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            onKeyDown={onKeyPress}
            placeholder="예: 학교 괴담"
            disabled={keywords.length >= 10}
            style={{
              color: "#FFFFFF",
              border: "2px solid #fff",
              borderRadius: 6,
              padding: "10px",
            }}
          />
        </div>

        <button
          onClick={onAddKeyword}
          disabled={!currentKeyword.trim() || keywords.length >= 10}
          style={{
            marginBottom: "0",
            padding: "8px 12px",
            fontSize: "14px",
            minWidth: 120,
            height: 40,
            borderRadius: 6,
            backgroundColor: "#2b3240",
            color: "#FFFFFF",
            border: "1px solid #3a4149",
          }}
        >
          키워드 추가
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div
          style={{
            color: "#FFD2D6",
            fontSize: "14px",
            marginBottom: "16px",
            padding: "8px 12px",
            backgroundColor: "#2a1114",
            borderRadius: "6px",
            border: "1px solid #4b1518",
          }}
        >
          {error}
        </div>
      )}

      {/* 추가된 키워드 목록 */}
      {keywords.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            {keywords.map((keyword) => (
              <div
                key={keyword}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  backgroundColor: "#0F1720",
                  borderRadius: "16px",
                  fontSize: "14px",
                  color: "#cbd5e1",
                  border: "1px solid #20262b",
                }}
              >
                <span>{keyword}</span>
                <button
                  onClick={() => onRemoveKeyword(keyword)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0",
                    display: "flex",
                    alignItems: "center",
                    color: "#6B7684",
                    fontSize: "16px",
                  }}
                  aria-label={`${keyword} 삭제`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "13px", color: "#9aa6b2" }}>
            {keywords.length}/10개의 키워드가 추가되었습니다
          </p>
        </div>
      )}

      {/* 기능 안내 메시지 */}
      <div
        style={{
          marginBottom: "16px",
          fontSize: "13px",
          color: "#9aa6b2",
          lineHeight: 1.5,
        }}
      >
        <p style={{ margin: "4px 0" }}>
          1. 키워드를 입력하고 키워드를 추가해보세요.
        </p>
        <p style={{ margin: "4px 0" }}>
          2. 스토리 생성하기 버튼을 클릭해 무서운 썰을 만들어보세요!
        </p>
      </div>

      {/* 스토리 생성 버튼 */}
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={keywords.length === 0}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          borderRadius: 6,
          backgroundColor: "#7B1424",
          color: "#FFFFFF",
          border: "1px solid #8f1f2f",
        }}
      >
        스토리 생성하기
      </button>
      <Modal open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
        <Modal.Overlay />
        <Modal.Content>
          <div
            style={{
              backgroundColor: "black",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              padding: "24px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "white" }}>
              광고 시청 후 오싹한 썰을 만들어보세요!
            </p>
            <Button color="primary" onClick={onSubmit}>
              썰 만들기
            </Button>
            <Button color="dark" onClick={() => setIsModalOpen(false)}>
              닫기
            </Button>
          </div>
        </Modal.Content>
      </Modal>
    </div>
  );
};
