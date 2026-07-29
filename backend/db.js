const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) {
    console.log(err);
    return;
  }

  console.log('MySQL Connected');

  db.query(
    'SELECT DATABASE() AS db, @@hostname AS host, @@port AS port',
    (databaseErr, result) => {
      if (databaseErr) {
        console.log(databaseErr);
        return;
      }

      console.log('Backend Database:', result);
    },
  );
});

module.exports = db;
