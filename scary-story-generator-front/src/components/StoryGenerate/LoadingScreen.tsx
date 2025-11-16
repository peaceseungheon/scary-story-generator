export const LoadingScreen = () => {
  return (
    <div
      style={{
        padding: "24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          border: "4px solid #1f2933",
          borderTopColor: "#5b9cff",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "24px",
        }}
      />
      <h2
        style={{
          fontSize: "20px",
          fontWeight: "700",
          marginBottom: "8px",
          color: "#FFFFFF",
        }}
      >
        무서운 썰을 생성하는 중...
      </h2>
      <p style={{ fontSize: "14px", color: "#9aa6b2" }}>잠시만 기다려주세요</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
