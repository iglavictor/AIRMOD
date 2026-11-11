// 006_create_feedback_table.sql
-- 방명록·피드백을 저장하기 위한 테이블
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,               -- 작성자 이름
  message text NOT NULL,            -- 피드백 내용
  created_at timestamp with time zone DEFAULT now()
);

