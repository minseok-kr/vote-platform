# Vote Platform - 심플 투표 플랫폼

> **배포 URL**: https://atat.im/poll
> **기술 스택**: Next.js 15, React 19, SQLite (better-sqlite3), Tailwind CSS 4, TypeScript

## 프로젝트 개요

익명으로 누구나 참여할 수 있는 심플한 투표 플랫폼입니다. 토스(Toss) 스타일의 모던한 UI/UX를 적용했습니다.

### 핵심 기능
- 투표 생성/참여 (익명)
- 실시간 결과 시각화 (애니메이션 바)
- 카테고리별 필터링/정렬
- 투표 검색
- 북마크 (로컬 스토리지)
- 공유 (Web Share API, QR 코드)
- 다크/라이트 테마

---

## 디렉토리 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── polls/         # 투표 CRUD
│   │   │   ├── route.ts           # GET (목록), POST (생성)
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts       # GET (단일)
│   │   │   │   ├── vote/route.ts  # POST (투표), GET (투표 확인)
│   │   │   │   └── export/route.ts # GET (CSV 내보내기)
│   │   │   └── search/route.ts    # GET (검색)
│   │   └── stats/route.ts # 통계 API
│   ├── page.tsx           # 메인 페이지
│   ├── polls/[id]/page.tsx # 투표 상세
│   ├── create/page.tsx    # 투표 생성
│   ├── search/page.tsx    # 검색
│   ├── completed/page.tsx # 완료된 투표
│   ├── bookmarks/page.tsx # 북마크
│   ├── stats/page.tsx     # 통계
│   ├── layout.tsx         # 레이아웃 (Outfit 폰트)
│   └── globals.css        # 토스 스타일 CSS 변수
├── components/            # UI 컴포넌트
│   ├── header.tsx         # 헤더 (네비게이션, 투표 만들기 버튼)
│   ├── featured-poll.tsx  # 피처드 투표 (메인 투표 카드)
│   ├── trending-polls.tsx # 인기 투표 그리드
│   ├── all-polls.tsx      # 전체 투표 리스트 (필터/정렬)
│   ├── poll-detail.tsx    # 투표 상세 페이지
│   ├── create-poll.tsx    # 투표 생성 폼
│   ├── search-polls.tsx   # 검색 컴포넌트
│   ├── animated-bar.tsx   # 애니메이션 진행 바
│   ├── theme-toggle.tsx   # 테마 토글
│   ├── share-button.tsx   # 공유 버튼
│   ├── bookmark-button.tsx # 북마크 버튼
│   └── qr-code.tsx        # QR 코드 생성
├── lib/
│   ├── db.ts              # SQLite 데이터베이스 (better-sqlite3)
│   ├── api.ts             # 서버 사이드 데이터 fetching
│   ├── utils.ts           # 유틸리티 (시간 포맷, 숫자 포맷)
│   └── visitor.ts         # 방문자 ID (익명 투표용)
├── hooks/
│   ├── use-theme.ts       # 테마 훅
│   ├── use-bookmarks.ts   # 북마크 훅 (로컬 스토리지)
│   └── use-realtime-poll.ts # 실시간 투표 업데이트
└── types/
    ├── index.ts           # 타입 export
    └── database.ts        # 데이터베이스 타입 정의
```

---

## 데이터베이스 스키마

SQLite (better-sqlite3) 사용:

```sql
-- 투표 테이블
CREATE TABLE polls (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'other',  -- tech, sports, entertainment, politics, lifestyle, business, other
  status TEXT DEFAULT 'active',   -- active, completed
  is_featured INTEGER DEFAULT 0,
  expires_at TEXT,
  created_at TEXT,
  updated_at TEXT
);

-- 선택지 테이블
CREATE TABLE poll_options (
  id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL,
  text TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  FOREIGN KEY (poll_id) REFERENCES polls(id)
);

-- 투표 기록 테이블 (중복 투표 방지)
CREATE TABLE votes (
  id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL,
  option_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at TEXT,
  UNIQUE(poll_id, visitor_id)  -- 투표당 방문자 1회 투표
);
```

---

## API 엔드포인트

### 투표 목록
```
GET /api/polls
  ?status=active|completed
  ?category=tech|sports|...
  ?featured=true
  ?trending=true
  ?limit=10&offset=0
