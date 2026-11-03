import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Backend demo records stay consistent across actors', () => {
  let app: INestApplication;
  const tokens: Record<string, string> = {};
  const auth = (actor: string) => ({ Authorization: `Bearer ${tokens[actor]}` });

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    for (const [key, email] of Object.entries({
      candidate: 'shameer.basha.shaik@iiits.in',
      alumni: 'sneha@google.com',
      recruiter: 'priya@google.com',
      officer: 'rajesh@iiits.in',
    })) {
      const response = await request(app.getHttpServer()).post('/users/login')
        .send({ email, password: '12345678' }).expect(201);
      tokens[key] = response.body.accessToken;
    }
  }, 30000);

  afterAll(async () => { await app?.close(); });

  it('uses the same job, application, referral, feedback and schedule from all roles', async () => {
    const server = app.getHttpServer();
    const candidateJobs = (await request(server).get('/opportunities').set(auth('candidate')).expect(200)).body;
    expect(candidateJobs.find((job) => job.id === 2001)).toMatchObject({ jobId: 'JOB-2001', status: 'Published', company: 'Google' });

    const candidateApplications = (await request(server).get('/applications/my').set(auth('candidate')).expect(200)).body;
    expect(candidateApplications.find((item) => item.id === 5007)).toMatchObject({
      opportunityId: 2001, status: 'Interview', recruiterRating: 4, feedbackSent: true,
    });

    const officerJobs = (await request(server).get('/opportunities').set(auth('officer')).expect(200)).body;
    expect(officerJobs.find((job) => job.id === 1001)).toMatchObject({ status: 'pending', recruiterId: 102, jobId: 'JOB-1001' });

    const recruiterApplications = (await request(server).get('/applications').set(auth('recruiter')).expect(200)).body;
    expect(recruiterApplications.find((item) => item.id === 5007)).toMatchObject({
      candidateId: 100, opportunityId: 2001, status: 'Interview', referralStatus: 'pending',
      recruiterRating: 4, feedbackSent: true,
    });

    const alumniRequests = (await request(server).get('/referrals').set(auth('alumni')).expect(200)).body;
    expect(alumniRequests.find((item) => item.id === 1)).toMatchObject({ applicationId: 5007, status: 'pending', appliedCompany: 'Google' });
    const reply = 'I reviewed the application and am happy to refer you.';
    await request(server).patch('/referrals/1').set(auth('alumni'))
      .send({ status: 'Approved', alumniResponse: reply }).expect(200);

    const candidateReferrals = (await request(server).get('/referrals/my').set(auth('candidate')).expect(200)).body;
    expect(candidateReferrals.find((item) => item.id === 1)).toMatchObject({ status: 'approved', alumniResponse: reply });
    const recruiterAfterReferral = (await request(server).get('/applications').set(auth('recruiter')).expect(200)).body;
    expect(recruiterAfterReferral.find((item) => item.id === 5007)).toMatchObject({
      hasReferral: true, referrerName: 'Sneha Reddy', referrerCompany: 'Google',
    });

    const candidateSchedules = (await request(server).get('/assessments/my').set(auth('candidate')).expect(200)).body;
    expect(candidateSchedules.find((item) => item.id === 1)).toMatchObject({
      applicationId: 5007, opportunityId: 2001, link: 'https://meet.google.com/demo-google-round',
    });
  });
});
