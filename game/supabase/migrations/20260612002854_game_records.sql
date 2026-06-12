-- 游戏记录表
create table if not exists game_records (
  id           uuid default gen_random_uuid() primary key,
  created_at   timestamptz default now(),
  winner_name  text not null,
  loser_name   text not null,
  grade        int  not null check (grade between 1 and 6),
  semester     text not null check (semester in ('upper', 'lower')),
  duration_s   int,
  winner_pos   int default 29,
  loser_pos    int
);

-- 开启 RLS
alter table game_records enable row level security;

-- 任何人可写入（匿名玩家提交战绩）
create policy "anyone can insert"
  on game_records for insert
  with check (true);

-- 任何人可读取排行榜
create policy "anyone can select"
  on game_records for select
  using (true);
