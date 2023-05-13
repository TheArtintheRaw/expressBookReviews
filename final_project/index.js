const express = require('express')
const jwt = require('jsonwebtoken')
const customerRoutes = require('./router/auth_users').router
const generalRoutes = require('./router/general')
require('dotenv').config()
const session = require('express-session')

const app = express()
const jwtsecret = process.env.JWT_SECRET
const jwttoken = process.env.JWT_TOKEN

app.use(express.json())
app.use(
  session({
    secret: 'fingerprint_customer',
    resave: true,
    saveUninitialized: true
  })
)

app.use('/customer', customerRoutes)

app.use('/customer/auth/*', function auth(req, res, next) {
  const token = req.headers.authorization

  if (!token) {
    return res.status(401).json({ message: 'Access token not provided.' })
  }

  // const accessToken = token.split(' ')[1]
  const accessToken = jwttoken

  try {
    const decoded = jwt.verify(accessToken, jwtsecret)
    req.username = decoded.username
    next()
  } catch (err) {
    console.error(err)
    return res.status(401).json({ message: 'Invalid access token.' })
  }
})

app.use('/', generalRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
