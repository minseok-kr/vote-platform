# Vote Platform - Claude Code Configuration

## Project Overview
순수 투표 플랫폼 - 고급스럽고 모던하며 심플한 UI
- 익명 투표 (인증 없음)
- 실시간 결과 업데이트
- 반응형 디자인

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL + Realtime)
- **Language**: TypeScript
- **Validation**: Zod

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout + metadata
│   ├── page.tsx            # Home (featured + trending + all)
│   ├── loading.tsx         # Global loading skeleton
│   ├── not-found.tsx       # 404 page
│   ├── globals.css         # Design tokens + styles
│   ├── create/
│   │   └── page.tsx        # Create poll form
│   ├── completed/
│   │   └── page.tsx        # Completed polls list
│   ├── search/
│   │   └── page.tsx        # Search polls
│   ├── polls/[id]/
│   │   ├── page.tsx        # Poll detail + dynamic metadata
│   │   └── loading.tsx     # Poll detail skeleton
│   └── api/
│       └── polls/
│           ├── route.ts           # GET list, POST create
│           ├── search/route.ts    # GET search
│           └── [id]/
│               ├── route.ts       # GET single poll
│               └── vote/route.ts  # GET status, POST vote
├── components/
│   ├── index.ts            # Barrel exports
│   ├── header.tsx          # Navigation + mobile menu
│   ├── featured-poll.tsx   # Featured poll card
│   ├── trending-polls.tsx  # Trending grid
│   ├── all-polls.tsx       # All polls table + filter/sort
│   ├── poll-detail.tsx     # Poll detail + voting
│   ├── create-poll.tsx     # Create poll form
│   ├── completed-polls.tsx # Completed polls list
│   ├── search-polls.tsx    # Search input + results
│   ├── share-button.tsx    # Share dropdown (SNS, copy)
│   ├── animated-bar.tsx    # Animated progress bar
│   └── skeleton.tsx        # Loading skeletons
├── hooks/
│   ├── index.ts
│   └── use-realtime-poll.ts  # Supabase realtime subscription
├── lib/
│   ├── index.ts
│   ├── supabase.ts         # Supabase client
│   ├── polls.ts            # Poll data fetching
│   ├── visitor.ts          # Anonymous visitor ID
│   └── utils.ts            # Formatting utilities
└── types/
    ├── index.ts
    └── database.ts         # Supabase types + API types
```

---

## Implemented Features

### Pages
| Route | Description | Status |
|-------|-------------|--------|
| `/` | Home - Featured, Trending, All Polls | ✅ |
| `/polls/[id]` | Poll detail + voting | ✅ |
| `/create` | Create new poll | ✅ |
| `/completed` | Completed polls list | ✅ |
| `/search` | Search polls | ✅ |

### Components
| Component | Features |
|-----------|----------|
| `Header` | Logo, nav, search link, mobile hamburger menu |
| `FeaturedPoll` | Question, options, vote button, results animation |
| `TrendingPolls` | 4-column responsive grid |
| `AllPolls` | Category filter, sort (recent/popular/ending) |
| `PollDetail` | Real-time updates, share button, voting |
| `CreatePoll` | Question, description, options, category, duration |
| `SearchPolls` | Debounced search, results list |
| `ShareButton` | Copy link, Twitter, Facebook |
| `Skeleton` | Loading states for all sections |

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/polls` | List polls with filters |
| POST | `/api/polls` | Create poll (Zod validated) |
| GET | `/api/polls/search?q=` | Search polls |
| GET | `/api/polls/[id]` | Get single poll |
| GET | `/api/polls/[id]/vote?visitorId=` | Check vote status |
| POST | `/api/polls/[id]/vote` | Submit vote |

### Hooks
| Hook | Description |
|------|-------------|
| `useRealtimePoll` | Subscribe to poll changes via Supabase |

---

## Design System

### CSS Variables (globals.css)
```css
:root {
  --bg-page: #ffffff;
  --bg-card: #fafafa;
  --bg-active: #f0f0f0;
  --text-primary: #111111;
  --text-secondary: #666666;
  --text-muted: #999999;
  --border-primary: #e5e5e5;
  --border-secondary: #d0d0d0;
  --accent-blue: #2563eb;
  --accent-gold: #c9a962;
  --success: #16a34a;
}
```

### Typography
- **Headlines**: `font-display` (Cormorant Garamond)
- **Body/UI**: Inter (system default)

### Responsive Breakpoints
- Mobile: `< 640px` (1 column)
- Tablet: `640px - 1024px` (2 columns)
- Desktop: `> 1024px` (4 columns)

---

## Database Schema

### Tables
- `polls` - Poll metadata
- `poll_options` - Poll options
- `votes` - Vote records

### Views
- `polls_with_options` - Poll with computed percentages

### Key Files
- `supabase/schema.sql` - Full schema with RLS
- `supabase/seed.sql` - Sample data

---

## Coding Standards

### Immutability (CRITICAL)
```typescript
// CORRECT
const updated = { ...original, newField: value }

// WRONG
original.newField = value // MUTATION!
```

### Input Validation
```typescript
const schema = z.object({
  question: z.string().min(1).max(200),
  options: z.array(z.string()).min(2).max(6),
})
```

### Error Handling
```typescript
try {
  const result = await operation()
  return NextResponse.json({ success: true, data: result })
} catch (error) {
  return NextResponse.json({ success: false, error: message }, { status: 500 })
}
```

---

## Commands

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Type check
npx tsc --noEmit
```

---

## Setup Checklist

- [ ] `npm install`
- [ ] Create Supabase project
- [ ] Copy `.env.example` to `.env.local` and fill values
- [ ] Run `supabase/schema.sql` in SQL Editor
- [ ] (Optional) Run `supabase/seed.sql` for sample data
- [ ] Enable Realtime for `votes` table in Supabase

---

## Next Steps (Potential)

- [ ] 투표 삭제/수정 기능
- [ ] 투표 결과 CSV 내보내기
- [ ] 투표 댓글 기능
- [ ] 다크 모드
- [ ] PWA 지원
- [ ] 투표 임베드 코드
