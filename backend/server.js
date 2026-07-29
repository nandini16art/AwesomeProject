require('dotenv').config();

const express = require('express');
const cors = require('cors');

const profileRoutes = require('./routes/profiles');
const authRoutes = require('./routes/auth');
const userRoutes=require("./routes/users");
const followRoutes = require("./routes/follow");
const educationRoutes = require("./routes/education");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/profiles', profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/education", educationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
