import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';

describe('Scheduling selected applicants', () => {
  let service: AssessmentsService;
  let apps: any[];
  let repo: any;
  let appService: any;
  let notify: any;
  const payload = {
    title: 'Technical Round',
    role: 'Engineer',
    date: '2026-12-15',
    time: '10:00',
    duration: '60 min',
    candidates: 99,
    platform: 'Meet',
    link: 'https://meet.google.com/test',
    type: 'Technical Interview',
    applicationIds: [1, 2],
  };

  beforeEach(() => {
    apps = [1, 2, 3].map((id) => ({
      id,
      opportunityId: 10,
      candidateId: id + 100,
      status: 'Shortlisted',
      company: 'Acme',
      title: 'Engineer',
      candidateName: `Candidate ${id}`,
    }));
    repo = { create: jest.fn((data) => ({ id: 1, ...data })) };
    appService = {
      findOne: (id: number) => apps.find((a) => a.id === id),
      ownsApplication: jest.fn(() => true),
      updateStatus: jest.fn(),
      findByCandidate: (id: number) => apps.filter((a) => a.candidateId === id),
    };
    notify = { create: jest.fn() };
    service = new AssessmentsService(
      repo,
      appService,
      notify,
      { findOne: (id) => ({ id, title: `Job ${id}`, company: 'Acme' }) } as any,
      { findById: () => ({ name: 'Recruiter' }) } as any,
      { log: jest.fn() } as any,
    );
  });

  it('schedules and notifies only checked applicants, using the actual count', () => {
    const result = service.create(payload, 9);
    expect(result.candidateIds).toEqual([101, 102]);
    expect(result.applicationIds).toEqual([1, 2]);
    expect(result.candidates).toBe(2);
    expect(result.opportunityId).toBe(10);
    expect(notify.create.mock.calls.map((c) => c[1])).toEqual([101, 102]);
    expect(appService.updateStatus).toHaveBeenCalledTimes(2);
  });

  it('validates all ownership before any records or notifications are written', () => {
    appService.ownsApplication.mockImplementation((a) => a.id !== 2);
    expect(() => service.create(payload, 9)).toThrow(ForbiddenException);
    expect(repo.create).not.toHaveBeenCalled();
    expect(notify.create).not.toHaveBeenCalled();
  });

  it('rejects applicants who are no longer eligible', () => {
    apps[1].status = 'Withdrawn';
    expect(() => service.create(payload, 9)).toThrow(BadRequestException);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('deduplicates selected application IDs', () => {
    expect(
      service.create({ ...payload, applicationIds: [1, 1] }, 9).candidates,
    ).toBe(1);
    expect(notify.create).toHaveBeenCalledTimes(1);
  });

  it('groups applicants by opportunity to preserve the job shown to each actor', () => {
    apps[1].opportunityId = 11;
    service.create(payload, 9);
    expect(
      repo.create.mock.calls.map((c) => [
        c[0].opportunityId,
        c[0].candidateIds,
      ]),
    ).toEqual([
      [10, [101]],
      [11, [102]],
    ]);
  });
});
