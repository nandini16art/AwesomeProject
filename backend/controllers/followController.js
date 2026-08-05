const db = require('../db');

const rollbackAndRespond = (res, message) => {
  db.rollback(() => {
    res.status(500).json({
      success: false,
      message,
    });
  });
};

const followUser = (req, res) => {
  const followerId = req.user.id;
  const followingId = parseInt(req.params.userId, 10);

  if (followerId === followingId) {
    return res.status(400).json({
      success: false,
      message: 'You cannot follow yourself',
    });
  }

  db.beginTransaction(transactionErr => {
    if (transactionErr) {
      return res.status(500).json({
        success: false,
        message: 'Database Error',
      });
    }

    db.query(
      'INSERT INTO followers (follower_id, following_id) VALUES (?, ?)',
      [followerId, followingId],
      insertErr => {
        if (insertErr) {
          const statusCode = insertErr.code === 'ER_DUP_ENTRY' ? 409 : 500;
          const message =
            insertErr.code === 'ER_DUP_ENTRY'
              ? 'Already following this user'
              : 'Unable to follow user';

          return db.rollback(() => {
            res.status(statusCode).json({
              success: false,
              message,
            });
          });
        }

        db.query(
          'UPDATE profiles SET followers = followers + 1 WHERE user_id = ?',
          [followingId],
          (followersErr, followersResult) => {
            if (followersErr || followersResult.affectedRows === 0) {
              return rollbackAndRespond(res, 'Unable to update follower count');
            }

            db.query(
              'UPDATE profiles SET following = following + 1 WHERE user_id = ?',
              [followerId],
              (followingErr, followingResult) => {
                if (followingErr || followingResult.affectedRows === 0) {
                  return rollbackAndRespond(
                    res,
                    'Unable to update following count',
                  );
                }

                db.commit(commitErr => {
                  if (commitErr) {
                    return rollbackAndRespond(res, 'Unable to follow user');
                  }

                  res.json({
                    success: true,
                    message: 'User followed successfully',
                  });
                });
              },
            );
          },
        );
      },
    );
  });
};

const unfollowUser = (req, res) => {
  const followerId = req.user.id;
  const followingId = parseInt(req.params.userId, 10);

  db.beginTransaction(transactionErr => {
    if (transactionErr) {
      return res.status(500).json({
        success: false,
        message: 'Database Error',
      });
    }

    db.query(
      'DELETE FROM followers WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId],
      (deleteErr, deleteResult) => {
        if (deleteErr) {
          return rollbackAndRespond(res, 'Unable to unfollow user');
        }

        if (deleteResult.affectedRows === 0) {
          return db.rollback(() => {
            res.status(404).json({
              success: false,
              message: 'You are not following this user',
            });
          });
        }

        db.query(
          'UPDATE profiles SET followers = GREATEST(followers - 1, 0) WHERE user_id = ?',
          [followingId],
          (followersErr, followersResult) => {
            if (followersErr || followersResult.affectedRows === 0) {
              return rollbackAndRespond(res, 'Unable to update follower count');
            }

            db.query(
              'UPDATE profiles SET following = GREATEST(following - 1, 0) WHERE user_id = ?',
              [followerId],
              (followingErr, followingResult) => {
                if (followingErr || followingResult.affectedRows === 0) {
                  return rollbackAndRespond(
                    res,
                    'Unable to update following count',
                  );
                }

                db.commit(commitErr => {
                  if (commitErr) {
                    return rollbackAndRespond(res, 'Unable to unfollow user');
                  }

                  res.json({
                    success: true,
                    message: 'User unfollowed successfully',
                  });
                });
              },
            );
          },
        );
      },
    );
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
