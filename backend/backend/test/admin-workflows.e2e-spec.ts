import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthSessionService } from '../src/common/auth/auth-session.service';

describe('College administration and placement review', () => {
  let app: INestApplication;
  let admin: string;
  let otherAdmin: string;
  let officer: string;
  let recruiter: string;
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
    const sessions = app.get(AuthSessionService);
    admin = sessions.create(201);
    otherAdmin = sessions.create(202);
    officer = sessions.create(103);
    recruiter = sessions.create(102);
  }, 30000);

  afterAll(async () => {
    await app?.close();
  });

  it('keeps User Oversight available while allowing only college admin to add students and alumni', async () => {
    const server = app.getHttpServer();
    await request(server)
      .get('/users/oversight')
      .set(auth(officer))
      .expect(200);
    const policy = (
      await request(server)
        .get('/users/oversight-policy')
        .set(auth(admin))
        .expect(200)
    ).body;
    expect(policy.studentEmailDomain).toBe('iiits.in');
    for (const role of ['candidate', 'alumni']) {
      const payload =
        role === 'candidate'
          ? {
              role,
              name: 'Admin Added Student',
              email: 'admin.student@iiits.in',
              rollNumber: 'B26CS941',
              department: 'Computer Science',
              cgpa: 8.3,
              backlogs: 0,
            }
          : {
              role,
              name: 'Admin Added Alumni',
              email: 'admin.alumni@example.com',
              company: 'Example Company',
              batch: '2022',
              referrals: 0,
            };
      await request(server)
        .post('/users')
        .set(auth(officer))
        .send(payload)
        .expect(403);
      const created = (
        await request(server)
          .post('/users')
          .set(auth(admin))
          .send({ ...payload, collegeId: 2 })
          .expect(201)
      ).body;
      expect(created.collegeId).toBe(1);
      const oversight = (
        await request(server)
          .get('/users/oversight')
          .set(auth(officer))
          .expect(200)
      ).body;
      expect(oversight.some((user) => user.id === created.id)).toBe(true);
      const otherCollege = (
        await request(server).get('/users').set(auth(otherAdmin)).expect(200)
      ).body;
      expect(otherCollege.some((user) => user.id === created.id)).toBe(false);
    }
  });

  it('moves both CSV import endpoints to college admin and supports preview before import', async () => {
    const server = app.getHttpServer();
    const studentCsv =
      'name,email,rollNumber,department,cgpa,backlogs\nCSV Added Student,csv.student@iiits.in,B26CS942,Computer Science,8.1,0';
    const alumniCsv =
      'name,email,company,batch,referrals\nCSV Added Alumni,csv.alumni@example.com,Example Company,2022,0';
    for (const [path, csv] of [
      ['import-students', studentCsv],
      ['import-alumni', alumniCsv],
    ]) {
      await request(server)
        .post(`/users/${path}`)
        .set(auth(officer))
        .send({ csv, dryRun: false })
        .expect(403);
      const preview = (
        await request(server)
          .post(`/users/${path}`)
          .set(auth(admin))
          .send({ csv, dryRun: true })
          .expect(200)
      ).body;
      expect(preview).toMatchObject({ valid: true, total: 1, imported: 0 });
      const imported = (
        await request(server)
          .post(`/users/${path}`)
          .set(auth(admin))
          .send({ csv, dryRun: false })
          .expect(200)
      ).body;
      expect(imported.imported).toBe(1);
    }
  });

  it('blocks profile email changes for placement officers and college admins', async () => {
    const server = app.getHttpServer();
    for (const [id, token] of [
      [103, officer],
      [201, admin],
    ] as const) {
      const before = (
        await request(server).get(`/users/${id}`).set(auth(token)).expect(200)
      ).body;
      await request(server)
        .put(`/users/${id}`)
        .set(auth(token))
        .send({ email: 'changed@example.com' })
        .expect(403);
      const after = (
        await request(server).get(`/users/${id}`).set(auth(token)).expect(200)
      ).body;
      expect(after.email).toBe(before.email);
      await request(server)
        .put(`/users/${id}`)
        .set(auth(token))
        .send({ phone: '9876543210' })
        .expect(200);
    }
  });

  it('requires each college domain for candidate, officer, and admin email IDs', async () => {
    const server = app.getHttpServer();
    const superAdmin = app.get(AuthSessionService).create(200);
    const candidate = {
      role: 'candidate', name: 'Domain Test Student', rollNumber: 'B26CS943',
      department: 'Computer Science', cgpa: 8, backlogs: 0,
    };
    await request(server).post('/users').set(auth(admin))
      .send({ ...candidate, email: 'domain.student@gmail.com' }).expect(400);
    await request(server).post('/users').set(auth(admin))
      .send({ ...candidate, email: 'domain.student@vit.in' }).expect(400);
    await request(server).post('/users').set(auth(admin))
      .send({ ...candidate, email: 'domain.student@iiits.in' }).expect(201);

    const officerData = { role: 'placement_officer', name: 'Domain Test Officer' };
    await request(server).post('/users').set(auth(admin))
      .send({ ...officerData, email: 'domain.officer@example.com' }).expect(400);
    const createdOfficer = (await request(server).post('/users').set(auth(admin))
      .send({ ...officerData, email: 'domain.officer@iiits.in' }).expect(201)).body;
    await request(server).put(`/users/${createdOfficer.id}`).set(auth(admin))
      .send({ email: 'domain.officer@vit.in' }).expect(400);

    await request(server).post('/super-admin/colleges/2/admin').set(auth(superAdmin))
      .send({ name: 'Domain Test Admin', email: 'domain.admin@gmail.com' }).expect(400);
    await request(server).put('/super-admin/colleges/2/admin').set(auth(superAdmin))
      .send({ email: 'domain.admin@iiits.in' }).expect(400);
    const updatedAdmin = (await request(server).put('/super-admin/colleges/2/admin').set(auth(superAdmin))
      .send({ email: 'domain.admin@vit.in' }).expect(200)).body;
    expect(updatedAdmin.email).toBe('domain.admin@vit.in');
  });

  it('flags approved edits, shows recruiter-specific opportunities, and scopes officer logs by college', async () => {
    const server = app.getHttpServer();
    const payload = {
      title: 'Approval Review Engineer',
      jobId: 'APPROVAL-TEST-01',
      company: 'Google',
      location: 'Chennai',
      deadline: '2026-12-31',
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
    await request(server)
      .patch(`/opportunities/${id}/approve`)
      .set(auth(officer))
      .expect(200);
    const unchanged = (
      await request(server)
        .put(`/opportunities/${id}`)
        .set(auth(recruiter))
        .send({ title: payload.title })
        .expect(200)
    ).body;
    expect(unchanged.changedAfterApproval).toBe(false);
    const changed = (
      await request(server)
        .put(`/opportunities/${id}`)
        .set(auth(recruiter))
        .send({ location: 'Hyderabad', cgpa: 6 })
        .expect(200)
    ).body;
    expect(changed.status).toBe('approved');
    expect(changed.changedAfterApproval).toBe(true);
    expect(changed.changedAfterApprovalFields).toEqual(
      expect.arrayContaining(['location', 'cgpa']),
    );
    expect(Date.parse(changed.changedAfterApprovalAt)).not.toBeNaN();
    await request(server)
      .put(`/opportunities/${id}`)
      .set(auth(recruiter))
      .send({ cgpa: 8 })
      .expect(400);

    const posted = (
      await request(server)
        .get('/recruiters/1/opportunities')
        .set(auth(officer))
        .expect(200)
    ).body;
    expect(posted.find((job) => job.id === id)).toMatchObject({
      jobId: payload.jobId,
      status: 'approved',
    });
    const directory = (
      await request(server).get('/recruiters').set(auth(officer)).expect(200)
    ).body;
    expect(directory.find((item) => item.id === 1).opps).toBe(posted.length);
    const someoneElse = (
      await request(server)
        .get('/recruiters/2/opportunities')
        .set(auth(officer))
        .expect(200)
    ).body;
    expect(someoneElse.some((job) => job.id === id)).toBe(false);
    await request(server)
      .get('/recruiters/1/opportunities')
      .set(auth(otherAdmin))
      .expect(403);

    await request(server)
      .patch(`/opportunities/${id}/publish`)
      .set(auth(officer))
      .expect(200);
    await request(server)
      .put(`/opportunities/${id}`)
      .set(auth(recruiter))
      .send({ title: 'Forbidden change' })
      .expect(400);
    await request(server)
      .put(`/opportunities/${id}`)
      .set(auth(recruiter))
      .send({ cgpa: 5 })
      .expect(200);
    const logs = (
      await request(server)
        .get('/activity/placement-officers')
        .set(auth(admin))
        .expect(200)
    ).body;
    expect(logs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'Opportunity Approved',
          actor: 'Dr. Rajesh Nair',
          detail: expect.stringContaining(payload.jobId),
        }),
        expect.objectContaining({
          action: 'Opportunity Published',
          actor: 'Dr. Rajesh Nair',
          detail: expect.stringContaining(payload.jobId),
        }),
      ]),
    );
    expect(
      logs.every(
        (log) => log.collegeId === 1 && log.actorRole === 'placement_officer',
      ),
    ).toBe(true);
    const otherLogs = (
      await request(server)
        .get('/activity/placement-officers')
        .set(auth(otherAdmin))
        .expect(200)
    ).body;
    expect(otherLogs.some((log) => log.detail.includes(payload.jobId))).toBe(
      false,
    );
    await request(server)
      .get('/activity/placement-officers')
      .set(auth(recruiter))
      .expect(403);
  });

  it('lets the college admin remove its students, alumni, and recruiters', async () => {
    const server = app.getHttpServer();
    const student = (await request(server).post('/users').set(auth(admin)).send({
      role: 'candidate', name: 'Remove Test Student', email: 'remove.student@iiits.in',
      rollNumber: 'B26CS944', department: 'Computer Science', cgpa: 8, backlogs: 0,
    }).expect(201)).body;
    const alumni = (await request(server).post('/users').set(auth(admin)).send({
      role: 'alumni', name: 'Remove Test Alumni', email: 'remove.alumni@example.com',
      company: 'Example Company', batch: '2022', referrals: 0,
    }).expect(201)).body;
    for (const user of [student, alumni]) {
      await request(server).delete(`/users/${user.id}`).set(auth(otherAdmin)).expect(403);
      await request(server).delete(`/users/${user.id}`).set(auth(officer)).expect(403);
      await request(server).delete(`/users/${user.id}`).set(auth(admin)).expect(200);
      await request(server).get(`/users/${user.id}`).set(auth(admin)).expect(404);
    }

    const recruiterRecord = (await request(server).post('/recruiters').set(auth(officer)).send({
      name: 'Remove Test Recruiter', email: 'remove.recruiter@example.com',
      role: 'Hiring Manager', company: 'Example Company', collegeId: 1,
    }).expect(201)).body;
    const approved = (await request(server).patch(`/recruiters/${recruiterRecord.id}/approve`)
      .set(auth(officer)).expect(200)).body;
    await request(server).delete(`/recruiters/${recruiterRecord.id}`).set(auth(otherAdmin)).expect(403);
    await request(server).delete(`/recruiters/${recruiterRecord.id}`).set(auth(admin)).expect(200);
    await request(server).get(`/recruiters/${recruiterRecord.id}`).set(auth(officer)).expect(404);
    await request(server).get(`/users/${approved.recruiter.userId}`).set(auth(admin)).expect(404);
    await request(server).post('/users/login').send({
      email: 'remove.recruiter@example.com', password: '12345678',
    }).expect(401);
  });

  it('does not invent a location for Contact Us recruiter requests', async () => {
    const server = app.getHttpServer();
    const created = (await request(server).post('/contact/recruiter').send({
      name: 'Contact Location Test', email: 'contact.location@example.com',
      company: 'Example Company', role: 'Hiring Manager', collegeId: 1,
      location: 'Injected City',
    }).expect(201)).body;
    const recruiter = (await request(server).get(`/recruiters/${created.id}`)
      .set(auth(officer)).expect(200)).body;
    expect(recruiter.source).toBe('contact-form');
    expect(recruiter.location).toBeUndefined();
  });
});
