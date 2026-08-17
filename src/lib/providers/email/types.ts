export interface ReceiptEmail {
  id: string;
  total: number;
  email: string;
  locale: 'vi' | 'en';
}

export interface ReminderEmail {
  id: string;
  email: string;
  sessionId: string;
  startsAt: Date;
  locale: 'vi' | 'en';
}

export interface ContactMessage {
  name: string;
  email: string;
  body: string;
}

export interface EmailProvider {
  sendReceipt(order: ReceiptEmail): Promise<void>;
  sendReminder(enrollment: ReminderEmail): Promise<void>;
  sendContact(message: ContactMessage): Promise<void>;
}
