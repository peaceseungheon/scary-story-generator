export const LoadingScreen = () => {
  return (
    <div style={{
      padding: '24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid #F5F6F8',
        borderTopColor: '#3182F6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '24px',
      }} />
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
        무서운 썰을 생성하는 중...
      </h2>
      <p style={{ fontSize: '14px', color: '#6B7684' }}>
        잠시만 기다려주세요
      </p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
