const demoDomains = { IIITSRICITY: 'iiits.in', VIT: 'vit.in', SRM: 'srm.in', BITS: 'bits.in' };

export function collegeEmailDomain(college) {
  return demoDomains[String(college?.code || '').toUpperCase()] || String(college?.email || '').split('@')[1]?.toLowerCase() || '';
}

export function collegeEmailError(email, domain) {
  const value = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(value)) return 'Enter a valid email address.';
  if (domain && value.split('@')[1] !== domain) return `Use an @${domain} email address.`;
  return '';
}
