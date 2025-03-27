const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const PORT = 3000;
const db = new sqlite3.Database('movies.db');
const cors = require('cors');
app.use(cors());
app.use(express.json()); // JSON 파싱용 미들웨어


app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

// /movies 라우트 정의
app.get('/movies', (req, res) => {
  const query = `
    SELECT id, original_title, poster_path, vote_average 
    FROM movies
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('DB 조회 에러:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(rows);
    }
  });
});




app.post('/comments', (req, res) => {
  const { movie_id, nickname, comment } = req.body;

  if (!movie_id || !nickname || !comment) {
    return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
  }

  const insert = `
    INSERT INTO comments (movie_id, nickname, comment) VALUES (?, ?, ?)
  `;

  db.run(insert, [movie_id, nickname, comment], function (err) {
    if (err) {
      console.error('댓글 저장 오류:', err.message);
      res.status(500).json({ error: '댓글 저장 실패' });
    } else {
      res.json({ success: true, commentId: this.lastID });
    }
  });
});

app.get('/comments/:movie_id', (req, res) => {
  const movie_id = req.params.movie_id;

  const query = `
    SELECT id, nickname, comment, created_at
    FROM comments
    WHERE movie_id = ?
    ORDER BY created_at DESC
  `;

  db.all(query, [movie_id], (err, rows) => {
    if (err) {
      console.error('댓글 조회 오류:', err.message);
      res.status(500).json({ error: '댓글 조회 실패' });
    } else {
      res.json(rows);
    }
  });
});


// 영화 상세글
// 대충 다 보여주면 될듯?
app.get('/movies/:id', (req, res) => {
  const id = req.params.id;

  const query = `
    SELECT * FROM movies WHERE id = ?
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('DB 조회 에러:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (!row) {
      res.status(404).json({ error: '영화를 찾을 수 없습니다' });
    } else {
      res.json(row);
    }
  });
});