const express = require('express')
const axios = require('axios')
const cors = require('cors')
require('dotenv').config({ path: __dirname + '/.env' })
const { createUser, notifyUser, findUser } = require('./utils')

// NOTE: we need those from in process.env

const app = express()

app.use(express.json())
app.use(
  cors({
    origin: 'http://localhost:3000',
  }),
)

app.get('/', (req, res) => {
  res.send('OK!')
})

app.post('/request_loan', async (req, res) => {
  const { body } = req
  const newUser = createUser(body)
  const { phone, email, _id } = newUser
  const { emailNotifySuccess, numberNotifySuccess } = await notifyUser({
    phone,
    email,
    redirectTo: `${process.env.FRONT_URL}/verification/${_id}`,
  })

  if (emailNotifySuccess && numberNotifySuccess) {
    res.send('success')
  } else if (emailNotifySuccess) {
    res.send('email succedded')
  } else if (numberNotifySuccess) {
    res.send('number succedded')
  } else {
    res.send('failed').status(500)
  }
})

app.get('/user/:userId', (req, res) => {
  const user = findUser(req.params.userId)

  if (user.error) {
    return res.send('User Not found').status(404)
  }

  res.json(user)
})

app.post('/transfer_loan', async (req, res) => {
  const {
    body: { userID },
  } = req
  const user = findUser(userID)
  if (user.error) {
    return res.send('User Not found').status(404)
  }
  // here is the user
})

app.get('/session_data/:sessionId', async (req, res) => {
  const { params: { sessionId } } = req
  const { data } = await axios({
    url: `${process.env.KVALIFIKA_API}/verification/session-data/v2/${sessionId}`,
    method: 'GET',
    headers: {
      Authorization: `${process.env.KVALIFIKA_SECRET_KEY}`,
    },
  })
  res.json(data)
})


module.exports = app
