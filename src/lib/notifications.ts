import { prisma } from "./prisma";

type CreateNotificationInput = {
  type: string;
  recipient: string;
  subject: string;
  body: string;
  appointmentId?: string;
  scheduledFor?: Date;
};

/**
 * Notification architecture:
 * - Always persists notification records
 * - Only attempts delivery if email provider is configured
 * - Never fakes successful delivery
 */
export async function queueNotification(input: CreateNotificationInput) {
  const settings = await prisma.businessSettings.findUnique({
    where: { id: "main" },
  });

  const canSend =
    Boolean(settings?.emailNotifications) && Boolean(settings?.smtpConfigured);

  const notification = await prisma.notification.create({
    data: {
      type: input.type,
      recipient: input.recipient,
      subject: input.subject,
      body: input.body,
      appointmentId: input.appointmentId,
      scheduledFor: input.scheduledFor,
      channel: "EMAIL",
      status: canSend ? "PENDING" : "SKIPPED",
      error: canSend
        ? null
        : "Email provider not configured — notification stored for later delivery.",
    },
  });

  return notification;
}

export async function notifyBookingCreated(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      customer: true,
      staff: true,
      service: true,
    },
  });
  if (!appointment) return;

  const settings = await prisma.businessSettings.findUnique({
    where: { id: "main" },
  });

  const when = appointment.startAt.toLocaleString("el-GR");
  const body = `Κράτηση ${appointment.confirmationCode}
Υπηρεσία: ${appointment.service.name}
Επαγγελματίας: ${appointment.staff.name}
Ημερομηνία: ${when}
Πελάτισσα: ${appointment.customer.firstName} ${appointment.customer.lastName}
Τηλέφωνο: ${appointment.customer.phone}`;

  if (appointment.customer.email) {
    await queueNotification({
      type: "BOOKING_CONFIRMATION",
      recipient: appointment.customer.email,
      subject: `Επιβεβαίωση ραντεβού — ${appointment.confirmationCode}`,
      body: `Αγαπητή ${appointment.customer.firstName},\n\nΤο ραντεβού σας στο Alexia Nails & More καταχωρήθηκε.\n\n${body}\n\nΜε εκτίμηση,\nAlexia Nails & More`,
      appointmentId,
    });
  }

  if (settings?.email) {
    await queueNotification({
      type: "ADMIN_NEW_BOOKING",
      recipient: settings.email,
      subject: `Νέο ραντεβού — ${appointment.confirmationCode}`,
      body,
      appointmentId,
    });
  }
}

export async function notifyCancellation(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { customer: true, staff: true, service: true },
  });
  if (!appointment) return;

  const settings = await prisma.businessSettings.findUnique({
    where: { id: "main" },
  });
  const body = `Ακύρωση κράτησης ${appointment.confirmationCode}`;

  if (appointment.customer.email) {
    await queueNotification({
      type: "CANCELLATION",
      recipient: appointment.customer.email,
      subject: `Ακύρωση ραντεβού — ${appointment.confirmationCode}`,
      body,
      appointmentId,
    });
  }
  if (settings?.email) {
    await queueNotification({
      type: "CANCELLATION",
      recipient: settings.email,
      subject: `Ακύρωση — ${appointment.confirmationCode}`,
      body,
      appointmentId,
    });
  }
}

export async function notifyReschedule(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { customer: true, staff: true, service: true },
  });
  if (!appointment) return;

  const when = appointment.startAt.toLocaleString("el-GR");
  const body = `Νέα ώρα: ${when}\nΚωδικός: ${appointment.confirmationCode}`;

  if (appointment.customer.email) {
    await queueNotification({
      type: "RESCHEDULE",
      recipient: appointment.customer.email,
      subject: `Αλλαγή ραντεβού — ${appointment.confirmationCode}`,
      body,
      appointmentId,
    });
  }
}

/** Architecture for future reminder jobs (24h / 2h) */
export async function scheduleReminders(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { customer: true },
  });
  if (!appointment?.customer.email) return;

  const t24 = new Date(appointment.startAt.getTime() - 24 * 60 * 60 * 1000);
  const t2 = new Date(appointment.startAt.getTime() - 2 * 60 * 60 * 1000);

  if (t24 > new Date()) {
    await queueNotification({
      type: "REMINDER_24H",
      recipient: appointment.customer.email,
      subject: `Υπενθύμιση ραντεβού αύριο — ${appointment.confirmationCode}`,
      body: `Υπενθύμιση: έχετε ραντεβού αύριο στο Alexia Nails & More.`,
      appointmentId,
      scheduledFor: t24,
    });
  }
  if (t2 > new Date()) {
    await queueNotification({
      type: "REMINDER_2H",
      recipient: appointment.customer.email,
      subject: `Υπενθύμιση ραντεβού σε 2 ώρες — ${appointment.confirmationCode}`,
      body: `Υπενθύμιση: το ραντεβού σας είναι σε περίπου 2 ώρες.`,
      appointmentId,
      scheduledFor: t2,
    });
  }
}
