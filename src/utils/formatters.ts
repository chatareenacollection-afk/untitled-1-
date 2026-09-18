export const PKR_TO_USD_RATE = 280;

export function formatPrice(amountInPKR: number, currency: 'PKR' | 'USD' = 'PKR'): string {
  if (currency === 'USD') {
    const usd = amountInPKR / PKR_TO_USD_RATE;
    return `$${usd.toFixed(2)}`;
  }
  return `Rs. ${Math.round(amountInPKR).toLocaleString()}`;
}

export function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export const PAKISTAN_MAJOR_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Mirpur (AJK)',
  'Other Pakistani City',
  'International (Overseas)',
];
