const db = require('../db');

const addEducation = (req, res) => {
  const { institute, degree, start_year, end_year } = req.body;

  // Find logged-in user's profile
  db.query(
    'SELECT id FROM profiles WHERE user_id = ?',
    [req.user.id],
    (err, profileResult) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database Error',
        });
      }

      if (profileResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found',
        });
      }

      const profileId = profileResult[0].id;

      db.query(
        `INSERT INTO education
                (profile_id, institute, degree, start_year, end_year)
                VALUES (?, ?, ?, ?, ?)`,
        [profileId, institute, degree, start_year, end_year],
        (insertErr, result) => {
          if (insertErr) {
            console.log(insertErr);

            return res.status(500).json({
              success: false,
              message: 'Unable to add education',
            });
          }

          res.status(201).json({
            success: true,
            message: 'Education added successfully',
            educationId: result.insertId,
          });
        },
      );
    },
  );
};

const getEducation = (req, res) => {
  const sql = `
        SELECT
            e.id,
            e.institute,
            e.degree,
            e.start_year,
            e.end_year
        FROM education e
        INNER JOIN profiles p
            ON e.profile_id = p.id
        WHERE p.user_id = ?
        ORDER BY e.start_year DESC
    `;

  db.query(sql, [req.user.id], (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        success: false,
        message: 'Database Error',
      });
    }

    res.json({
      success: true,
      education: result,
    });
  });
};

const updateEducation = (req, res) => {
  const educationId = req.params.id;

  const { institute, degree, start_year, end_year } = req.body;

  const sql = `
        UPDATE education e
        INNER JOIN profiles p
            ON e.profile_id = p.id
        SET
            e.institute = ?,
            e.degree = ?,
            e.start_year = ?,
            e.end_year = ?
        WHERE
            e.id = ?
            AND p.user_id = ?
    `;

  db.query(
    sql,
    [institute, degree, start_year, end_year, educationId, req.user.id],
    (err, result) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          success: false,
          message: 'Database Error',
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Education not found',
        });
      }

      res.json({
        success: true,
        message: 'Education updated successfully',
      });
    },
  );
};

const deleteEducation = (req, res) => {
  const educationId = req.params.id;

  const sql = `
        DELETE e
        FROM education e
        INNER JOIN profiles p
            ON e.profile_id = p.id
        WHERE
            e.id = ?
            AND p.user_id = ?
    `;

  db.query(sql, [educationId, req.user.id], (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        success: false,
        message: 'Database Error',
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Education not found',
      });
    }

    res.json({
      success: true,
      message: 'Education deleted successfully',
    });
  });
};

module.exports = {
  addEducation,
  getEducation,
  updateEducation,
  deleteEducation,
};
