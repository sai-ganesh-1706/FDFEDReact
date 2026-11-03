import { BadRequestException } from '@nestjs/common';
import type { Opportunity } from './opportunities.repository';

/** Enforce posting rules for new values without invalidating unchanged historical data. */
export function validateOpportunityTerms(
  changes: Partial<Opportunity>,
  current?: Opportunity,
) {
  const changed = (key: keyof Opportunity) =>
    changes[key] !== undefined &&
    JSON.stringify(changes[key]) !== JSON.stringify(current?.[key]);
  const fail = (message: string): never => {
    throw new BadRequestException(message);
  };
  if (
    changed('title') &&
    !/^(?=.*[A-Za-z])[A-Za-z0-9 -]+$/.test(changes.title?.trim() ?? '')
  )
    fail(
      'Job title must contain letters and may only use letters, numbers, spaces and hyphens',
    );
  if (
    changed('location') &&
    (!changes.location?.trim() ||
      changes.location
        .split('|')
        .some((location) => !/^[A-Za-z ,.\-]+$/.test(location.trim())))
  )
    fail(
      'Add a valid work location using letters, spaces, commas, dots and hyphens',
    );
  if (
    changed('cgpa') &&
    changes.cgpa !== 0 &&
    (typeof changes.cgpa !== 'number' ||
      changes.cgpa < 2 ||
      changes.cgpa > 10 ||
      Math.abs(changes.cgpa * 10 - Math.round(changes.cgpa * 10)) > 0.000001)
  )
    fail(
      'CGPA must be 0 (no minimum) or between 2 and 10 with at most one decimal place',
    );
  if (
    changed('openings') &&
    (!Number.isInteger(changes.openings) || changes.openings! < 1)
  )
    fail('Openings must be a positive whole number');
  if (
    changed('branches') &&
    (!changes.branches?.length ||
      changes.branches.some((branch) => !branch.trim()))
  )
    fail('Select at least one eligible branch');
  if (
    changed('tags') &&
    changes.tags?.some(
      (skill) =>
        !current?.tags?.includes(skill) && !/^[A-Za-z0-9 ]+$/.test(skill),
    )
  )
    fail('Skills may only contain letters, numbers and spaces');
  if (changed('deadline')) {
    const value = changes.deadline ?? '';
    const date = new Date(`${value}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const max = new Date(today);
    max.setMonth(max.getMonth() + 3);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      Number.isNaN(date.getTime()) ||
      date < today ||
      date > max
    )
      fail('Deadline must be today or within the next 3 months');
  }
  const type = changes.type ?? current?.type;
  if (changed('salary') || changed('type')) {
    const salary = changes.salary ?? current?.salary;
    if (salary && salary !== 'Not specified') {
      const match =
        type === 'Internship'
          ? salary.match(/^Rs\.(\d+(?:\.\d+)?)\/month$/)
          : salary.match(/^(\d+(?:\.\d+)?) LPA$/);
      if (!match)
        fail(
          type === 'Internship'
            ? 'Internship compensation must be an amount in Rs. per month'
            : 'Full-time compensation must be in LPA',
        );
      const amount = Number(match![1]);
      if (
        type === 'Internship' &&
        (amount < 500 || amount > 200000 || amount % 500 !== 0)
      )
        fail(
          'Monthly compensation must be Rs.500–2,00,000, in multiples of Rs.500',
        );
      if (
        type !== 'Internship' &&
        (amount < 0.5 || amount > 500 || amount % 0.5 !== 0)
      )
        fail('CTC must be 0.5–500 LPA, in multiples of 0.5');
    }
  }
  if (
    changed('duration') &&
    type === 'Internship' &&
    changes.duration &&
    !['Not specified', '1 Month', '2 Months', '3 Months', '6 Months'].includes(
      changes.duration,
    )
  )
    fail('Select a valid internship duration');
}
