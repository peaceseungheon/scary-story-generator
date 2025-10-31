import { Button } from '@toss/tds-mobile';
import type { StoryResult } from '@/types/story';

interface ResultScreenProps {
  storyResult: StoryResult;
  onGoHome: () => void;
}

export const ResultScreen = ({ storyResult, onGoHome }: ResultScreenProps) => {
  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        {storyResult.title}
      </h1>
      {storyResult.imageUrl && (
        <img
          src={storyResult.imageUrl}
          alt="스토리 대표 이미지"
          style={{
            width: '100%',
            maxWidth: '500px',
            borderRadius: '12px',
            marginBottom: '24px',
          }}
        />
      )}
      <div style={{
        whiteSpace: 'pre-wrap',
        lineHeight: '1.7',
        fontSize: '15px',
        color: '#191F28',
        marginBottom: '32px',
      }}>
        {storyResult.content}
      </div>
      <Button
        onClick={onGoHome}
        style={{ width: '100%', padding: '14px', fontSize: '16px' }}
      >
        새로운 스토리 만들기
      </Button>
    </div>
  );
};
