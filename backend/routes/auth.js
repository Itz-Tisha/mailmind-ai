// const express = require('express');
// const router = express.Router();
// const { google } = require('googleapis');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// //we used callback url because once we send user for login/signup to google consent screen , then google dont know ur application url . so after user verification
// // google use that callback url to redirect to my application.
// const oAuth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   `${process.env.BACKEND_URL}/auth/callback`
// );

// // this code send user to google consent screen to verify if user has account before or for sign up request = create account. 
// router.get('/login', (req, res) => {
//   const mode = req.query.mode;

//   const url = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',   // 🔹 request refresh token
//     prompt: 'consent',        // 🔹 force consent screen
//     scope: [ 
//       'profile',
//       'email',
//       'https://www.googleapis.com/auth/gmail.readonly',
//       'https://www.googleapis.com/auth/calendar.events',
//       'https://www.googleapis.com/auth/gmail.modify',
//     ],
//     state: mode,
//   });

//   res.redirect(url);
// });




// router.get('/callback', async (req, res) => {
//   try {
//     const { code, state } = req.query;

//     const { tokens } = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     const oauth2 = google.oauth2({ auth: oAuth2Client, version: 'v2' });
//     const { data } = await oauth2.userinfo.get();

//     let user = await User.findOne({ googleId: data.id });

//     // LOGIN FLOW
//     if (state === 'login' && !user) {
//       return res.redirect(
//         `${process.env.FRONTEND_URL}/login?error=NO_ACCOUNT`
//       );
//     }

//     // SIGNUP FLOW
//     if (state === 'signup') {
//       if (user) {
//         return res.redirect(
//           `${process.env.FRONTEND_URL}/login?error=ALREADY_EXISTS`
//         );
//       }

//       user = await User.create({
//         googleId: data.id,
//         name: data.name,
//         email: data.email,
//         googleRefreshToken: tokens.refresh_token // store first-time refresh token
//       });
//     }

//     // 🔹 Update user refresh token if missing
//     if (!user.googleRefreshToken && tokens.refresh_token) {
//       user.googleRefreshToken = tokens.refresh_token;
//       await user.save();
//     }

//     // 🔹 Create JWT with access + refresh token
//     const token = jwt.sign(
//   { 
//     id: user._id,
//     googleAccessToken: tokens.access_token,
//     googleRefreshToken: tokens.refresh_token || user.googleRefreshToken
//   },
//   process.env.JWT_SECRET,
//   { expiresIn: '7d' }
// );

//   console.log(token);
//     res.redirect(`${process.env.FRONTEND_URL}/home?token=${token}`);
//   } catch (err) {
//     console.error(err);
  
//     res.status(500).send('OAuth failed');
//   }
// });


// module.exports = router;






const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
//we used callback url because once we send user for login/signup to google consent screen , then google dont know ur application url . so after user verification
// google use that callback url to redirect to my application.
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL}/auth/callback`
);

// this code send user to google consent screen to verify if user has account before or for sign up request = create account. 
router.get('/login', (req, res) => {
  const mode = req.query.mode;

  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',   // 🔹 request refresh token
    prompt: 'consent',        // 🔹 force consent screen
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/gmail.modify',
    ],
    state: mode,
  });

  res.redirect(url);
});




router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oAuth2Client, version: 'v2' });
    const { data } = await oauth2.userinfo.get();

    let user = await User.findOne({ googleId: data.id });

    // LOGIN FLOW
    if (state === 'login' && !user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=NO_ACCOUNT`
      );
    }

    // SIGNUP FLOW
    if (state === 'signup') {
      if (user) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=ALREADY_EXISTS`
        );
      }

      user = await User.create({
        googleId: data.id,
        name: data.name,
        email: data.email,
        googleRefreshToken: tokens.refresh_token // store first-time refresh token
      });
    }

    // 🔹 Update user refresh token if missing
    // if (!user.googleRefreshToken && tokens.refresh_token) {
    //   user.googleRefreshToken = tokens.refresh_token;
    //   await user.save();
    // }


    // Always store refresh token if received
if (tokens.refresh_token) {
  user.googleRefreshToken = tokens.refresh_token;
}

// Always store latest access token
if (tokens.access_token) {
  user.googleAccessToken = tokens.access_token;
}

await user.save();
    // 🔹 Create JWT with access + refresh token
    const token = jwt.sign(
  { 
    id: user._id,
    googleAccessToken: tokens.access_token,
    googleRefreshToken: tokens.refresh_token || user.googleRefreshToken
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

    console.log(token);
    res.redirect(`${process.env.FRONTEND_URL}/home?token=${token}`);
  } catch (err) {
    console.error(err);
  
    res.status(500).send('OAuth failed');
  }
});


module.exports = router;




