import { isEmail } from 'class-validator';
import { CreateUserDto } from './dto/create-user.dto';
import { OversightPolicy } from './oversight-policy';

/** Shared rules for manually created accounts and CSV imports. */
export function validateOversightUser(user: CreateUserDto, policy: OversightPolicy): string[] {
  const errors: string[] = [];
  const text = (value: unknown) => String(value ?? '').trim();
  const name = text(user.name);
  if (name.length < 2 || name.length > 100 || (name.match(/\p{L}/gu) || []).length < 2 || !/^[\p{L}][\p{L}\p{M} .'-]*$/u.test(name)) errors.push('Name must contain at least two letters and at most 100 characters');
  if (!isEmail(text(user.email))) errors.push('Enter a valid email address');
  if (user.role === 'candidate' && text(user.email).toLowerCase().split('@')[1] !== policy.studentEmailDomain) errors.push(`Use an @${policy.studentEmailDomain} email address`);
  if (user.phone && !/^\+?[\d ()-]{8,20}$/.test(text(user.phone))) errors.push('Enter a valid phone number');
  for (const [label, value] of [['Designation', user.headline], ['Location', user.location]] as const) {
    if (value && (text(value).length > 100 || !/\p{L}/u.test(text(value)) || /[<>\r\n]/.test(text(value)))) errors.push(`${label} must contain valid text with letters and be at most 100 characters`);
  }
  if (user.role === 'candidate') {
    const branch = policy.branches.find((b) => b.name === text(user.department));
    if (!branch) errors.push('Select a valid branch from the list');
    const roll = text(user.rollNumber).toUpperCase().match(/^B(\d{2})(CS|IT|EC|EE|ME|CV)(\d{3})$/);
    if (!roll || Number(roll[1]) > new Date().getFullYear() % 100 || Number(roll[3]) === 0 || (branch && roll[2] !== branch.code)) errors.push(`Use the roll format ${policy.rollExample}, with the selected branch code and a valid admission year`);
    if (typeof user.cgpa !== 'number' || !/^\d+(\.\d{1,2})?$/.test(String(user.cgpa)) || user.cgpa > 10) errors.push('CGPA must be between 0 and 10 with at most two decimals');
    if (!Number.isInteger(user.backlogs) || user.backlogs! < 0 || user.backlogs! > 50) errors.push('Backlogs must be a whole number from 0 to 50');
  }
  if (user.role === 'alumni') {
    const company = text(user.company);
    if (company.length < 2 || company.length > 100 || !/\p{L}/u.test(company) || /[<>\r\n]/.test(company)) errors.push('Company must contain valid text with letters and be 2–100 characters long');
    if (!/^\d{4}$/.test(text(user.batch)) || Number(user.batch) < 1990 || Number(user.batch) > new Date().getFullYear()) errors.push(`Graduation year must be between 1990 and ${new Date().getFullYear()}`);
    if (!Number.isInteger(user.referrals) || user.referrals! < 0 || user.referrals! > policy.referralLimit) errors.push(`Referrals must be a whole number from 0 to ${policy.referralLimit}`);
  }
  return errors;
}
