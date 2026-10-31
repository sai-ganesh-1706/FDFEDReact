import { College } from '../colleges/colleges.repository';

export const OVERSIGHT_BRANCHES = [
  { name: 'Computer Science', code: 'CS' },
  { name: 'IT', code: 'IT' },
  { name: 'Electronics', code: 'EC' },
  { name: 'EEE', code: 'EE' },
  { name: 'Mechanical', code: 'ME' },
  { name: 'Civil', code: 'CV' },
];

export function oversightPolicy(college: College) {
  // Explicit product domains requested for the demo colleges. New colleges use their registered email domain.
  const domains: Record<string, string> = { IIITSRICITY: 'iiits.in', VIT: 'vit.in', SRM: 'srm.in', BITS: 'bits.in' };
  return {
    collegeId: college.id, collegeName: college.name,
    studentEmailDomain: domains[college.code.toUpperCase()] || college.email.split('@')[1].toLowerCase(),
    referralLimit: 10,
    branches: OVERSIGHT_BRANCHES,
    rollExample: `B${String(new Date().getFullYear()).slice(-2)}CS001`,
    rollFormat: 'B + two-digit admission year + branch code + three-digit serial (001–999)',
  };
}
export type OversightPolicy = ReturnType<typeof oversightPolicy>;
