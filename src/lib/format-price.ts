const VND_FORMATTER = new Intl.NumberFormat('vi-VN');
const USD_FORMATTER = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 });

const VND_PER_USD = 24500;

export const formatVnd = (amountVnd: number) => `${VND_FORMATTER.format(amountVnd)} ₫`;

export const formatUsdApprox = (amountVnd: number) =>
  `$${USD_FORMATTER.format(Math.round((amountVnd / VND_PER_USD) * 100) / 100)}`;
