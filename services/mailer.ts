import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SG_KEY!);

type SendSGMail = {
  from: string;
  to: string;
  sender?: string;
  subject: string;
  html: string;
  attachments: any;
  text?: string;
};

const sendSGMail = async ({
  to,
  sender,
  subject,
  html,
  attachments,
  text,
}: SendSGMail) => {
  try {
    const from = "ali.mirdad75@gmail.com";

    const msg = {
      to: to, // Change to your recipient
      from: from, // Change to your verified sender
      subject: subject,
      html: html,
      // text: text,
      attachments,
    };
    console.log(process.env.SG_KEY);
    sgMail.setApiKey(process.env.SG_KEY!);
    console.log("sending...");
    return sgMail.send(msg);
  } catch (error) {
    console.log(error);
  }
};

const sendEmail = async (args: SendSGMail) => {
  // if (process.env.NODE_ENV === "development") {
  //   return Promise.resolve();
  // } else {
  //   return sendSGMail(args);
  // }
  return sendSGMail(args);
};

export default sendEmail;
