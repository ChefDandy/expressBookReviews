const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');
const getBooks = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(books); // 'books' is still coming from the local booksdb.js
      }, 1000); // Simulating a 1-second delay
    });
  };
// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const userExists = users.find(user => user.username === username);

  if (userExists) {
    return res.status(400).json({ message: "Username already exists." });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
      const bookList = await getBooks();
      return res.status(200).json(bookList);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch books." });
    }
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const { author } = req.params;
  const filteredBooks = Object.values(books).filter(book => book.author === author);
  
  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found by this author." });
  }
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const { title } = req.params;
  const filteredBooks = Object.values(books).filter(book => book.title.includes(title));
  
  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title." });
  }
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  
  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "No reviews found for this book." });
  }
});

public_users.delete('/review/:isbn', (req, res) => {
    const { isbn } = req.params;
    const username = req.body.username; // Assuming username is passed in the body of the request
    
    if (books[isbn]) {
      const reviews = books[isbn].reviews;
  
      if (reviews && reviews[username]) {
        delete reviews[username];
        return res.status(200).json({ message: "Review deleted successfully." });
      } else {
        return res.status(404).json({ message: "Review not found." });
      }
    } else {
      return res.status(404).json({ message: "Book not found." });
    }
  });


module.exports.general = public_users;
