const { google } = require('googleapis');

async function sendMailWithAttachment({
  accessToken,
  to,
  subject,
  text,
  fileContent, // base64 PDF
}) {
  try {
    // Create OAuth client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({
      version: 'v1',
      auth: oauth2Client,
    });

    // Email structure (MIME)
    const messageParts = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: multipart/mixed; boundary="boundary"',
      '',
      '--boundary',
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      text,
      '',
      '--boundary',
      'Content-Type: application/pdf; name="report.pdf"',
      'Content-Transfer-Encoding: base64',
      'Content-Disposition: attachment; filename="report.pdf"',
      '',
      fileContent,
      '',
      '--boundary--',
    ];

    const message = messageParts.join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`📧 Email sent to ${to}`);

  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    throw error;
  }
}

module.exports = sendMailWithAttachment;