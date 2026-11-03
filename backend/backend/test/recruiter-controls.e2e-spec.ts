import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthSessionService } from '../src/common/auth/auth-session.service';

describe('Recruiter controls and phone validation', () => {
  let app: INestApplication;
  let sessions: AuthSessionService;
  let recruiter: string;
  let officer: string;
  const auth = (token) => ({ Authorization: `Bearer ${token}` });
  const date = (days) => {
    const value = new Date();
    value.setDate(value.getDate() + days);
    return value.toISOString().slice(0, 10);
  };

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
    sessions = app.get(AuthSessionService);
    recruiter = sessions.create(102);
    officer = sessions.create(103);
  }, 30000);
  afterAll(async () => {
    await app?.close();
  });

  it('rejects formatted, non-digit, short and long phones on user profiles', async () => {
    const server = app.getHttpServer();
    for (const phone of [
      '123456789',
      '12345678901',
      '12345a7890',
      '12345 7890',
      '12345-7890',
      '+919876543210',
      '9876543210 ',
    ]) {
      await request(server)
        .put('/users/102')
        .set(auth(recruiter))
        .send({ phone })
        .expect(400);
    }
    // Candidate, alumni, recruiter, officer, college admin, super admin.
    for (const id of [100, 101, 102, 103, 201, 200]) {
      const response = await request(server)
        .put(`/users/${id}`)
        .set(auth(sessions.create(id)))
        .send({ phone: '9876543210' })
        .expect(200);
      expect(response.body.phone).toBe('9876543210');
    }
    await request(server)
      .put('/users/102')
      .set(auth(recruiter))
      .send({ phone: '' })
      .expect(200);
  });

  it('applies the same phone rule to college creation, recruiter contact and CSV previews', async () => {
    const server = app.getHttpServer();
    await request(server)
      .post('/colleges')
      .set(auth(sessions.create(200)))
      .send({
        name: 'Phone Test College',
        code: 'PHONETEST',
        email: 'admin@phone.test',
        phone: '+919876543210',
      })
      .expect(400);
    const contact = {
      name: 'Workflow Recruiter',
      company: 'Workflow Company',
      role: 'Hiring Manager',
      email: 'phone.controls@example.com',
      collegeId: 1,
      phone: '98765-4321',
    };
    await request(server).post('/contact/recruiter').send(contact).expect(400);
    for (const endpoint of ['import-students', 'import-alumni']) {
      const csv =
        endpoint === 'import-students'
          ? 'name,email,rollNumber,department,cgpa,backlogs,phone\nPhone Student,phone.student@iiits.in,B26CS981,Computer Science,8.1,0,98765-4321'
          : 'name,email,company,batch,referrals,phone\nPhone Alumni,phone.alumni@example.com,Example Company,2022,0,98765-4321';
      const result = (
        await request(server)
          .post(`/users/${endpoint}`)
          .set(auth(sessions.create(201)))
          .send({ csv, dryRun: true })
          .expect(200)
      ).body;
      expect(result.valid).toBe(false);
      expect(result.imported).toBe(0);
      expect(result.errors[0].messages.join(' ')).toContain('10 digits');
    }
  });

  it('gives approved recruiters password 12345678 and allows only their own password changes', async () => {
    const server = app.getHttpServer();
    const created = (
      await request(server)
        .post('/contact/recruiter')
        .send({
          name: 'Controls Recruiter',
          company: 'Controls Company',
          role: 'Hiring Manager',
          email: 'controls.recruiter@example.com',
          collegeId: 1,
          phone: '9876543210',
        })
        .expect(201)
    ).body;
    const approved = (
      await request(server)
        .patch(`/recruiters/${created.id}/approve`)
        .set(auth(officer))
        .expect(200)
    ).body;
    expect(approved.credentials.password).toBe('12345678');
    const loggedIn = (
      await request(server)
        .post('/users/login')
        .send({ email: approved.credentials.email, password: '12345678' })
        .expect(201)
    ).body;
    const token = loggedIn.accessToken;
    await request(server)
      .post('/users/103/password')
      .set(auth(token))
      .send({ currentPassword: '123', newPassword: 'ChangedPass9' })
      .expect(403);
    await request(server)
      .post(`/users/${loggedIn.id}/password`)
      .set(auth(token))
      .send({ currentPassword: 'wrong-password', newPassword: 'ChangedPass9' })
      .expect(401);
    await request(server)
      .post(`/users/${loggedIn.id}/password`)
      .set(auth(token))
      .send({ currentPassword: '12345678', newPassword: 'ChangedPass9' })
      .expect(201);
    await request(server)
      .post('/users/login')
      .send({ email: loggedIn.email, password: 'ChangedPass9' })
      .expect(201);
    await request(server)
      .post('/users/login')
      .send({ email: loggedIn.email, password: '12345678' })
      .expect(401);
  });

  it('validates edited job fields and converts between internship and full time without stale duration', async () => {
    const server = app.getHttpServer();
    const payload = {
      jobId: 'CONTROLS-JOB-01',
      title: 'Controls Engineer',
      company: 'Google',
      location: 'Chennai',
      deadline: date(20),
      salary: '12 LPA',
      openings: 2,
      cgpa: 7,
      branches: ['CSE'],
      type: 'Full-Time',
    };
    const created = (
      await request(server)
        .post('/opportunities')
        .set(auth(recruiter))
        .send(payload)
        .expect(201)
    ).body;
    const id = created.id;
    for (const invalid of [
      { title: '12345' },
      { location: '12345' },
      { cgpa: 11 },
      { openings: 1.5 },
      { branches: [] },
      { deadline: date(-1) },
      { deadline: date(120) },
      { salary: '999 LPA' },
      { type: 'Internship' },
    ]) {
      await request(server)
        .put(`/opportunities/${id}`)
        .set(auth(recruiter))
        .send(invalid)
        .expect(400);
    }
    const internship = (
      await request(server)
        .put(`/opportunities/${id}`)
        .set(auth(recruiter))
        .send({
          type: 'Internship',
          salary: 'Rs.15000/month',
          duration: '3 Months',
        })
        .expect(200)
    ).body;
    expect(internship).toMatchObject({
      type: 'Internship',
      salary: 'Rs.15000/month',
      duration: '3 Months',
    });
    await request(server)
      .put(`/opportunities/${id}`)
      .set(auth(recruiter))
      .send({ salary: 'Rs.250/month' })
      .expect(400);
    const fullTime = (
      await request(server)
        .put(`/opportunities/${id}`)
        .set(auth(recruiter))
        .send({ type: 'Full-Time', salary: '20 LPA' })
        .expect(200)
    ).body;
    expect(fullTime.duration).toBe('');
    expect(fullTime.salary).toBe('20 LPA');
    await request(server)
      .patch(`/opportunities/${id}/approve`)
      .set(auth(officer))
      .expect(200);
    await request(server)
      .patch(`/opportunities/${id}/publish`)
      .set(auth(officer))
      .expect(200);
    await request(server)
      .put(`/opportunities/${id}`)
      .set(auth(recruiter))
      .send({ type: 'Internship', salary: 'Rs.15000/month' })
      .expect(400);
    await request(server)
      .put(`/opportunities/${id}`)
      .set(auth(recruiter))
      .send({ cgpa: 6 })
      .expect(200);

    const candidateToken = sessions.create(100);
    const application = (
      await request(server)
        .post('/applications')
        .set(auth(candidateToken))
        .send({ opportunityId: id })
        .expect(201)
    ).body;
    await request(server)
      .patch(`/applications/${application.id}/status`)
      .set(auth(recruiter))
      .send({ status: 'Shortlisted' })
      .expect(200);
    const other = (
      await request(server)
        .post('/opportunities')
        .set(auth(recruiter))
        .send({ ...payload, jobId: 'CONTROLS-JOB-02', title: 'Other Engineer' })
        .expect(201)
    ).body;
    const round = {
      opportunityId: other.id,
      applicationIds: [application.id],
      title: 'Technical Round',
      role: 'Engineer',
      date: date(5),
      time: '10:00',
      duration: '60 min',
      candidates: 1,
      platform: 'Meet',
      link: 'https://meet.google.com/test',
      type: 'Interview',
    };
    await request(server)
      .post('/assessments')
      .set(auth(recruiter))
      .send(round)
      .expect(400);
    const scheduled = (
      await request(server)
        .post('/assessments')
        .set(auth(recruiter))
        .send({ ...round, opportunityId: id })
        .expect(201)
    ).body;
    expect(scheduled.opportunityId).toBe(id);
    expect(scheduled.applicationIds).toEqual([application.id]);
  });
});
