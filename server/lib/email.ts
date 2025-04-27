import nodemailer from 'nodemailer'
import { env } from './env'

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendVerificationEmail = async ({
  user,
  url,
}: {
  user: { [key: string]: unknown } & { email: string }
  url: string
  token: string
}) => {
  await transporter.sendMail({
    from: `"Biplane-Design Shop" <${env.SMTP_USER}>`,
    to: user.email,
    subject: 'Подтвердите почту для Biplane-Design Shop',
    text: `Подтвердите почту для Biplane-Design Shop\n\n${url}`,
  })
}

export const sendChangeEmailVerification = async ({
  user,
  newEmail,
  url,
}: {
  user: { [key: string]: unknown } & { email: string }
  newEmail: string
  url: string
  token: string
}) => {
  await transporter.sendMail({
    from: `"Biplane-Design Shop" <${env.SMTP_USER}>`,
    to: user.email,
    subject: 'Подтвердите изменение почты для Biplane-Design Shop',
    text:
    `Подтвердите изменение почты для Biplane-Design Shop\n\nНовая почта: ${newEmail}\n\n${url}`,
  })
}

export const sendResetPassword = async ({
  user,
  url,
}: {
  user: { [key: string]: unknown } & { email: string }
  url: string
  token: string
}) => {
  await transporter.sendMail({
    from: `"Biplane-Design Shop" <${env.SMTP_USER}>`,
    to: user.email,
    subject: 'Сброс пароля для Biplane-Design Shop',
    text: `Сброс пароля для Biplane-Design Shop\n\n${url}`,
  })
}
