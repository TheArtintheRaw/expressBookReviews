const express = require('express')
const books = require('./booksdb.js')
const jwt = require('jsonwebtoken')
const regd_users = express.Router()
require('dotenv').config()

const users = []

const jwtsecret = process.env.JWT_SECRET

const isValid = (username) => {
  return /^[a-zA-Z0-9]+$/.test(username)
}

const isAuthenticated = (username, password) => {
  const user = users.find((user) => user.username === username && user.password === password)
  return !!user
}

regd_users.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Both username and password must be provided.' })
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: 'Invalid username format.' })
  }

  if (!isAuthenticated(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password.' })
  }

  try {
    const token = jwt.sign({ username }, jwtsecret)
    res.cookie('token', token, { httpOnly: true })
    res.status(200).json({ message: 'Logged in successfully.' })
  } catch (error) {
    res.status(500).json({ message: 'Error generating token.' })
  }
})

regd_users.put('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params
  const { review } = req.query
  const username = req.session.username

  if (!review) {
    return res.status(400).json({ message: 'A review must be provided.' })
  }

  let book = books.find((book) => book.isbn === isbn)

  if (!book) {
    book = { isbn, reviews: [] }
    books.push(book)
  }

  const existingReview = book.reviews.find((review) => review.username === username)

  if (existingReview) {
    existingReview.review = review
  } else {
    book.reviews.push({ username, review })
  }

  res.status(200).json({ message: 'Review added or modified successfully.' })
})

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params
  const username = req.session.username

  let book = books.find((book) => book.isbn === isbn)

  if (!book) {
    return res.status(404).json({ message: 'Book not found.' })
  }

  const userReviewIndex = book.reviews.findIndex((review) => review.username === username)

  if (userReviewIndex === -1) {
    return res.status(404).json({ message: 'No review found for this user.' })
  }

  // remove the user's review from the book's reviews array
  book.reviews.splice(userReviewIndex, 1)

  return res.status(200).json({ message: 'Review deleted successfully.' })
})

module.exports = {
  router: regd_users,
  isValid,
  users
}
