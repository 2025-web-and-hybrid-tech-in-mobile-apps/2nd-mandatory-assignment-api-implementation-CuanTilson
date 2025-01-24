const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Parse JSON bodies

// ------ START OF SOLUTION ------ //

const registeredUsers = [];
const activeTokens = [];
const gameHighScores = [];

// Helper function for input validation
function isValidString(input, minLength = 6) {
  return typeof input === "string" && input.trim().length >= minLength;
}

// POST /signup
app.post("/signup", (req, res) => {
  const { userHandle, password } = req.body;

  if (!isValidString(userHandle) || !isValidString(password)) {
    console.error("Signup failed. Invalid data:", req.body);
    return res.status(400).send("Invalid request body");
  }

  registeredUsers.push({ userHandle, password });
  console.info("User signed up successfully:", { userHandle });
  res.status(201).send("User registered successfully");
});

// POST /login
app.post("/login", (req, res) => {
  const { userHandle, password } = req.body;

  if (!isValidString(userHandle) || !isValidString(password)) {
    console.error("Login failed. Invalid data:", req.body);
    return res.status(400).send("Bad Request");
  }

  if (Object.keys(req.body).length !== 2) {
    console.error("Login failed. Extra fields in body:", req.body);
    return res.status(400).send("Bad Request");
  }

  const user = registeredUsers.find(
    (u) => u.userHandle === userHandle && u.password === password
  );

  if (!user) {
    console.error("Unauthorized login attempt for:", userHandle);
    return res.status(401).send("Unauthorized, incorrect username or password");
  }

  const token = `${userHandle}:${Date.now()}`;
  activeTokens.push(token);

  console.info("Login successful. Token issued:", token);
  res.status(200).json({ jsonWebToken: token });
});

// POST /high-scores
app.post("/high-scores", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("High score submission failed. Missing or invalid token.");
    return res.status(401).send("Unauthorized, JWT token is missing or invalid");
  }

  const token = authHeader.split(" ")[1];

  if (!activeTokens.includes(token)) {
    console.error("High score submission failed. Invalid token:", token);
    return res.status(401).send("Unauthorized, JWT token is missing or invalid");
  }

  const { level, userHandle, score, timestamp } = req.body;

  if (!level || !userHandle || !score || !timestamp) {
    console.error("High score submission failed. Invalid data:", req.body);
    return res.status(400).send("Invalid request body");
  }

  gameHighScores.push({ level, userHandle, score, timestamp });
  console.info("High score recorded successfully:", {
    level,
    userHandle,
    score,
    timestamp,
  });
  res.status(201).send("High score posted successfully");
});

// GET /high-scores
app.get("/high-scores", (req, res) => {
  const { level, page = 1 } = req.query;

  if (!level) {
    console.error("High score retrieval failed. Missing level parameter.");
    return res.status(400).send("Level is required");
  }

  const scoresForLevel = gameHighScores
    .filter((score) => score.level === level)
    .sort((a, b) => b.score - a.score);

  const pageSize = 20;
  const startIndex = (page - 1) * pageSize;
  const paginatedScores = scoresForLevel.slice(
    startIndex,
    startIndex + pageSize
  );

  console.info(
    `High scores retrieved. Level: ${level}, Page: ${page}, Results: ${paginatedScores.length}`
  );
  res.status(200).json(paginatedScores);
});

// ------ END OF SOLUTION ------ //

let serverInstance = null;
module.exports = {
  start: function () {
    serverInstance = app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  },
  close: function () {
    serverInstance.close();
    console.log("Server stopped");
  },
};
