const nodemailer = require("nodemailer");
const fs = require("fs");

const env = fs.readFileSync(".env.local", "utf8").split("\n").reduce((acc, line) => {
  const [key, ...val] = line.split("=");
  if (key && val) {
    acc[key.trim()] = val.join("=").replace(/"/g, '').trim();
  }
  return acc;
}, {});

async function testSmtp() {
  console.log("Testing SMTP connection to:", env.SMTP_HOST);
  console.log("Port:", env.SMTP_PORT);
  console.log("User:", env.SMTP_USER);

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || "smtp-fr.securemail.pro",
    port: parseInt(env.SMTP_PORT || "465"),
    secure: true, 
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    debug: true, 
    logger: true 
  });

  try {
    const info = await transporter.sendMail({
      from: `"FretTalent" <${env.SMTP_USER}>`,
      to: env.SMTP_USER,
      subject: "Test de connexion SMTP",
      text: "Si vous lisez ceci, c'est que l'envoi fonctionne !"
    });
    console.log("Message sent successfully!", info.messageId);
  } catch (err) {
    console.error("SMTP Error Details:", err);
  }
}

testSmtp();
