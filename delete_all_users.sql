-- 注意: このクエリはすべてのユーザーデータを削除します。実行前にバックアップを取ってください。

-- 1. 関連データを削除（entriesテーブルなど）
DELETE FROM entries;

-- 2. 認証スキーマのユーザーを削除
-- 注意: このクエリは管理者権限が必要です
DELETE FROM auth.users;

-- 3. 確認用クエリ
SELECT COUNT(*) as remaining_users FROM auth.users;
SELECT COUNT(*) as remaining_entries FROM entries;
