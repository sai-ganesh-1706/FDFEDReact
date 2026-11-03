import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthSessionService } from '../src/common/auth/auth-session.service';

describe('Actor page data workflows', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  }, 30000);
  afterAll(async () => {
    await app?.close();
  });

  it.each([
    [
      'super admin',
      200,
      [
        '/super-admin/colleges',
        '/super-admin/stats',
        '/super-admin/activity',
        '/users',
      ],
    ],
    [
      'college admin',
      201,
      [
        '/colleges/1',
        '/users',
        '/users/oversight-policy',
        '/users/oversight',
        '/applications',
        '/announcements',
        '/super-admin/inbox',
        '/activity/placement-officers',
      ],
    ],
    [
      'placement officer',
      103,
      [
        '/opportunities',
        '/users/oversight',
        '/users/oversight-policy',
        '/recruiters',
        '/assessments',
        '/features/officer/placement-dashboard',
        '/features/officer/dept-report',
        '/features/officer/candidates/filter',
        '/referrals',
        '/notifications',
      ],
    ],
    [
      'recruiter',
      102,
      [
        '/users/102',
        '/opportunities',
        '/applications',
        '/assessments',
        '/notifications',
        '/features/recruiter/reports',
        '/features/recruiter/interviews',
      ],
    ],
    [
      'candidate',
      100,
      [
        '/users/100',
        '/opportunities',
        '/applications/my',
        '/assessments/my',
        '/referrals/my',
        '/notifications',
        '/announcements',
        '/features/candidate/saved-drive-ids',
        '/users/alumni-directory',
      ],
    ],
    [
      'alumni',
      101,
      [
        '/users/101',
        '/referrals',
        '/referrals/stats',
        '/notifications',
        '/features/alumni/mentorship/received',
        '/features/alumni/events',
        '/features/alumni/directory',
        '/features/alumni/mentees',
        '/features/alumni/engagement-history',
      ],
    ],
  ] as [string, number, string[]][])(
    '%s pages load their API data without server errors',
    async (_role, id, paths) => {
      const token = app.get(AuthSessionService).create(id);
      for (const path of paths) {
        const response = await request(app.getHttpServer())
          .get(path)
          .set('Authorization', `Bearer ${token}`);
        expect({ path, status: response.status }).toEqual({
          path,
          status: 200,
        });
        expect(response.body).toBeDefined();
      }
    },
  );
});
