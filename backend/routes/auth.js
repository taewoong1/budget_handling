const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const JWT_SECRET = 'your_jwt_secret';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/')); // 경로 수정
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    console.log('토큰이 제공되지 않았습니다.');
    return res.status(401).send('Access Denied');
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    console.log('인증 성공:', req.user);
    next();
  } catch (err) {
    console.log('토큰이 유효하지 않습니다:', err.message);
    res.status(400).send('Invalid Token');
  }
};

router.post('/register', upload.single('profilePicture'), async (req, res) => {
  console.log("회원가입 요청 수신:", req.body);
  try {
    const { email, password, nickname, age, studentId, university, phone } = req.body;
    const profilePicture = req.file ? req.file.filename : null;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      nickname,
      age,
      studentId,
      university,
      phone,
      profilePicture,
    });

    const savedUser = await newUser.save();
    console.log("사용자 저장 성공:", savedUser);
    res.status(201).json(savedUser);
  } catch (err) {
    console.error("회원가입 에러:", err);
    res.status(500).json(err);
  }
});

router.post('/login', async (req, res) => {
  console.log("로그인 요청 수신:", req.body);
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log("사용자를 찾을 수 없음:", email);
      return res.status(404).json('User not found');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log("잘못된 비밀번호:", password);
      return res.status(400).json('Invalid password');
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    console.log("로그인 성공:", user);
    res.status(200).json({ user, token });
  } catch (err) {
    console.error("로그인 에러:", err);
    res.status(500).json(err);
  }
});

// verifyToken 미들웨어를 사용할 때는 다음과 같이 내보낼 수 있습니다.
module.exports = { verifyToken };

// 라우터는 기본 내보내기로 내보냅니다.
module.exports = router;