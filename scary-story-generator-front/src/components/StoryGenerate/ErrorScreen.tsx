import { Button } from "@toss/tds-mobile";

interface ErrorScreenProps {
  error: string;
  onGoHome: () => void;
}

export const ErrorScreen = ({ error, onGoHome }: ErrorScreenProps) => {
  return (
    <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
      <div
        style={{
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            marginBottom: "12px",
            color: "#FFFFFF",
          }}
        >
          오류가 발생했습니다
        </h2>
        <div
          style={{
            color: "#FFD2D6",
            fontSize: "14px",
            marginBottom: "32px",
            padding: "12px 16px",
            backgroundColor: "#2a1114",
            borderRadius: "8px",
            border: "1px solid #4b1518",
          }}
        >
          {error}
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
          }}
        >
          처음으로 돌아가기
        </Button>
      </div>
    </div>
  );
};
