import { Injectable } from '@nestjs/common';

export interface Recruiter {
  id: number;
  name: string;
  company: string;
  role: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  status: string;
  opps: number;
  joined: string;
  avatar?: string;
  collegeId?: number;
  message?: string;
  source?: 'contact-form' | 'manual';
  userId?: number;
  declineRemark?: string;
  submittedAt?: string;
  decidedAt?: string;
}

@Injectable()
export class RecruitersRepository {
  constructor() {
    this.recruiters.forEach((r) => { r.collegeId ??= 1; r.source ??= 'manual'; });
  }

  private recruiters: Recruiter[] = [
    { id: 1, name: 'Priya Kapoor', company: 'TechCorp Solutions', role: 'HR Manager', opps: 1, status: 'active', email: 'priya.kapoor@techcorp.com', phone: '+91 98765 43210', location: 'Mumbai, Maharashtra', joined: 'January 15, 2024', bio: 'Experienced HR professional with over 8 years in talent acquisition. Passionate about connecting top tech talent with innovative companies.', avatar: 'PK' },
    { id: 2, name: 'Raj Kumar', company: 'AI Dynamics', role: 'Hiring Lead', opps: 1, status: 'active', email: 'raj.kumar@aidynamics.com', phone: '+91 87654 32109', location: 'Bangalore, Karnataka', joined: 'March 22, 2024', bio: 'Leading hiring efforts at AI Dynamics. Focused on building world-class AI and ML engineering teams across India.', avatar: 'RK' },
    { id: 3, name: 'Amit Joshi', company: 'Analytics Hub', role: 'HR Manager', opps: 1, status: 'active', email: 'amit.joshi@analyticshub.com', phone: '+91 76543 21098', location: 'Pune, Maharashtra', joined: 'June 10, 2023', bio: 'HR manager specializing in data analytics and business intelligence roles.', avatar: 'AJ' },
    { id: 4, name: 'Sara Thomas', company: 'CloudBase Inc', role: 'Recruiter', opps: 1, status: 'active', email: 'sara.thomas@cloudbase.io', phone: '+91 65432 10987', location: 'Hyderabad, Telangana', joined: 'September 5, 2023', bio: 'Cloud infrastructure recruiter with expertise in DevOps, SRE, and cloud engineering roles.', avatar: 'ST' },
    { id: 5, name: 'Kiran Rao', company: 'StartupX', role: 'Founder & CEO', opps: 1, status: 'pending', email: 'kiran.rao@startupx.in', phone: '+91 54321 09876', location: 'Delhi NCR', joined: 'December 1, 2024', bio: 'Founder & CEO of StartupX, an early-stage fintech startup. Looking for versatile product engineers.', avatar: 'KR' },
    { id: 6, name: 'Vikash Singh', company: 'SecureNet', role: 'Recruiter', opps: 1, status: 'pending', email: 'vikash.singh@securenet.com', phone: '+91 43210 98765', location: 'Chennai, Tamil Nadu', joined: 'November 18, 2024', bio: 'Cybersecurity recruiter at SecureNet. Specializes in hiring for security operations and ethical hacking roles.', avatar: 'VS' },
    { id: 7, name: 'Arjun Mehta', company: 'FinTech Pro', role: 'Talent Manager', opps: 1, status: 'pending', email: 'arjun.mehta@fintechpro.com', phone: '+91 32109 87654', location: 'Mumbai, Maharashtra', joined: 'October 28, 2024', bio: 'Talent acquisition manager at FinTech Pro. Passionate about scaling fintech teams.', avatar: 'AM' },
    { id: 8, name: 'Meera Reddy', company: 'EduTech Solutions', role: 'HR Lead', opps: 1, status: 'active', email: 'meera.reddy@edutechsol.com', phone: '+91 21098 76543', location: 'Bangalore, Karnataka', joined: 'February 20, 2023', bio: 'HR lead at EduTech Solutions with a focus on hiring instructional designers and ed-tech engineers.', avatar: 'MR' },
    { id: 9, name: 'Priya Kapoor', company: 'Google', role: 'University Relations Lead', opps: 3, status: 'active', email: 'r@gmail.com', phone: '+91 98001 55555', location: 'Hyderabad, Telangana', joined: 'July 10, 2023', bio: 'University Relations Lead at Google India. Driving campus partnerships and engineering talent recruitment from top institutions across India.', avatar: 'PK' },
  ];

  private nextId = 10;

  findAll(): Recruiter[] {
    return this.recruiters;
  }

  findById(id: number): Recruiter | undefined {
    return this.recruiters.find((r) => r.id === id);
  }

  findByStatus(status: string): Recruiter[] {
    return this.recruiters.filter((r) => r.status === status);
  }

  create(data: Omit<Recruiter, 'id'>): Recruiter {
    const recruiter: Recruiter = { id: this.nextId++, ...data };
    this.recruiters.push(recruiter);
    return recruiter;
  }

  update(id: number, data: Partial<Recruiter>): Recruiter | undefined {
    const idx = this.recruiters.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.recruiters[idx] = { ...this.recruiters[idx], ...data };
    return this.recruiters[idx];
  }

  remove(id: number): boolean {
    const idx = this.recruiters.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.recruiters.splice(idx, 1);
    return true;
  }

  getStats(): Record<string, number> {
    return {
      total: this.recruiters.length,
      active: this.recruiters.filter((r) => r.status === 'active').length,
      pending: this.recruiters.filter((r) => r.status === 'pending').length,
      declined: this.recruiters.filter((r) => r.status === 'declined').length,
    };
  }
}
