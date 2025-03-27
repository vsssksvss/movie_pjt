const sqlite3 = require('sqlite3').verbose();
const xlsx = require('xlsx');
const path = require('path');

// 엑셀 파일 경로
const excelFile = path.join(__dirname, 'movies.xlsx');

// 엑셀 파일 읽기
const workbook = xlsx.readFile(excelFile);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// 데이터를 JSON 형태로 변환
const data = xlsx.utils.sheet_to_json(sheet);

// SQLite 데이터베이스 연결
const db = new sqlite3.Database('movies.db');

// 테이블 생성 쿼리
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_title TEXT,
    overview TEXT,
    release_date TEXT,
    poster_path TEXT,
    backdrop_path TEXT,
    popularity REAL,
    vote_average REAL,
    vote_count INTEGER
  );
`;

// 테이블 생성
db.serialize(() => {
  db.run(createTableQuery);

  const insertQuery = `
    INSERT INTO movies 
    (original_title, overview, release_date, poster_path, backdrop_path, popularity, vote_average, vote_count) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const stmt = db.prepare(insertQuery);

  data.forEach(row => {
    stmt.run(
      row['Original Title'],
      row['Overview'],
      row['Release Date'],
      row['Poster Path'],
      row['Backdrop Path'],
      parseFloat(row['Popularity']) || 0,
      parseFloat(row['Vote Average']) || 0,
      parseInt(row['Vote Count']) || 0
    );
  });

  stmt.finalize(() => {
    console.log('모든 데이터가 성공적으로 삽입되었습니다.');
    db.close();
  });
});



const createCommentsTable = `
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER,
    nickname TEXT,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id)
  );
`;

db.run(createCommentsTable);