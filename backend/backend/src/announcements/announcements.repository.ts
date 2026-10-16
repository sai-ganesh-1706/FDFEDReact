import { Injectable } from '@nestjs/common';

export interface Announcement {
  id: number;
  collegeId: number;
  type: 'general' | 'urgent' | 'placement' | 'event';
  title: string;
  message: string;
  postedAt: string;
  author: string;
}

@Injectable()
export class AnnouncementsRepository {
  private announcements: Announcement[] = [
    { id: 1, collegeId: 1, type: 'placement', title: 'TCS Recruitment Drive', message: 'TCS will be conducting a recruitment drive on 20th October. All eligible students (CGPA ≥ 7.0, no active backlogs) must register by 15th October.', postedAt: '2026-10-08T10:00:00.000Z', author: 'Dr. Ganesh Kumar' },
    { id: 2, collegeId: 1, type: 'urgent', title: 'Resume Submission Deadline', message: 'All students must submit their updated resumes to the placement portal by 12th October. No extensions will be granted.', postedAt: '2026-10-09T09:00:00.000Z', author: 'Dr. Ganesh Kumar' },
    { id: 3, collegeId: 1, type: 'general', title: 'Pre-Placement Talk — Infosys', message: 'Infosys will conduct a pre-placement talk on 14th October at 2 PM in the Main Auditorium. Attendance is mandatory for all final-year students.', postedAt: '2026-10-10T08:30:00.000Z', author: 'Dr. Ganesh Kumar' },
    { id: 4, collegeId: 2, type: 'event', title: 'Career Fair 2026', message: 'VIT Career Fair will be held on 25th October. Over 30 companies are expected to participate. Register on the placement portal.', postedAt: '2026-10-07T11:00:00.000Z', author: 'Dr. Priya Menon' },
    { id: 5, collegeId: 3, type: 'general', title: 'Placement Season Opens', message: 'The placement season 2026-27 officially begins. All final year students should complete their profiles on the placement portal immediately.', postedAt: '2026-10-06T09:00:00.000Z', author: 'Dr. Ramesh Sharma' },
  ];
  private nextId = 6;

  findByCollege(collegeId: number): Announcement[] {
    return this.announcements
      .filter(a => a.collegeId === collegeId)
      .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
  }

  create(data: Omit<Announcement, 'id' | 'postedAt'>): Announcement {
    const ann: Announcement = { id: this.nextId++, ...data, postedAt: new Date().toISOString() };
    this.announcements.push(ann);
    return ann;
  }

  delete(id: number, collegeId: number): boolean {
    const idx = this.announcements.findIndex(a => a.id === id && a.collegeId === collegeId);
    if (idx === -1) return false;
    this.announcements.splice(idx, 1);
    return true;
  }
}
