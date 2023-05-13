const express = require('express')
let books = require('./booksdb.js')
let { isValid, users } = require('./auth_users')
const public_users = express.Router()

public_users.post('/register', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Both username and password must be provided.' })
  }

  const existingUser = users.find((user) => user.username === username)

  if (existingUser) {
    return res.status(409).json({ message: 'Username already exists. Please choose a different username.' })
  }

  const newUser = { username, password }
  users.push(newUser)

  res.status(201).json({ message: 'User registered successfully.', user: newUser })
})

public_users.get('/', function (req, res) {
  const booksString = JSON.stringify(books, null, 2)
  res.status(200).send(booksString)
})
public_users.get('/isbn/:isbn', function(req, res) {
  const { isbn } = req.params;
  const book = books.find(book => book.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  res.status(200).json(book);
});

public_users.get('/author/:author', function(req, res) {
  const { author } = req.params;
  const booksByAuthor = books.filter(book => book.author === author);

  if (!booksByAuthor.length) {
    return res.status(404).json({ message: "No books found by this author." });
  }

  res.status(200).json(booksByAuthor);
});

public_users.get('/title/:title', function(req, res) {
  const { title } = req.params;
  const booksByTitle = books.filter(book => book.title === title);

  if (!booksByTitle.length) {
    return res.status(404).json({ message: "No books found with this title." });
  }

  res.status(200).json(booksByTitle);
});

public_users.get('/review/:isbn', function(req, res) {
  const { isbn } = req.params;
  const book = books.find(book => book.isbn === isbn);

  if (!book || !book.reviews) {
    return res.status(404).json({ message: "No reviews found for this book." });
  }

  res.status(200).json(book.reviews);
});

module.exports = public_users;