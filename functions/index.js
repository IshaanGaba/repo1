/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: '79d331001@smtp-brevo.com',
    pass: 'KwpN9dTAzDgYybHI' // Replace with your actual master password
  }
});

exports.sendLoginNotification = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to send notifications.');
  }

  const { email, timestamp, userAgent } = data;

  const mailOptions = {
    from: '79d331001@smtp-brevo.com',
    to: email,
    subject: 'New Login Detected',
    text: `A new login was detected for your account.
    
    Time: ${new Date(timestamp).toLocaleString()}
    User Agent: ${userAgent}
    
    If this wasn't you, please contact support immediately.`
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Login notification email sent successfully' };
  } catch (error) {
    console.error('Error sending login notification email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send login notification email');
  }
});
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
