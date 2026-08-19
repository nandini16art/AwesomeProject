const bcrypt = require('bcryptjs');
const db = require('../db');

const DEFAULT_PROFILE = {
  title: 'Software Engineer',
  image: 'https://i.pravatar.cc/300?img=1',
  location: 'Bangalore',
  about: 'Welcome to my profile',
  education: 'Not Added Yet',
};

const isAdmin = req => req.user?.role === 'admin';

const sendForbidden = res =>
  res.status(403).json({
    success: false,
    message: 'Admin access required',
  });

const rollbackAndRespond = (res, statusCode, message) => {
  db.rollback(() => {
    res.status(statusCode).json({
      success: false,
      message,
    });
  });
};

const getCurrentUser = (req, res) => {
  const sql = `
        SELECT
            id,
            name,
            email,
            role,
            created_at
        FROM users
        WHERE id = ?
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
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: result[0],
    });
  });
};

const getUsers = (req, res) => {
  if (!isAdmin(req)) {
    return sendForbidden(res);
  }

  const sql = `
        SELECT
            u.id,
            u.name,
            u.email,
            u.role,
            u.created_at,
            p.title,
            p.image,
            p.location,
            p.followers,
            p.following
        FROM users u
        LEFT JOIN profiles p
            ON p.user_id = u.id
        ORDER BY u.id
    `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        success: false,
        message: 'Database Error',
      });
    }

    res.json({
      success: true,
      users: result,
    });
  });
};

const createUser = async (req, res) => {
  if (!isAdmin(req)) {
    return sendForbidden(res);
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.beginTransaction(transactionErr => {
    if (transactionErr) {
      return res.status(500).json({
        success: false,
        message: 'Database Error',
      });
    }

    db.query(
      'INSERT INTO users(name, email, password, role) VALUES(?, ?, ?, ?)',
      [name, email, hashedPassword, 'user'],
      (insertErr, insertResult) => {
        if (insertErr) {
          const message =
            insertErr.code === 'ER_DUP_ENTRY'
              ? 'Email already exists'
              : 'Unable to create user';

          const statusCode = insertErr.code === 'ER_DUP_ENTRY' ? 409 : 500;

          return rollbackAndRespond(res, statusCode, message);
        }

        const userId = insertResult.insertId;

        db.query(
          `INSERT INTO profiles
            (user_id, title, image, location, followers, following, about, education)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            DEFAULT_PROFILE.title,
            DEFAULT_PROFILE.image,
            DEFAULT_PROFILE.location,
            0,
            0,
            DEFAULT_PROFILE.about,
            DEFAULT_PROFILE.education,
          ],
          profileErr => {
            if (profileErr) {
              return rollbackAndRespond(res, 500, 'Unable to create profile');
            }

            db.commit(commitErr => {
              if (commitErr) {
                return rollbackAndRespond(res, 500, 'Unable to create user');
              }

              res.status(201).json({
                success: true,
                message: 'User created successfully',
                user: {
                  id: userId,
                  name,
                  email,
                  role: 'user',
                  title: DEFAULT_PROFILE.title,
                  image: DEFAULT_PROFILE.image,
                  location: DEFAULT_PROFILE.location,
                  followers: 0,
                  following: 0,
                },
              });
            });
          },
        );
      },
    );
  });
};

const deleteUser = (req, res) => {
  if (!isAdmin(req)) {
    return sendForbidden(res);
  }

  const userId = parseInt(req.params.id, 10);

  if (userId === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'Admin cannot delete their own account',
    });
  }

  db.query(
    'SELECT role FROM users WHERE id = ?',
    [userId],
    (findErr, users) => {
      if (findErr) {
        return res.status(500).json({
          success: false,
          message: 'Database Error',
        });
      }

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (users[0].role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin users cannot be deleted from the dashboard',
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
          'UPDATE profiles SET followers = GREATEST(followers - 1, 0) WHERE user_id IN (SELECT following_id FROM followers WHERE follower_id = ?)',
          [userId],
          followersErr => {
            if (followersErr) {
              return rollbackAndRespond(res, 500, 'Unable to update followers');
            }

            db.query(
              'UPDATE profiles SET following = GREATEST(following - 1, 0) WHERE user_id IN (SELECT follower_id FROM followers WHERE following_id = ?)',
              [userId],
              followingErr => {
                if (followingErr) {
                  return rollbackAndRespond(
                    res,
                    500,
                    'Unable to update following',
                  );
                }

                db.query(
                  'DELETE FROM users WHERE id = ?',
                  [userId],
                  (deleteErr, result) => {
                    if (deleteErr) {
                      console.log(deleteErr);

                      return rollbackAndRespond(
                        res,
                        500,
                        'Unable to delete user',
                      );
                    }

                    if (result.affectedRows === 0) {
                      return rollbackAndRespond(res, 404, 'User not found');
                    }

                    db.commit(commitErr => {
                      if (commitErr) {
                        return rollbackAndRespond(
                          res,
                          500,
                          'Unable to delete user',
                        );
                      }

                      res.json({
                        success: true,
                        message: 'User deleted successfully',
                      });
                    });
                  },
                );
              },
            );
          },
        );
      });
    },
  );
};

module.exports = {
  getCurrentUser,
  getUsers,
  createUser,
  deleteUser,
};
