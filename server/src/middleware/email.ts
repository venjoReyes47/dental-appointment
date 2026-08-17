import nodemailer from 'nodemailer';
import { env } from '../config/env';
import type { Appointment } from '../models/Appointment';
import type { User } from '../models/User';

export const sendAppointmentConfirmationEmail = async (appointment: Appointment, patient: User): Promise<void> => {
  if (!env.SMTP_HOST || !env.SMTP_FROM) return;

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined
  });

  const formattedDate = appointment.AppointmentDate.toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: patient.Email,
    subject: 'Appointment Confirmation',
    text: `Your appointment has been confirmed for ${formattedDate}.`,
    html: `<h2>Appointment Confirmation</h2><p>Dear ${patient.FirstName} ${patient.LastName},</p><p>Your appointment has been confirmed for ${formattedDate}.</p><p>Please arrive 15 minutes before your scheduled time.</p>`
  });
};
