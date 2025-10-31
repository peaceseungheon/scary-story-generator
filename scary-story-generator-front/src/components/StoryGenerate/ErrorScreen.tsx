import { Button } from '@toss/tds-mobile';

interface ErrorScreenProps {
  error: string;
  onGoHome: () => void;
}

export const ErrorScreen = ({ error, onGoHome }: ErrorScreenProps) => {
  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
          오류가 발생했습니다
        </h2>
        <div style={{
          color: '#FF4D4F',
          fontSize: '14px',
          marginBottom: '32px',
          padding: '12px 16px',
          backgroundColor: '#FFF1F0',
          borderRadius: '8px',
        }}>
          {error}
        </div>
        <Button
          onClick={onGoHome}
          style={{ width: '100%', padding: '14px', fontSize: '16px' }}
        >
          처음으로 돌아가기
        </Button>
      </div>
    </div>
  );
};
