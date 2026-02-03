# Vote Platform - 기능 정의서

## 개요
고급스럽고 모던하며 심플한 **순수 투표 플랫폼**

---

## 핵심 기능

### 1. 투표 (Poll)

#### 1.1 투표 생성
- [ ] 질문 입력 (제목)
- [ ] 설명 추가 (선택)
- [ ] 선택지 추가 (2개 이상, 최대 10개)
- [ ] 마감일 설정
- [ ] 카테고리 선택 (Tech, Sports, Entertainment, etc.)
- [ ] 중복 투표 방지 옵션 (IP/브라우저 기반)

#### 1.2 투표 참여
- [ ] 선택지 클릭으로 투표
- [ ] 투표 후 결과 즉시 확인
- [ ] 인증 없이 익명 참여

#### 1.3 투표 결과
- [ ] 실시간 결과 시각화 (막대 그래프)
- [ ] 퍼센트 표시
- [ ] 총 참여자 수 표시
- [ ] 각 선택지별 투표 수

#### 1.4 투표 상태
- **Active**: 진행 중인 투표
- **Completed**: 마감된 투표
- **Featured**: 인기/추천 투표

---

### 2. 투표 목록

#### 2.1 메인 화면
- [ ] Featured Poll (메인 배너)
- [ ] Trending Polls (인기 투표 4개)
- [ ] All Polls (전체 목록 테이블)

#### 2.2 필터링 & 정렬
- [ ] 카테고리 필터
- [ ] 정렬 옵션 (최신순, 인기순, 마감임박순)
- [ ] 검색 기능

#### 2.3 투표 카드 정보
- 질문 (제목)
- 참여자 수
- 남은 시간 / 마감일
- 현재 1위 선택지 (선택)

---

### 3. 투표 상세 페이지

- [ ] 투표 질문 표시
- [ ] 설명 표시
- [ ] 선택지 목록 + 결과 그래프
- [ ] 투표 버튼 (미투표 시)
- [ ] 공유 버튼 (URL 복사)
- [ ] 관련 투표 추천

---

## 기술 스택 (예정)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State**: Zustand or React Query
- **UI Components**: Radix UI / shadcn/ui

### Backend
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime

### Infrastructure
- **Hosting**: Vercel
- **Analytics**: Vercel Analytics

---

## 데이터 모델

### Poll (투표)
```typescript
interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  category: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'active' | 'completed';
  totalVotes: number;
  isFeatured: boolean;
}
```

### PollOption (선택지)
```typescript
interface PollOption {
  id: string;
  pollId: string;
  text: string;
  votes: number;
  percentage: number;
}
```

### Vote (투표 기록)
```typescript
interface Vote {
  id: string;
  pollId: string;
  optionId: string;
  visitorId: string; // 브라우저 fingerprint
  createdAt: Date;
}
```

---

## API 엔드포인트 (예정)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/polls` | 투표 목록 조회 |
| GET | `/api/polls/:id` | 투표 상세 조회 |
| POST | `/api/polls` | 투표 생성 |
| POST | `/api/polls/:id/vote` | 투표 참여 |
| GET | `/api/polls/featured` | Featured 투표 조회 |
| GET | `/api/polls/trending` | Trending 투표 조회 |

---

## 페이지 구조

```
/                   # 메인 (투표 목록)
/poll/:id           # 투표 상세
/create             # 투표 생성
/completed          # 완료된 투표 목록
```

---

## 디자인 시스템

### 컬러
| Token | Value | Usage |
|-------|-------|-------|
| `bg-page` | #FFFFFF | 페이지 배경 |
| `bg-card` | #FAFAFA | 카드 배경 |
| `text-primary` | #111111 | 주요 텍스트 |
| `text-secondary` | #666666 | 보조 텍스트 |
| `accent-blue` | #2563EB | 강조, 버튼 |
| `border` | #E5E5E5 | 테두리 |

### 타이포그래피
- **Headline**: Cormorant Garamond (serif)
- **Body/UI**: Inter (sans-serif)

### 컴포넌트 스타일
- Corner Radius: 0px (sharp edges)
- Border: 1px solid
- Button Padding: 14px 32px

---

## 우선순위

### MVP (Phase 1)
1. 투표 목록 페이지
2. 투표 상세 페이지
3. 투표 참여 기능
4. 실시간 결과 표시

### Phase 2
1. 투표 생성 기능
2. 카테고리 필터
3. 검색 기능

### Phase 3
1. 공유 기능
2. 관련 투표 추천
3. 통계/분석

---

## 참고
- 디자인 파일: `pencil-new.pen`
- 디자인 스크린샷: Pencil에서 확인
