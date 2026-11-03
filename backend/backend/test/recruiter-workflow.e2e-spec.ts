import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { AppModule } from '../src/app.module';

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
    const login = async (email, password = '123') =>
      (
        await request(app.getHttpServer())
          .post('/users/login')
          .send({ email, password })
          .expect(201)
      ).body.accessToken;
    recruiter = await login('r@gmail.com', '12345678');
    officer = await login('p@gmail.com');
    candidate = await login('c@gmail.com');
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
    const applications = (
      await request(server)
        .get('/applications')
        .set(auth(recruiter))
        .expect(200)
    ).body;
    expect(applications.find((a) => a.id === application.id)).toMatchObject({
      candidateName: 'Shameer Basha Shaik',
      email: 'c@gmail.com',
      branch: 'Computer Science',
      cgpa: 8.7,
      resumeUrl: resumeFile,
    });
    const preview = await request(server)
      .get(`/applications/${application.id}/resume`)
      .set(auth(recruiter))
      .expect(200);
    expect(preview.body).toEqual(pdf);
    await request(server)
      .patch(`/applications/${application.id}/status`)
      .set(auth(recruiter))
      .send({ status: 'Shortlisted' })
      .expect(200);
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
    const mine = (
      await request(server)
        .get('/applications/my')
        .set(auth(candidate))
        .expect(200)
    ).body;
    expect(mine.find((a) => a.id === application.id).status).toBe('Interview');
  });
});
