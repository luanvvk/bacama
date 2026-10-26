import en from '../../../messages/en.json';
import vi from '../../../messages/vi.json';

const keyPaths = (value: unknown, prefix = ''): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => keyPaths(item, `${prefix}[${index}]`));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      keyPaths(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [prefix];
};

describe('messages parity', () => {
  it('has the same keys in vi.json and en.json', () => {
    const enKeys = new Set(keyPaths(en));
    const viKeys = new Set(keyPaths(vi));

    expect([...enKeys].filter((key) => !viKeys.has(key))).toEqual([]);
    expect([...viKeys].filter((key) => !enKeys.has(key))).toEqual([]);
  });
});
