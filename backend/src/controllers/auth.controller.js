const { admin, db } = require("../config/firebase.config");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt.utils");

// Register new user (Firebase Auth + Firestore)
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all fields." });
    }

    // 1. Create User in Firebase Authentication Tab
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
    });

    // 2. Hash password for custom Firestore storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save profile to Firestore using the Firebase UID
    const newUser = {
      email,
      password: hashedPassword,
      name,
      firebaseUid: userRecord.uid,
      createdAt: new Date().toISOString(),
    };

    await db.collection("users").doc(userRecord.uid).set(newUser);

    // 4. Generate custom JWT token
    const token = generateToken(userRecord.uid);

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      token,
      user: { id: userRecord.uid, email, name },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Provide email and password." });
    }

    // Find user in Firestore by email
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Verify hashed password
    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    const token = generateToken(userDoc.id);

    res.status(200).json({
      success: true,
      token,
      user: { id: userDoc.id, email: userData.email, name: userData.name },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Login failed.", error: error.message });
  }
};

// Get current user profile
const getMe = async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.userId).get();
    if (!userDoc.exists)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });

    const userData = userDoc.data();
    res.status(200).json({
      success: true,
      user: { id: userDoc.id, email: userData.email, name: userData.name },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { register, login, getMe };
