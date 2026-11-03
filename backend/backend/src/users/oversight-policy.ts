import { College } from '../colleges/colleges.repository';

export const OVERSIGHT_BRANCHES = [
  { name: 'Computer Science', code: 'CS' },
  { name: 'IT', code: 'IT' },
  { name: 'Electronics', code: 'EC' },
  { name: 'EEE', code: 'EE' },
  { name: 'Mechanical', code: 'ME' },
  { name: 'Civil', code: 'CV' },
];

export function collegeEmailDomain(college: College): string {
  // Explicit domains for demo colleges; new colleges use their registered address.
  const domains: Record<string, string> = { IIITSRICITY: 'iiits.in', VIT: 'vit.in', SRM: 'srm.in', BITS: 'bits.in' };
  return domains[college.code.toUpperCase()] || college.email.split('@')[1].toLowerCase();
}

export function oversightPolicy(college: College) {
  return {
    collegeId: college.id, collegeName: college.name,
    studentEmailDomain: collegeEmailDomain(college),
    referralLimit: 10,
    branches: OVERSIGHT_BRANCHES,
    rollExample: `B${String(new Date().getFullYear()).slice(-2)}CS001`,
    rollFormat: 'B + two-digit admission year + branch code + three-digit serial (001–999)',
  };
}
export type OversightPolicy = ReturnType<typeof oversightPolicy>;
