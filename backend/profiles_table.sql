CREATE DATABASE IF NOT EXISTS social_app;

USE social_app;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  title VARCHAR(100),
  image TEXT,
  location VARCHAR(100),
  followers INT DEFAULT 0,
  following INT DEFAULT 0,
  about TEXT,
  education VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS followers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  follower_id INT NOT NULL,
  following_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_follow (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS education (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id INT NOT NULL,
  institute VARCHAR(150),
  degree VARCHAR(150),
  start_year INT,
  end_year INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

INSERT IGNORE INTO users (name, email, password, role)
VALUES
  ('Admin', 'admin@gmail.com', '$2b$10$ugWR9qeS8r2dcowMe9hzbOJPP8sT0nGYqQoMAnrPVFg/hrCjCTMmy', 'admin'),
  ('Sarah Tech', 'sarah@gmail.com', '$2b$10$s/vEhLTVcKQkudua0.6oPuvJTG77t9DkTITOhLkrTFgqTLu9JiONu', 'user'),
  ('John Devops', 'john@gmail.com', '$2b$10$s/vEhLTVcKQkudua0.6oPuvJTG77t9DkTITOhLkrTFgqTLu9JiONu', 'user'),
  ('Olivia Brown', 'olivia@gmail.com', '$2b$10$s/vEhLTVcKQkudua0.6oPuvJTG77t9DkTITOhLkrTFgqTLu9JiONu', 'user'),
  ('Alex Kumar', 'alex@gmail.com', '$2b$10$s/vEhLTVcKQkudua0.6oPuvJTG77t9DkTITOhLkrTFgqTLu9JiONu', 'user'),
  ('Priya Sharma', 'priya@gmail.com', '$2b$10$s/vEhLTVcKQkudua0.6oPuvJTG77t9DkTITOhLkrTFgqTLu9JiONu', 'user'),
  ('Rahul Mehta', 'rahul@gmail.com', '$2b$10$s/vEhLTVcKQkudua0.6oPuvJTG77t9DkTITOhLkrTFgqTLu9JiONu', 'user'),
  ('Meera M', 'meera@gmail.com', '$2b$10$s/vEhLTVcKQkudua0.6oPuvJTG77t9DkTITOhLkrTFgqTLu9JiONu', 'user'),
  ('Arjun Rao', 'arjun@gmail.com', '$2b$10$s/vEhLTVcKQkudua0.6oPuvJTG77t9DkTITOhLkrTFgqTLu9JiONu', 'user');

INSERT IGNORE INTO profiles
(user_id, title, image, location, followers, following, about, education)
VALUES
(
  (SELECT id FROM users WHERE email = 'sarah@gmail.com'),
  'Full Stack Dev',
  'https://i.pinimg.com/736x/99/52/e0/9952e0597680112d8b905ab74f4516f5.jpg',
  'Bengaluru, India',
  1250,
  350,
  'Full stack developer who enjoys building mobile applications.',
  'B.Tech Computer Science'
),
(
  (SELECT id FROM users WHERE email = 'john@gmail.com'),
  'DevOps Engineer',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCHOU2Ao5y85EW82Bi1JebT0V29ed8W2YETg&s',
  'Hyderabad, India',
  980,
  210,
  'DevOps engineer focused on cloud infrastructure and automation.',
  'B.Tech Information Technology'
),
(
  (SELECT id FROM users WHERE email = 'olivia@gmail.com'),
  'Product Manager',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300',
  'Chennai, India',
  1740,
  425,
  'Product manager who creates simple digital experiences.',
  'MBA'
),
(
  (SELECT id FROM users WHERE email = 'alex@gmail.com'),
  'Data Scientist',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300',
  'Pune, India',
  620,
  180,
  'Data scientist creating machine learning solutions.',
  'B.Tech AI and Data Science'
),
(
  (SELECT id FROM users WHERE email = 'priya@gmail.com'),
  'Frontend Developer',
  'https://img.icons8.com/stickers/1200/person-female.jpg',
  'Bengaluru, India',
  890,
  160,
  'Frontend developer who loves creating clean mobile app interfaces.',
  'B.Tech Computer Science'
),
(
  (SELECT id FROM users WHERE email = 'rahul@gmail.com'),
  'Backend Developer',
  'https://static.vecteezy.com/system/resources/thumbnails/008/442/086/small/illustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg',
  'Hyderabad, India',
  720,
  145,
  'Backend developer working with APIs, MySQL, and cloud services.',
  'B.Tech Information Technology'
),
(
  (SELECT id FROM users WHERE email = 'meera@gmail.com'),
  'UI/UX Designer',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNv_ailkm8F-R_d6NE-l3ee2OjhpxtaaD4_g&s',
  'Coimbatore, India',
  860,
  190,
  'Creative designer who loves building simple and beautiful user experiences.',
  'B.Des User Experience Design'
),
(
  (SELECT id FROM users WHERE email = 'arjun@gmail.com'),
  'Mobile Developer',
  'https://png.pngtree.com/png-vector/20220529/ourmid/pngtree-simple-human-icon-account-and-profile-vector-ui-male-profile-vector-png-image_46161758.jpg',
  'Mumbai, India',
  1120,
  275,
  'Mobile developer focused on building smooth and responsive apps.',
  'B.Tech Computer Science'
);
