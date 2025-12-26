import nodemailer from "nodemailer"
const email = process.env.EMAIL_USER
const password = process.env.EMAIL_PASS
if (!email || !password) throw new Error("Email and Password not set, please add email and app password")
     
export const transporter = nodemailer.createTransport({
     service: "gmail",
     auth: {
          user: email,
          pass: password
     }
})