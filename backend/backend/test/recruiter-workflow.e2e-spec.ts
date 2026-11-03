import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { AppModule } from '../src/app.module';
import { AuthSessionService } from '../src/common/auth/auth-session.service';

describe('Recruiter workflow across actor APIs', () => {
  let app: INestApplication;
  let recruiter: string;
  let officer: string;
  let candidate: string;
  let resumeFile: string;
  const auth = (token) => ({ Authorization: `Bearer ${token}` });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    const login = async (email, password = '12345678') =>
      (
        await request(app.getHttpServer())
          .post('/users/login')
          .send({ email, password })
          .expect(201)
      ).body.accessToken;
    recruiter = await login('priya@google.com', '12345678');
    officer = await login('rajesh@iiits.in');
    candidate = await login('shameer.basha.shaik@iiits.in');
  }, 30000);

  afterAll(async () => {
    await app?.close();
    if (resumeFile) {
      const path = join(process.cwd(), 'uploads', 'resumes', resumeFile);
      if (existsSync(path)) unlinkSync(path);
    }
  });

  it('enforces Job ID, lifecycle editing and saved applicant data, and serves the uploaded resume', async () => {
    const server = app.getHttpServer();
    const payload = {
      title: 'Workflow Engineer',
      company: 'Google',
      location: 'Chennai',
      deadline: '2026-12-31',
      salary: '12 LPA',
      openings: 2,
      cgpa: 6,
      branches: ['CSE'],
      type: 'Full-Time',
    };
    await request(server)
      .post('/opportunities')
      .set(auth(recruiter))
      .send(payload)
      .expect(400);
    const created = (
      await request(server)
        .post('/opportunities')
        .set(auth(recruiter))
        .send({ ...payload, jobId: 'WORKFLOW-TEST-01' })
        .expect(201)
    ).body;
    const id = created.id;
    expect(created.status).toBe('pending');
    await request(server)
      .post('/opportunities')
      .set(auth(recruiter))
      .send({ ...payload, jobId: 'workflow-test-01' })
      .expect(400);
    await request(server)
      .put(`/opportunities/${id}`)
      .set(auth(recruiter))
      .send({ cgpa: 8, title: 'Updated Engineer' })
      .expect(200);
    await request(server)
      .patch(`/opportunities/${id}/approve`)
      .set(auth(officer))
      .expect(200);
    await request(server)
      .put(`/opportunities/${id}`)
      .set(auth(recruiter))
      .send({ cgpa: 9 })
      .expect(400);
    await request(server)
      .put(`/opportunities/${id}`)
      .set(auth(recruiter))
      .send({ cgpa: 7 })
      .expect(200);
    await request(server)
      .patch(`/opportunities/${id}/publish`)
      .set(auth(officer))
      .expect(200);
    await request(server)
      .put(`/opportunities/${id}`)
      .set(auth(recruiter))
      .send({ location: 'Delhi' })
      .expect(400);
    await request(server)
      .put(`/opportunities/${id}`)
      .set(auth(recruiter))
      .send({ cgpa: 6 })
      .expect(200);

    const pdf = Buffer.from('%PDF-1.4\n% Resume fixture\n%%EOF');
    const uploaded = (
      await request(server)
        .post('/users/100/resume')
        .set(auth(candidate))
        .attach('file', pdf, {
          filename: 'candidate.pdf',
          contentType: 'application/pdf',
        })
        .expect(201)
    ).body;
    resumeFile = uploaded.resumeUrl;
    await request(server)
      .post('/users/101/resume')
      .set(auth(candidate))
      .attach('file', pdf, {
        filename: 'candidate.pdf',
        contentType: 'application/pdf',
      })
      .expect(403);
    const application = (
      await request(server)
        .post('/applications')
        .set(auth(candidate))
        .send({
          opportunityId: id,
          resumeFile: 'candidate.pdf',
          resumeUrl: resumeFile,
        })
        .expect(201)
    ).body;
    expect(application.jobId).toBe('WORKFLOW-TEST-01');
    expect(application.title).toBe('Updated Engineer');
    expect(application.status).toBe('Applied');
    const expectStatusForEveryActor = async (status: string) => {
      for (const [path, token] of [['/applications', recruiter], ['/applications', officer], ['/applications/my', candidate]]) {
        const response = await request(server).get(path).set(auth(token)).expect(200);
        expect(response.body.find((entry) => entry.id === application.id).status).toBe(status);
      }
    };
    await expectStatusForEveryActor('Applied');
    const applications = (
      await request(server)
        .get('/applications')
        .set(auth(recruiter))
        .expect(200)
    ).body;
    expect(applications.find((a) => a.id === application.id)).toMatchObject({
      candidateName: 'Shameer Basha Shaik',
      email: 'shameer.basha.shaik@iiits.in',
      branch: 'Computer Science',
      cgpa: 8.7,
      resumeUrl: resumeFile,
    });
    const preview = await request(server)
      .get(`/applications/${application.id}/resume`)
      .set(auth(recruiter))
      .expect(200);
    expect(preview.body).toEqual(pdf);
    const sessions = app.get(AuthSessionService);
    const alumni = sessions.create(101);
    const referral = (
      await request(server).post('/referrals').set(auth(candidate))
        .send({ opportunityId: id, applicationId: application.id, alumniId: 101, userMessage: 'Please review my application.' })
        .expect(201)
    ).body;
    const alumniInbox = (
      await request(server).get('/referrals').set(auth(alumni)).expect(200)
    ).body;
    expect(alumniInbox.find((item) => item.id === referral.id).applicationId).toBe(application.id);
    const alumniResume = await request(server)
      .get(`/applications/referrals/${referral.id}/resume`)
      .set(auth(alumni)).expect(200);
    expect(alumniResume.body).toEqual(pdf);
    const unrelatedAlumni = sessions.create(90);
    await request(server).get(`/applications/referrals/${referral.id}/resume`)
      .set(auth(unrelatedAlumni)).expect(403);
    await request(server).get(`/applications/referrals/${referral.id}/resume`)
      .set(auth(candidate)).expect(403);
    await request(server).get(`/applications/referrals/${referral.id}/resume`)
      .set(auth(recruiter)).expect(403);
    const alumniReply = 'I reviewed your application and am happy to refer you.';
    await request(server).patch(`/referrals/${referral.id}`).set(auth(alumni))
      .send({ status: 'Approved', alumniResponse: alumniReply }).expect(200);
    const candidateReferrals = (
      await request(server).get('/referrals/my').set(auth(candidate)).expect(200)
    ).body;
    expect(candidateReferrals.find((item) => item.id === referral.id)).toMatchObject({ status: 'approved', alumniResponse: alumniReply });
    const recruiterView = (
      await request(server).get('/applications').set(auth(recruiter)).expect(200)
    ).body.find((item) => item.id === application.id);
    expect(recruiterView).toMatchObject({ hasReferral: true, referrerName: 'Sneha Reddy', referrerCompany: 'Google' });
    await request(server)
      .patch(`/applications/${application.id}/status`)
      .set(auth(recruiter))
      .send({ status: 'Shortlisted' })
      .expect(200);
    await expectStatusForEveryActor('Shortlisted');
    const recruiterFeedback = 'Strong fundamentals; move to the technical interview.';
    await request(server).patch(`/applications/${application.id}/status`).set(auth(recruiter))
      .send({ recruiterRating: 5, recruiterFeedback, feedbackSent: true }).expect(200);
    const candidateApplications = (
      await request(server).get('/applications/my').set(auth(candidate)).expect(200)
    ).body;
    expect(candidateApplications.find((item) => item.id === application.id)).toMatchObject({ recruiterRating: 5, recruiterFeedback, feedbackSent: true });
    await request(server)
      .patch(`/applications/${application.id}/status`)
      .set(auth(recruiter))
      .send({ status: 'Assessment' })
      .expect(400);
    const schedule = (
      await request(server)
        .post('/assessments')
        .set(auth(recruiter))
        .send({
          applicationIds: [application.id],
          title: 'Technical Round',
          role: 'Updated Engineer',
          date: '2026-12-20',
          time: '10:00',
          duration: '60 min',
          candidates: 1,
          platform: 'Meet',
          link: 'https://meet.google.com/test',
          type: 'Interview',
        })
        .expect(201)
    ).body;
    expect(schedule.candidateIds).toEqual([100]);
    expect(schedule.opportunityId).toBe(id);
    const scheduledForCandidate = (
      await request(server).get('/assessments/my').set(auth(candidate)).expect(200)
    ).body;
    expect(scheduledForCandidate.find((item) => item.id === schedule.id)).toMatchObject({ link: 'https://meet.google.com/test', applicationId: application.id });
    await expectStatusForEveryActor('Interview');
    const mine = (
      await request(server)
        .get('/applications/my')
        .set(auth(candidate))
        .expect(200)
    ).body;
    expect(mine.find((a) => a.id === application.id).status).toBe('Interview');
    await request(server)
      .patch(`/applications/${application.id}/status`)
      .set(auth(recruiter))
      .send({ status: 'Offered' })
      .expect(200);
    await expectStatusForEveryActor('Offered');
  });
});
