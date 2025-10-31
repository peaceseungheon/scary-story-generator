# StoryGeneratePage 리팩토링 문서

## 개요

861줄의 단일 파일 컴포넌트를 모듈화하여 가독성과 유지보수성을 향상시켰습니다.

## 새로운 프로젝트 구조

```
src/
├── types/
│   └── story.ts                    # 타입 정의
├── constants/
│   ├── ad.ts                       # 광고 관련 상수
│   └── api.ts                      # API 관련 상수
├── utils/
│   └── helpers.ts                  # 유틸리티 함수
├── hooks/
│   ├── useAdManagement.ts          # 광고 관리 커스텀 훅
│   └── useStoryGeneration.ts      # 스토리 생성 커스텀 훅
├── components/
│   └── StoryGenerate/
│       ├── IntroScreen.tsx         # 인트로 화면
│       ├── LoadingScreen.tsx       # 로딩 화면
│       ├── ResultScreen.tsx        # 결과 화면
│       ├── ErrorScreen.tsx         # 에러 화면
│       └── index.ts                # 컴포넌트 export
└── pages/
    ├── StoryGeneratePage.tsx       # 리팩토링된 메인 페이지 (200줄)
    └── StoryGeneratePage.tsx.backup # 원본 파일 백업
```

## 주요 개선 사항

### 1. **타입 정의 분리** (`types/story.ts`)
- `Step`, `AdType`, `StoryResult`, `ApiResponse` 타입을 별도 파일로 분리
- 타입 재사용성 향상

### 2. **상수 분리**
- **ad.ts**: 광고 관련 상수 (`AD_GROUP_IDS`, `AD_RETRY_CONFIG`)
- **api.ts**: API 관련 상수 (`DEFAULT_API_URL`, `DEFAULT_REQUEST_TIMEOUT_MS` 등)

### 3. **유틸리티 함수 분리** (`utils/helpers.ts`)
- `sleep()`: Promise 기반 지연 함수
- `parseNumberEnv()`: 환경 변수 파싱 함수

### 4. **커스텀 훅 분리**

#### `useAdManagement` (광고 관리)
- 광고 로드 및 표시 로직
- 광고 상태 관리
- 재시도 로직
- 광고 타입 전환 (보상형 ↔ 전면형)

**반환값:**
```typescript
{
  adLoaded: boolean;
  adShowing: boolean;
  adType: AdType;
  waitingForAd: boolean;
  requestAd: () => void;
  loadAd: (type: AdType) => void;
}
```

#### `useStoryGeneration` (스토리 생성)
- 스토리 생성 API 호출
- 재시도 로직 포함
- 에러 처리

**반환값:**
```typescript
{
  storyResult: StoryResult | null;
  isLoading: boolean;
  error: string;
  generateStory: (keywords: string[]) => Promise<boolean>;
  resetStory: () => void;
  setError: (error: string) => void;
}
```

### 5. **UI 컴포넌트 분리**

각 화면을 독립적인 컴포넌트로 분리하여 관심사 분리:

- **IntroScreen**: 키워드 입력 화면
- **LoadingScreen**: 로딩 화면
- **ResultScreen**: 스토리 결과 화면
- **ErrorScreen**: 에러 화면

### 6. **메인 컴포넌트 간소화**

861줄 → **약 200줄**로 축소

**주요 역할:**
- 화면 상태(Step) 관리
- 키워드 입력 관리
- 커스텀 훅 조율
- 화면 렌더링 분기

## 장점

### 1. **가독성 향상**
- 각 파일이 단일 책임을 가짐
- 코드 네비게이션이 쉬워짐

### 2. **재사용성**
- 커스텀 훅을 다른 컴포넌트에서도 사용 가능
- UI 컴포넌트 독립적으로 테스트 및 재사용 가능

### 3. **유지보수성**
- 버그 수정 시 해당 파일만 수정
- 기능 추가 시 영향 범위 최소화

### 4. **테스트 용이성**
- 각 모듈을 독립적으로 테스트 가능
- 모의(mock) 객체 주입이 쉬움

### 5. **협업 효율성**
- 여러 개발자가 동시에 다른 파일을 수정 가능
- 코드 리뷰가 명확해짐

## 사용 예시

### 커스텀 훅 사용

```typescript
// 광고 관리
const { requestAd, loadAd } = useAdManagement({
  onAdCompleted: () => {
    // 광고 완료 후 로직
  },
  onAdSkipped: () => {
    // 광고 스킵 시 로직
  },
});

// 스토리 생성
const { storyResult, isLoading, error, generateStory } = useStoryGeneration();

// 스토리 생성 요청
const success = await generateStory(['키워드1', '키워드2']);
```

### 컴포넌트 사용

```typescript
import { IntroScreen, LoadingScreen, ResultScreen, ErrorScreen } from '@/components/StoryGenerate';

// 조건부 렌더링
if (step === 'intro') {
  return <IntroScreen {...props} />;
}
```

## 마이그레이션 가이드

### 원본 파일 복구 방법

리팩토링 전 파일은 백업되어 있습니다:

```bash
# 원본 복구
mv src/pages/StoryGeneratePage.tsx.backup src/pages/StoryGeneratePage.tsx
```

### 점진적 마이그레이션

1. 백업 파일과 리팩토링된 파일을 비교
2. 기능별로 하나씩 마이그레이션
3. 각 단계마다 테스트

## 향후 개선 사항

1. **테스트 코드 작성**
   - 각 커스텀 훅에 대한 단위 테스트
   - 컴포넌트 렌더링 테스트

2. **에러 바운더리 추가**
   - React Error Boundary로 예외 처리 개선

3. **상태 관리 라이브러리 도입**
   - 복잡도가 증가하면 Zustand 또는 Jotai 고려

4. **코드 스플리팅**
   - 빌드 번들 크기 최적화 (현재 1.1MB)
   - 동적 import 활용

## 참고사항

- 모든 기존 기능은 그대로 유지됩니다
- API 호출 로직 변경 없음
- 광고 시스템 동작 방식 동일
- UI/UX 변경 없음
