const express = require('express')
const cors = require('cors')
require('dotenv').config({ path: __dirname + '/.env' })
const { createUser, notifyUser } = require('./utils')

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

module.exports = app
