export class AnnouncementForbiddenError extends Error {
  constructor() {
    super('Announcement scope not allowed');
    this.name = 'AnnouncementForbiddenError';
  }
}

export class AnnouncementNotFoundError extends Error {
  constructor() {
    super('Announcement not found');
    this.name = 'AnnouncementNotFoundError';
  }
}
