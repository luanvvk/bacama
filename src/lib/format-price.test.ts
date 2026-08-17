import { formatVnd, formatUsdApprox } from './format-price';

describe('formatVnd', () => {
  it('formats an amount with thousands separators and the đồng sign', () => {
    expect(formatVnd(280000)).toBe('280.000 ₫');
  });
});

describe('formatUsdApprox', () => {
  it('converts VND to an approximate USD amount', () => {
    expect(formatUsdApprox(280000)).toBe('$11.43');
  });
});
