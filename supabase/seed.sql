-- Seed data for Vote Platform
-- Run this after schema.sql

-- Featured Poll: Programming Languages
INSERT INTO polls (id, question, description, category, status, is_featured, expires_at)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '2025년 최고의 프로그래밍 언어는?',
  '올해 가장 주목받는 프로그래밍 언어에 투표해주세요.',
  'tech',
  'active',
  true,
  NOW() + INTERVAL '3 days'
);

INSERT INTO poll_options (poll_id, text, votes) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Python', 518),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'JavaScript', 345),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'TypeScript', 222),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Rust', 148);

-- Trending Poll 1: iPhone Color
INSERT INTO polls (id, question, category, status, expires_at)
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  '다음 아이폰 색상이 추가된다면?',
  'tech',
  'active',
  NOW() + INTERVAL '2 days'
);

INSERT INTO poll_options (poll_id, text, votes) VALUES
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', '로즈 골드', 412),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', '미드나잇 그린', 289),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', '퍼플', 191);

-- Trending Poll 2: World Series
INSERT INTO polls (id, question, category, status, expires_at)
VALUES (
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  '2025 월드시리즈 우승팀 예측',
  'sports',
  'active',
  NOW() + INTERVAL '5 days'
);

INSERT INTO poll_options (poll_id, text, votes) VALUES
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'LA 다저스', 856),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', '뉴욕 양키스', 723),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', '휴스턴 애스트로스', 521);

-- Trending Poll 3: Movies
INSERT INTO polls (id, question, category, status, expires_at)
VALUES (
  'd4e5f6a7-b8c9-0123-defa-234567890123',
  '가장 기대되는 2025 영화는?',
  'entertainment',
  'active',
  NOW() + INTERVAL '7 days'
);

INSERT INTO poll_options (poll_id, text, votes) VALUES
  ('d4e5f6a7-b8c9-0123-defa-234567890123', '어벤져스 시크릿 워즈', 312),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', '아바타 3', 231);

-- Trending Poll 4: AI Services
INSERT INTO polls (id, question, category, status, expires_at)
VALUES (
  'e5f6a7b8-c9d0-1234-efab-345678901234',
  '올해 가장 혁신적인 AI 서비스는?',
  'tech',
  'active',
  NOW() + INTERVAL '4 days'
);

INSERT INTO poll_options (poll_id, text, votes) VALUES
  ('e5f6a7b8-c9d0-1234-efab-345678901234', 'ChatGPT', 789),
  ('e5f6a7b8-c9d0-1234-efab-345678901234', 'Claude', 654),
  ('e5f6a7b8-c9d0-1234-efab-345678901234', 'Gemini', 357);

-- Additional Polls for All Polls section
INSERT INTO polls (id, question, category, status, expires_at)
VALUES (
  'f6a7b8c9-d0e1-2345-fabc-456789012345',
  '최고의 노트 앱은 무엇인가요?',
  'tech',
  'active',
  NOW() + INTERVAL '3 days'
);

INSERT INTO poll_options (poll_id, text, votes) VALUES
  ('f6a7b8c9-d0e1-2345-fabc-456789012345', 'Notion', 612),
  ('f6a7b8c9-d0e1-2345-fabc-456789012345', 'Obsidian', 489),
  ('f6a7b8c9-d0e1-2345-fabc-456789012345', 'Apple Notes', 355);

INSERT INTO polls (id, question, category, status, expires_at)
VALUES (
  'a7b8c9d0-e1f2-3456-abcd-567890123456',
  '다음 세대 게임 콘솔 승자는?',
  'entertainment',
  'active',
  NOW() + INTERVAL '7 days'
);

INSERT INTO poll_options (poll_id, text, votes) VALUES
  ('a7b8c9d0-e1f2-3456-abcd-567890123456', 'PlayStation 6', 1245),
  ('a7b8c9d0-e1f2-3456-abcd-567890123456', 'Xbox Next', 987),
  ('a7b8c9d0-e1f2-3456-abcd-567890123456', 'Nintendo Switch 2', 659);

INSERT INTO polls (id, question, category, status, expires_at)
VALUES (
  'b8c9d0e1-f2a3-4567-bcde-678901234567',
  '2025년 가장 인기 있을 여행지는?',
  'lifestyle',
  'active',
  NOW() + INTERVAL '5 days'
);

INSERT INTO poll_options (poll_id, text, votes) VALUES
  ('b8c9d0e1-f2a3-4567-bcde-678901234567', '일본', 1456),
  ('b8c9d0e1-f2a3-4567-bcde-678901234567', '베트남', 892),
  ('b8c9d0e1-f2a3-4567-bcde-678901234567', '스페인', 779);

-- Update total_votes for all polls
UPDATE polls SET total_votes = (
  SELECT COALESCE(SUM(votes), 0)
  FROM poll_options
  WHERE poll_options.poll_id = polls.id
);