```

### 투표 생성
```
POST /api/polls
Body: {
  question: string (5-200자),
  description?: string (최대 500자),
  category?: PollCategory,
  options: string[] (2-10개),
  expires_at: ISO datetime
}
```

### 투표하기
```
POST /api/polls/[id]/vote
Body: { optionId: string, visitorId: string }
```

### 투표 여부 확인
```
GET /api/polls/[id]/vote?visitorId=xxx
```

### 검색
```
GET /api/polls/search?q=검색어
```

---

## 디자인 시스템 (토스 스타일)

### 컬러 변수 (`globals.css`)

```css
:root {
  /* 배경 */
  --bg-page: #F7F8FA;
  --bg-card: #FFFFFF;
  --bg-muted: #F2F4F6;
  --bg-active: #E8F3FF;

  /* 텍스트 */
  --text-primary: #191F28;
  --text-secondary: #4E5968;
  --text-tertiary: #8B95A1;
  --text-muted: #B0B8C1;

  /* 악센트 (토스 블루) */
  --accent-blue: #3182F6;
  --accent-blue-light: #E8F3FF;

  /* 상태 */
  --success: #00C853;
  --warning: #FF8A00;
  --error: #F04452;

  /* 카테고리 컬러 */
  --category-tech: #E8F3FF;
  --category-sports: #E8F9EE;
  --category-entertainment: #FFF4E5;
  --category-politics: #FEECEE;
  --category-lifestyle: #F3E8FF;

  /* 섀도우 */
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-button: 0 4px 16px rgba(49, 130, 246, 0.24);

  /* 라운드 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}
```

### CSS 클래스

- `.card-toss` - 토스 스타일 카드 (배경 + 라운드 + 섀도우)
- `.btn-toss` - 토스 스타일 버튼 (블루 + 섀도우 + 호버 lift)
- `.badge` - 뱃지 기본
- `.badge-hot`, `.badge-tech`, `.badge-sports` 등 - 카테고리별 뱃지

### 폰트

- **Outfit** (Google Fonts) - 메인 폰트

---

## 주요 컴포넌트 패턴

### 투표 옵션 (라디오 버튼 스타일)
```tsx
<button className={`relative w-full overflow-hidden rounded-[var(--radius-md)] ${
  isSelected ? "ring-2 ring-[var(--accent-blue)] ring-offset-2" : ""
}`}>
  <div className="absolute inset-0 bg-[var(--bg-muted)]" />
  {showResults && <AnimatedBar percentage={option.percentage} color={color} />}
  <div className="relative flex items-center gap-3 px-4 py-4">
    <div className={`w-5 h-5 rounded-full border-2 ${
      isSelected ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]" : "border-[var(--border-secondary)]"
    }`}>
      {isSelected && <Check size={12} className="text-white" />}
    </div>
    <span>{option.text}</span>
  </div>
</button>
```

### 카테고리 뱃지
```tsx
const CATEGORY_STYLES = {
  tech: { bg: "var(--category-tech)", text: "var(--category-tech-text)", label: "기술" },
  sports: { bg: "var(--category-sports)", text: "var(--category-sports-text)", label: "스포츠" },
  // ...
};

<span style={{ backgroundColor: categoryStyle.bg, color: categoryStyle.text }}>
  {categoryStyle.label}
</span>
```

---

## 배포 설정

### Next.js 설정 (`next.config.ts`)
```ts
const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/poll",
  assetPrefix: "/poll",
  trailingSlash: false,
};
```

### nginx 설정 (`/etc/nginx/sites-available/atat.conf`)
```nginx
location /poll {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

## 개발 명령어

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버
npm run start

# 린트
npm run lint
```

---

## 파일별 역할 요약

| 파일 | 역할 |
|------|------|
| `src/lib/db.ts` | SQLite DB 초기화, 시드 데이터 |
| `src/lib/api.ts` | 서버 컴포넌트용 데이터 fetching |
| `src/lib/visitor.ts` | 익명 방문자 ID 생성 (UUID) |
| `src/hooks/use-realtime-poll.ts` | 투표 후 실시간 결과 폴링 |
| `src/components/animated-bar.tsx` | CSS 애니메이션 진행 바 |

---

## 주의사항

1. **데이터베이스 경로**
   - 개발: `./vote.db`
   - 프로덕션: `./data/vote.db`

2. **API fetch 주소**
   - 클라이언트: 상대 경로 (`/api/polls`)
   - 서버: `src/lib/api.ts`에서 직접 DB 접근

3. **익명 투표**
   - `visitor_id`로 중복 투표 방지
   - 로컬 스토리지에 저장 (클라이언트)

4. **테마**
   - `data-theme="dark"` 속성으로 다크 모드 적용
   - `use-theme.ts` 훅으로 관리

---

## 코딩 표준

### 불변성 (CRITICAL)
```typescript
// CORRECT
const updated = { ...original, newField: value }

// WRONG
original.newField = value // MUTATION!
```

### 입력 검증 (Zod)
```typescript
const schema = z.object({
  question: z.string().min(5).max(200),
  options: z.array(z.string()).min(2).max(10),
})
```

### 에러 처리
```typescript
try {
  const result = await operation()
  return NextResponse.json({ success: true, data: result })
} catch (error) {
  return NextResponse.json({ success: false, error: message }, { status: 500 })
}
```
