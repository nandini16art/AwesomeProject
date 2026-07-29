const db = require('../db');

const followUser = (req, res) => {
  const followerId = req.user.id;
  const followingId = parseInt(req.params.userId, 10);

  if (followerId === followingId) {
    return res.status(400).json({
      success: false,
      message: 'You cannot follow yourself',
    });
  }

  // Check if already following
  db.query(
    'SELECT * FROM followers WHERE follower_id = ? AND following_id = ?',
    [followerId, followingId],
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
          message: 'Already following this user',
        });
      }

      db.query(
        'INSERT INTO followers (follower_id, following_id) VALUES (?, ?)',
        [followerId, followingId],
        insertErr => {
          if (insertErr) {
            return res.status(500).json({
              success: false,
              message: 'Unable to follow user',
            });
          }

          // Increase follower count
          db.query(
            'UPDATE profiles SET followers = followers + 1 WHERE user_id = ?',
            [followingId],
          );

          // Increase following count
          db.query(
            'UPDATE profiles SET following = following + 1 WHERE user_id = ?',
            [followerId],
          );

          res.json({
            success: true,
            message: 'User followed successfully',
          });
        },
      );
    },
  );
};

const unfollowUser = (req, res) => {
  const followerId = req.user.id;
  const followingId = Number(req.params.userId);

  const sql =
    'DELETE FROM followers WHERE follower_id = ? AND following_id = ?';

  db.query(sql, [followerId, followingId], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database Error',
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'You are not following this user',
      });
    }

    db.query(
      'UPDATE profiles SET followers = followers - 1 WHERE user_id = ?',
      [followingId],
    );

    db.query(
      'UPDATE profiles SET following = following - 1 WHERE user_id = ?',
      [followerId],
    );

    res.json({
      success: true,
      message: 'User unfollowed successfully',
    });
  });
};

const getFollowers = (req, res) => {
  const sql = `
        SELECT
            u.id,
            u.name,
            u.email,
            p.title,
            p.image,
            p.location
        FROM followers f
        INNER JOIN users u
            ON f.follower_id = u.id
        INNER JOIN profiles p
            ON p.user_id = u.id
        WHERE f.following_id = ?
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
      followers: result,
    });
  });
};

const getFollowing = (req, res) => {
  const sql = `
        SELECT
            u.id,
            u.name,
            u.email,
            p.title,
            p.image,
            p.location
        FROM followers f
        INNER JOIN users u
            ON f.following_id = u.id
        INNER JOIN profiles p
            ON p.user_id = u.id
        WHERE f.follower_id = ?
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
      following: result,
    });
  });
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
