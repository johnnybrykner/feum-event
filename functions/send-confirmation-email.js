require("dotenv").config();
const { MAILGUN_API_KEY, MAILGUN_DOMAIN, FROM_EMAIL_ADDRESS } = process.env;
const mailgun = require("mailgun-js")({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN, host: "api.eu.mailgun.net" });

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: "Method Not Allowed", headers: { "Allow": "POST" } }
  }

  const data = JSON.parse(event.body);
  if (!data.participantId || !data.contactEmail) {
    return { statusCode: 422, body: "Incomplete data provided for the email to be submitted." }
  }

  const mailgunData = {
    from: FROM_EMAIL_ADDRESS,
    to: data.contactEmail,
    cc: FROM_EMAIL_ADDRESS,
    subject: "FEUM Days Confirmation Email",
    html:
`
<div style="text-align:center;">
    <h1 style="font-size:2rem;">Hey there ${data.contactName}! Thank you again for joining us :)</h1>
    <p>Please, in order to reserve your e-ticket, transfer 100kr. to FEUM using MobilePay. FEUM’s MobilePay number: 29750 (you can use the button below)</p>
    <p>You will receive your e-ticket within 24 hours. If not, you are welcome to email us with the following subject ‘[CS] E-ticket not received’ followed by your full name and phone number.<p>
    <a style="width:169px;" href="https://mobilepay.dk/erhverv/betalingslink/betalingslink-svar?phone=29750&amount=100&comment=Your guestlist name:">
      <img src="https://developer.mobilepay.dk/sites/developer.mobilepay.dk/files/siteImages/large1x.png" alt="MobilePay logo" />
    </a>
    <p>The location will be announced 24 hours before the event by email.</p>
    <b>Your Truly, FEUM!</b>
</div>   
`
  }

  return mailgun.messages().send(mailgunData).then(() => ({
    statusCode: 200,
    body: "Thank you for taking part in our next adventure. Together, again, let’s draw the first path of a unique and never-ending journey."
  })).catch(error => ({
    statusCode: 422,
    body: JSON.stringify(error)
  }));
}
