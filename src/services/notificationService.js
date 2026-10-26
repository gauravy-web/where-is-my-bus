
const admin = require('firebase-admin');

let serviceAccount;

// Use environment variable on Render; use local JSON file otherwise.
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT is not valid JSON. Check your Render environment variable.'
    );
  }
} else {
  serviceAccount = require('../../firebase-admin.json');
}

// Initialize Firebase Admin only once.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const sendNotification = async (fcmToken, title, body, data = {}) => {
  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)])
      ),
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'whereismybus',
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('Notification sent:', response);
    return response;
  } catch (err) {
    console.error('Notification error:', err.message);
    throw err;
  }
};

const sendMulticast = async (fcmTokens, title, body, data = {}) => {
  if (!Array.isArray(fcmTokens) || fcmTokens.length === 0) {
    return;
  }

  try {
    const message = {
      tokens: fcmTokens,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)])
      ),
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'whereismybus',
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    console.log(
      `Sent: ${response.successCount}, Failed: ${response.failureCount}`
    );

    return response;
  } catch (err) {
    console.error('Multicast error:', err.message);
    throw err;
  }
};

module.exports = { sendNotification, sendMulticast };
