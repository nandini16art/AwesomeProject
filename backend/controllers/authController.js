const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('REGISTER REQUEST:', req.body);

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Check if email already exists
    db.query(
      'SELECT id FROM users WHERE email = ?',
      [email],
      async (selectErr, existingUsers) => {
        if (selectErr) {
          return res.status(500).json({
            success: false,
            message: 'Database Error',
          });
        }
        console.log('Existing user check:', existingUsers);

        if (existingUsers.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Email already exists',
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
          'INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)',
          [name, email, hashedPassword, 'user'],
          (insertErr, insertResult) => {
            if (insertErr) {
              console.log('INSERT ERROR:', insertErr);

              return res.status(500).json({
                success: false,
                message: insertErr.sqlMessage || insertErr.message,
              });
            }

            const userId = insertResult.insertId;

            db.query(
              `INSERT INTO profiles
      (user_id, title, image, location, followers, following, about, education)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                userId,
                'Software Engineer',
                'https://i.pravatar.cc/300?img=1',
                'Bangalore',
                0,
                0,
                'Welcome to my profile',
                'Not Added Yet',
              ],
              profileErr => {
                if (profileErr) {
                  console.log('PROFILE INSERT ERROR:', profileErr);

                  return res.status(500).json({
                    success: false,
                    message: profileErr.sqlMessage || profileErr.message,
                  });
                }

                res.status(201).json({
                  success: true,
                  message: 'User registered successfully',
                });
              },
            );
          },
        );
      },
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login User
const loginUser = (req, res) => {
  const { email, password, role = 'user' } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and Password are required',
    });
  }

  db.query(
    'SELECT * FROM users WHERE email=?',
    [email],
    async (loginErr, users) => {
      if (loginErr) {
        return res.status(500).json({
          success: false,
          message: 'Database Error',
        });
      }

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Email or Password',
        });
      }

      const user = users[0];

      if (user.role !== role) {
        return res.status(403).json({
          success: false,
          message: `Please login as ${user.role}`,
        });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Email or Password',
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '1h',
        },
      );

      res.json({
        success: true,
        message: 'Login Successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    },
  );
};

module.exports = {
  registerUser,
  loginUser,
};
