require('dotenv').config({ path: __dirname + '/.env' })
const sgMail = require('@sendgrid/mail')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const util = require('util')
const handlebars = require('handlebars')
const mjml = require('mjml')

const twilioClient = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKKEN,
)
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const readFile = util.promisify(fs.readFile)

const users = []

/**
 * this method creates user
 * @param body
 */
const createUser = (body) => {
  const newUser = {
    _id: uuidv4(),
    firstName: body.firstName,
    lastName: body.lastName,
    personalNumber: body.personalNumber,
    dateOfBirth: body.dateOfBirth,
    phone: body.phone,
    email: body.email,
    creditAmount: body.creditAmount,
    address: body.address,
  }
  users.push(newUser)

  return newUser
}

/**
 * this method finds and return user if it exists
 * @param userID
 */
const findUser = (userID) => {
  const user = users.filter((user) => user._id === userID)
  if (user.length === 1) {
    return user[0]
  } else {
    return { error: 'Not Found' }
  }
}

/**
 * this method is reusable
 * sending email using sendgrid
 * @param email
 * @param redirectTo
 */
const sendEmail = async ({ email, redirectTo }) => {
  try {
    const mjmlTemplateFile = await readFile(`./verify.hbs`, 'utf8')
    const template = handlebars.compile(mjmlTemplateFile)

    const hbsHtml = template({ redirectTo })
    const templateMarkup = mjml(hbsHtml)
    const emailRes = await sgMail.send({
      to: email,
      from: 'levaniqistauri29@gmail.com',
      subject: 'სესხი დამტკიცებულია',
      text: 'თანხის მისაღებად გთხოვთ გაიაროთ ვერიფიკაცია',
      html: templateMarkup.html,
    })
    return true
  } catch (error) {
    return false
  }
}

/**
 * this method sends message and returns boolean
 * wether it was sent or not
 * @param phone
 * @param redirectTo
 */
const sendMessage = async ({ phone, redirectTo }) => {
  try {
    const messageTemplate = `თანხის მისაღებად გთხოვთ გაიაროთ ვერიფიკაცია \n ${redirectTo}`
    const res = await twilioClient.messages.create({
      body: messageTemplate,
      from: '+16403338654',
      to: `+995${phone}`,
    })
    return !!res
  } catch (err) {
    console.log(err)
    return false
  }
}

const notifyUser = async ({ phone, email, redirectTo }) => {
  // const numberNotifySuccess = await sendMessage({ phone, redirectTo })
  // const emailNotifySuccess = await sendEmail({ email, redirectTo })
  const numberNotifySuccess = true
  const emailNotifySuccess = true

  return {
    emailNotifySuccess,
    numberNotifySuccess,
  }
}

module.exports = {
  createUser,
  notifyUser,
  findUser,
}
