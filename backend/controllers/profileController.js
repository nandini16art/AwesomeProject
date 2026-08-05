const db = require('../db');

const getProfiles = (req, res) => {
  const sql = `
        SELECT
            p.id,
            p.user_id,
            u.name,
            u.email,
            u.role,
            p.title,
            p.image,
            p.location,
            p.followers,
            p.following,
            p.about,
            p.education,

            CASE
                WHEN f.id IS NULL THEN FALSE
                ELSE TRUE
            END AS isFollowing

        FROM profiles p

        INNER JOIN users u
        ON p.user_id = u.id

        LEFT JOIN followers f
        ON f.following_id = p.user_id
        AND f.follower_id = ?

        WHERE p.user_id != ?

        ORDER BY p.id;
    `;

  db.query(sql, [req.user.id, req.user.id], (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        success: false,
        message: 'Database Error',
      });
    }

    res.status(200).json({
      success: true,
      profiles: result,
    });
  });
};

const createProfile = (req, res) => {
  const userId = req.user.id;

  const { title, image, location, about, education } = req.body;
  console.log(req.body);

  // Check whether profile already exists
  db.query(
    'SELECT id FROM profiles WHERE user_id = ?',
    [userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database Error',
        });
      }

      if (result.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Profile already exists',
        });
      }

      const sql = `
                INSERT INTO profiles
    (
      user_id,
      title,
      image,
      location,
      followers,
      following,
      about,
      education
    )
  VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `;

      db.query(
        sql,
        [userId, title, image, location, 0, 0, about, education],
        (insertErr, insertResult) => {
          if (insertErr) {
            console.log(insertErr);

            return res.status(500).json({
              success: false,
              message: 'Unable to create profile',
            });
          }

          res.status(201).json({
            success: true,

            message: 'Profile created successfully',

            profileId: insertResult.insertId,
          });
        },
      );
    },
  );
};

const getMyProfile = (req, res) => {
  const sql = `
  SELECT
  p.id,
    p.user_id,
    u.name,
    u.email,
    u.role,
    p.title,
    p.image,
    p.location,
    p.followers,
    p.following,
    p.about,
    p.education,
    p.created_at
        FROM profiles p
        INNER JOIN users u
        ON p.user_id = u.id
        WHERE p.user_id = ?
    `;

  db.query(sql, [req.user.id], (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        success: false,
        message: 'Database Error',
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    res.status(200).json({
      success: true,

      profile: result[0],
    });
  });
};

const updateProfile = (req, res) => {
  const { title, image, location, about, education } = req.body;

  const sql = `
        UPDATE profiles
  SET
  title = ?,
    image = ?,
    location = ?,
    about = ?,
    education = ?
      WHERE user_id = ?
        `;

  db.query(
    sql,
    [title, image, location, about, education, req.user.id],
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
          message: 'Profile not found',
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
      });
    },
  );
};

const deleteProfile = (req, res) => {
  const sql = `
        DELETE FROM profiles
        WHERE user_id = ?
    `;

  db.query(sql, [req.user.id], (err, result) => {
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
        message: 'Profile not found',
      });
    }

    res.json({
      success: true,
      message: 'Profile deleted successfully',
    });
  });
};

module.exports = {
  getProfiles,
  createProfile,
  getMyProfile,
  updateProfile,
  deleteProfile,
};
