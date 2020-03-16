BEGIN;

TRUNCATE
  "word",
  "language",
  "user";

INSERT INTO "user" ("id", "username", "name", "password")
VALUES
  (
    1,
    'admin',
    'Dunder Mifflin Admin',
    -- password = "pass"
    '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG'
  );

INSERT INTO "language" ("id", "name", "user_id")
VALUES
  (1, 'Catalan', 1);

INSERT INTO "word" ("id", "language_id", "original", "translation", "next")
VALUES
  (1, 1, 'bon dia', 'good morning', 2),
  (2, 1, 'bona nuit', 'good night', 3),
  (3, 1, 'adéu', 'bye', 4),
  (4, 1, 'merci', 'thank you', 5),
  (5, 1, 'de res', 'you''re welcome', 6),
  (6, 1, 'si us plau', 'please', 7),
  (7, 1, 'perdò', 'sorry', 8),
  (8, 1, 'disculpi', 'excuse me', 9),
  (9, 1, 'com està', 'how are you? (formal)', 10),
  (10, 1, 'com estàs', 'how are you? (informal)', null);

UPDATE "language" SET head = 1 WHERE id = 1;

-- because we explicitly set the id fields
-- update the sequencer for future automatic id setting
SELECT setval('word_id_seq', (SELECT MAX(id) from "word"));
SELECT setval('language_id_seq', (SELECT MAX(id) from "language"));
SELECT setval('user_id_seq', (SELECT MAX(id) from "user"));

COMMIT;
