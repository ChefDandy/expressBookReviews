const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const session = require('express-session');

let users = [];

const isValid = (username) => {
  // Check if the username is valid (e.g., non-empty and unique)
  return username && username.length > 0;
}

const authenticatedUser = (username, password) => {
  // Check if the username and password match the records
  const user = users.find(user => user.username === username && user.password === password);
  return user !== undefined;
}

// Configure session
regd_users.use(session({ secret: 'fingerprint_customer', resave: true, saveUninitialized: true }));

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' });
  req.session.username = username; // Store username in session
  return res.status(200).json({ message: "Login successful.", token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: "No token provided." });
  }

  jwt.verify(token, 'your_secret_key', (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: "Failed to authenticate token." });
    }

    const username = decoded.username;
    const book = books[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    if (!book.reviews) {
      book.reviews = {};
    }

    book.reviews[username] = review;
    return res.status(200).json({ message: "Review added/updated successfully." });
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
