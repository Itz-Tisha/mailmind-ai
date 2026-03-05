const { google } = require('googleapis');

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BACKEND_URL}/auth/callback`
  );
}

async function getAccessTokenFromRefreshToken(refreshToken) {
  const oAuth2Client = getOAuthClient();

  oAuth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oAuth2Client.refreshAccessToken();
  return credentials.access_token;
}

module.exports = {
  getOAuthClient,
  getAccessTokenFromRefreshToken,
};