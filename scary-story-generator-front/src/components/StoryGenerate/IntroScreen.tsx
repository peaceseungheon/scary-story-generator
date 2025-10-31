import { Button, TextField } from '@toss/tds-mobile';

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
  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
        무서운 썰 생성기
      </h1>

      <p style={{ fontSize: '14px', color: '#6B7684', marginBottom: '24px' }}>
        스토리에 포함할 키워드를 입력하세요 (최대 10개)
      </p>

      {/* 키워드 입력 필드 */}
      <div style={{ marginBottom: '16px' }}>
        <TextField
          variant="box"
          label="키워드 입력"
          value={currentKeyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          onKeyDown={onKeyPress}
          placeholder="예: 학교 괴담, 엘리베이터"
          disabled={keywords.length >= 10}
        />
      </div>

      <Button
        onClick={onAddKeyword}
        disabled={!currentKeyword.trim() || keywords.length >= 10}
        style={{
          marginBottom: '16px',
          padding: '10px 16px',
          fontSize: '14px',
        }}
      >
        키워드 추가
      </Button>

      {/* 에러 메시지 */}
      {error && (
        <div style={{
          color: '#FF4D4F',
          fontSize: '14px',
          marginBottom: '16px',
          padding: '8px 12px',
          backgroundColor: '#FFF1F0',
          borderRadius: '8px',
        }}>
          {error}
        </div>
      )}

      {/* 추가된 키워드 목록 */}
      {keywords.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '12px',
          }}>
            {keywords.map((keyword) => (
              <div
                key={keyword}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  backgroundColor: '#F5F6F8',
                  borderRadius: '16px',
                  fontSize: '14px',
                  color: '#191F28',
                }}
              >
                <span>{keyword}</span>
                <button
                  onClick={() => onRemoveKeyword(keyword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#6B7684',
                    fontSize: '16px',
                  }}
                  aria-label={`${keyword} 삭제`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: '#6B7684' }}>
            {keywords.length}/10개의 키워드가 추가되었습니다
          </p>
        </div>
      )}

      {/* 스토리 생성 버튼 */}
      <Button
        onClick={onSubmit}
        disabled={keywords.length === 0}
        style={{ width: '100%', padding: '14px', fontSize: '16px' }}
      >
        스토리 생성하기
      </Button>
    </div>
  );
};
