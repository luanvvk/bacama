import { getLocalHandoff } from '..';

const ENV_VAR = 'GRABFOOD_LISTING_URL';
const LISTING = 'https://food.grab.com/vn/en/restaurant/example';

describe('grabfood local handoff', () => {
  const original = process.env[ENV_VAR];

  afterEach(() => {
    if (original === undefined) delete process.env[ENV_VAR];
    else process.env[ENV_VAR] = original;
  });

  it('returns the configured listing URL', () => {
    process.env[ENV_VAR] = LISTING;
    expect(getLocalHandoff().buildHandoffLink('item-1', 'site-1')).toBe(LISTING);
  });

  it('throws naming the variable when unset', () => {
    delete process.env[ENV_VAR];
    expect(() => getLocalHandoff()).toThrow(ENV_VAR);
  });

  it.each(['http://food.grab.com/x', 'not a url'])('throws on invalid URL %s', (value) => {
    process.env[ENV_VAR] = value;
    expect(() => getLocalHandoff()).toThrow(ENV_VAR);
  });

  it('rejects empty ids', () => {
    process.env[ENV_VAR] = LISTING;
    const handoff = getLocalHandoff();
    expect(() => handoff.buildHandoffLink('', 'site-1')).toThrow(Error);
    expect(() => handoff.buildHandoffLink('item-1', '')).toThrow(Error);
  });
});
