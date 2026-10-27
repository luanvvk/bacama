export class SiteForbiddenError extends Error {
  constructor() {
    super('Site not accessible');
    this.name = 'SiteForbiddenError';
  }
}

export class MenuItemNotFoundError extends Error {
  constructor() {
    super('Menu item not found');
    this.name = 'MenuItemNotFoundError';
  }
}
