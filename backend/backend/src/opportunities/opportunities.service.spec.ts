import { BadRequestException } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';

describe('Recruiter opportunity editing', () => {
  let service: OpportunitiesService;
  let opportunity: any;
  let repo: any;

  beforeEach(() => {
    opportunity = {
      id: 7,
      title: 'Engineer',
      company: 'Acme',
      status: 'pending',
      cgpa: 7,
      applications: 99,
    };
    repo = {
      findById: jest.fn(() => opportunity),
      findAll: jest.fn(() => [opportunity]),
      update: jest.fn(
        (_id, changes) => (opportunity = { ...opportunity, ...changes }),
      ),
      create: jest.fn((data) => ({ ...data, id: 8 })),
    };
    service = new OpportunitiesService(
      repo,
      { create: jest.fn() } as any,
      { findById: jest.fn() } as any,
      { log: jest.fn() } as any,
      { findByOpportunity: () => [{}, {}] } as any,
    );
  });

  it('allows increasing and decreasing CGPA before approval', () => {
    expect(service.update(7, { cgpa: 9 }).cgpa).toBe(9);
    expect(service.update(7, { cgpa: 5 }).cgpa).toBe(5);
  });

  it.each(['approved', 'Published', 'Closed'])(
    'blocks increases after %s',
    (status) => {
      opportunity.status = status;
      expect(() => service.update(7, { cgpa: 8 })).toThrow(BadRequestException);
      expect(repo.update).not.toHaveBeenCalled();
      expect(service.update(7, { cgpa: 6 }).cgpa).toBe(6);
    },
  );

  it('allows full edits before publication, including after approval', () => {
    opportunity.status = 'approved';
    expect(service.update(7, { title: 'Senior Engineer', cgpa: 6 }).title).toBe(
      'Senior Engineer',
    );
  });

  it('blocks non-CGPA edits after publication', () => {
    opportunity.status = 'Published';
    expect(() => service.update(7, { title: 'Changed' })).toThrow(
      BadRequestException,
    );
  });

  it('keeps review status and application counts authoritative', () => {
    const result = service.update(7, {
      applications: 500,
      status: 'Published',
    });
    expect(result.status).toBe('pending');
    expect(result.applications).toBe(2);
    expect(result.jobId).toBe('JOB-7');
  });

  it('requires a Job ID and prevents case insensitive duplicates', () => {
    expect(() => service.create({} as any)).toThrow('Job ID is required');
    opportunity.jobId = 'ENG-01';
    expect(() => service.create({ jobId: 'eng-01' } as any)).toThrow(
      'Job ID already exists',
    );
  });

  it('protects generated historical Job IDs from duplicates', () => {
    expect(() => service.create({ jobId: 'JOB-7' } as any)).toThrow(
      'Job ID already exists',
    );
  });
});
