import { Injectable } from '@nestjs/common';

export interface Opportunity {
  id: number;
  title: string;
  company: string;
  location: string;
  deadline: string;
  applications: number;
  salary: string;
  openings: number;
  cgpa: number;
  branches: string[];
  type: string;
  status: string;
  tags?: string[];
  description?: string;
  rounds?: string;
  backlogs?: string;
  submittedBy?: string;
  recruiterId?: number;
  collegeId?: number;
  createdAt?: string;
  rejectionRemark?: string;
  avatar?: string;
  avatarBg?: string;
}

@Injectable()
export class OpportunitiesRepository {
  constructor() {
    // Seed opportunities all belong to the demo college.
    this.opportunities.forEach((o, index) => {
      o.collegeId ??= 1;
      // Older seed entries predate the timestamp field. Give them a stable
      // chronological order so dashboard lists behave like newly-created data.
      if (!o.createdAt) {
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - (this.opportunities.length - index));
        o.createdAt = createdAt.toISOString();
      }
    });
  }

  private opportunities: Opportunity[] = [
    { id: 1, title: 'Software Engineer', company: 'TechCorp Solutions', location: 'Bangalore, Karnataka', deadline: '2026-03-25', applications: 78, salary: '12 LPA', openings: 15, cgpa: 7.5, branches: ['CSE', 'ECE', 'IT'], type: 'Full-Time', status: 'Published', tags: ['JavaScript', 'Node.js', 'AWS', 'SQL', 'React'], description: 'Join our dynamic engineering team to build scalable cloud-native applications.', rounds: 'Resume Screening → Online Assessment → Technical → HR', backlogs: 'Not allowed', avatar: 'T', avatarBg: '#7C3AED', submittedBy: 'Priya Kapoor' },
    { id: 2, title: 'Data Analyst Intern', company: 'Analytics Hub', location: 'Hyderabad', deadline: '2026-03-25', applications: 155, salary: '25,000/month', openings: 30, cgpa: 7.5, branches: ['CSE', 'ECE', 'IT'], type: 'Internship', status: 'Published', tags: ['Python', 'SQL', 'Power BI'], description: 'Work closely with our data science team to analyze large datasets.', rounds: 'Resume Screening → Technical Test → Interview', backlogs: 'Allowed', avatar: 'I', avatarBg: '#4f46e5', submittedBy: 'Amit Joshi' },
    { id: 3, title: 'Full Stack Developer', company: 'InnovateTech', location: 'Pune, Maharashtra', deadline: '2026-04-15', applications: 230, salary: '10 LPA', openings: 10, cgpa: 8.0, branches: ['CSE'], type: 'Full-Time', status: 'Published', tags: ['React', 'Node.js'], description: 'End-to-end responsibility for the web platform.', rounds: 'Portfolio Review → Coding Challenge → Technical Interview', backlogs: 'Not allowed', avatar: 'S', avatarBg: '#7c3aed', submittedBy: 'Priya Kapoor' },
    { id: 4, title: 'Machine Learning Engineer', company: 'AI Dynamics', location: 'Chennai, Tamil Nadu', deadline: '2026-05-01', applications: 45, salary: '15 LPA', openings: 2, cgpa: 8.5, branches: ['CSE', 'ECE'], type: 'Full-Time', status: 'pending', tags: ['Python', 'TensorFlow'], description: 'Design and deploy scalable machine learning models.', rounds: 'Resume → Coding → ML Assessment → Technical → HR', backlogs: 'Not allowed', avatar: 'A', avatarBg: '#f59e0b', submittedBy: 'Raj Kumar' },
    { id: 5, title: 'DevOps Intern', company: 'CloudBase Inc', location: 'Remote', deadline: '2026-05-20', applications: 120, salary: '₹20,000/month', openings: 4, cgpa: 9.0, branches: ['CSE', 'IT'], type: 'Internship', status: 'Published', tags: ['Linux', 'Docker'], description: 'Automate delivery pipelines.', rounds: 'Resume → Technical Assessment → System Design → HR', backlogs: 'Not allowed', avatar: 'C', avatarBg: '#ec4899', submittedBy: 'Sara Thomas' },
    { id: 6, title: 'UI/UX Designer', company: 'Creative Studios', location: 'Mumbai', deadline: '2026-06-15', applications: 85, salary: '8 LPA', openings: 5, cgpa: 7.0, branches: ['CSE', 'IT', 'Design'], type: 'Full-Time', status: 'Published', tags: ['Figma', 'Adobe XD', 'Prototyping'], description: 'Design intuitive interfaces for our consumer-facing applications.', rounds: 'Portfolio Review → Design Challenge → Interview', backlogs: 'Allowed', submittedBy: 'Priya Kapoor' },
    { id: 7, title: 'Cybersecurity Analyst Intern', company: 'SecureNet', location: 'Bangalore', deadline: '2026-05-10', applications: 60, salary: '₹30,000/month', openings: 8, cgpa: 8.0, branches: ['CSE', 'IT'], type: 'Internship', status: 'Published', tags: ['Network Security', 'Pen Testing', 'Python'], description: 'Perform vulnerability assessments and penetrate testing.', rounds: 'Resume → Technical → HR', backlogs: 'Not allowed', submittedBy: 'Vikash Singh' },
    { id: 8, title: 'Frontend Developer', company: 'WebFlow Media', location: 'Remote', deadline: '2026-04-30', applications: 310, salary: '14 LPA', openings: 6, cgpa: 7.5, branches: ['CSE', 'ECE', 'IT'], type: 'Full-Time', status: 'Published', tags: ['React', 'TypeScript', 'Tailwind CSS'], description: 'Build robust and scalable frontend architectures.', rounds: 'Portfolio Review → Coding Challenge → HR', backlogs: 'Not allowed', submittedBy: 'Priya Kapoor' },
    { id: 9, title: 'Backend Engineer', company: 'FinTech Corp', location: 'Gurgaon', deadline: '2026-05-25', applications: 145, salary: '18 LPA', openings: 4, cgpa: 8.2, branches: ['CSE', 'IT'], type: 'Full-Time', status: 'Published', tags: ['Java', 'Spring Boot', 'Microservices'], description: 'Develop scalable microservices for financial transactions.', rounds: 'Resume → Technical → System Design → HR', backlogs: 'Not allowed', submittedBy: 'Arjun Mehta' },
    { id: 10, title: 'Product Management Intern', company: 'Growth Hackers', location: 'Remote', deadline: '2026-06-05', applications: 210, salary: '₹25,000/month', openings: 3, cgpa: 7.0, branches: ['Any'], type: 'Internship', status: 'rejected', tags: ['Agile', 'Jira', 'Market Research'], description: 'Assist product managers in writing PRDs.', rounds: 'Case Study → Group Discussion → HR Interview', backlogs: 'Allowed', rejectionRemark: 'Company does not meet our placement partner criteria.', avatar: 'M', avatarBg: '#ef4444', submittedBy: 'Priya Kapoor' },
    { id: 11, title: 'Cloud Architect', company: 'Skyline Cloud', location: 'Hyderabad', deadline: '2026-07-01', applications: 40, salary: '22 LPA', openings: 2, cgpa: 8.5, branches: ['CSE'], type: 'Full-Time', status: 'Published', tags: ['AWS', 'Azure', 'Kubernetes'], description: 'Design and implement enterprise cloud strategies.', rounds: 'Resume → Technical → Architecture Review → HR', backlogs: 'Not allowed', submittedBy: 'Raj Kumar' },
    { id: 12, title: 'Data Scientist', company: 'DataMinds', location: 'Pune', deadline: '2026-05-15', applications: 110, salary: '16 LPA', openings: 5, cgpa: 8.0, branches: ['CSE', 'Stats'], type: 'Full-Time', status: 'Published', tags: ['Python', 'R', 'Machine Learning'], description: 'Build predictive models and recommendation engines.', rounds: 'Resume → Coding → Data Challenge → Interview', backlogs: 'Not allowed', submittedBy: 'Amit Joshi' },
    { id: 13, title: 'Hardware Engineering Intern', company: 'Silicon Devices', location: 'Bangalore', deadline: '2026-04-20', applications: 75, salary: '₹35,000/month', openings: 10, cgpa: 8.0, branches: ['ECE', 'EEE'], type: 'Internship', status: 'Published', tags: ['Verilog', 'VHDL', 'Embedded Systems'], description: 'Assist in designing and verifying digital logic circuits.', rounds: 'Resume → Technical → HR', backlogs: 'Not allowed', submittedBy: 'Raj Kumar' },
    { id: 14, title: 'HR Trainee', company: 'PeopleFirst', location: 'Mumbai', deadline: '2026-05-10', applications: 320, salary: '6 LPA', openings: 20, cgpa: 6.5, branches: ['Any'], type: 'Full-Time', status: 'Published', tags: ['Recruitment', 'Communication'], description: 'Support HR generalist activities and campus placement drives.', rounds: 'Resume → Group Discussion → HR', backlogs: 'Allowed', submittedBy: 'Priya Kapoor' },
    { id: 15, title: 'Game Developer Intern', company: 'Pixel Play', location: 'Remote', deadline: '2026-06-30', applications: 180, salary: '₹15,000/month', openings: 5, cgpa: 7.5, branches: ['CSE', 'IT'], type: 'Internship', status: 'Published', tags: ['Unity', 'C#', '3D Modeling'], description: 'Develop interactive 2D and 3D gameplay features.', rounds: 'Portfolio → Coding Challenge → Interview', backlogs: 'Not allowed', submittedBy: 'Priya Kapoor' },
    // ── Google opportunities — posted by Priya Kapoor (r@gmail.com) ─────────────
    { id: 16, title: 'Software Engineer', company: 'Google', location: 'Hyderabad, Telangana', deadline: '2026-07-31', applications: 5, salary: '32 LPA', openings: 8, cgpa: 8.0, branches: ['CSE', 'ECE', 'IT'], type: 'Full-Time', status: 'Published', tags: ['Algorithms', 'Python', 'Distributed Systems', 'Go', 'C++'], description: 'Join Google\'s core engineering team. Work on large-scale distributed systems that serve billions of users worldwide. Strong fundamentals in algorithms and data structures required.', rounds: 'Online Assessment → Phone Screen → 4 Technical Rounds → HR', backlogs: 'Not allowed', avatar: 'G', avatarBg: '#4285F4', submittedBy: 'Priya Kapoor', recruiterId: 102 },
    { id: 17, title: 'Site Reliability Engineer', company: 'Google', location: 'Bangalore, Karnataka', deadline: '2026-08-15', applications: 1, salary: '34 LPA', openings: 5, cgpa: 8.2, branches: ['CSE', 'IT'], type: 'Full-Time', status: 'Published', tags: ['Linux', 'Kubernetes', 'Python', 'Go', 'SRE'], description: 'Ensure Google\'s production services remain reliable, scalable, and efficient. You will bridge development and operations, driving improvements in reliability engineering.', rounds: 'Online Assessment → System Design → Technical → HR', backlogs: 'Not allowed', avatar: 'G', avatarBg: '#34A853', submittedBy: 'Priya Kapoor', recruiterId: 102 },
    { id: 18, title: 'STEP Intern (Engineering)', company: 'Google', location: 'Hyderabad, Telangana', deadline: '2026-07-01', applications: 0, salary: '₹80,000/month', openings: 12, cgpa: 7.5, branches: ['CSE', 'ECE', 'IT', 'EEE'], type: 'Internship', status: 'Published', tags: ['Problem Solving', 'Python', 'Data Structures', 'Algorithms'], description: 'The Student Training in Engineering Program (STEP) is a developmental opportunity for first and second-year undergraduate students with a passion for technology.', rounds: 'Online Assessment → Technical Interview → HR', backlogs: 'Not allowed', avatar: 'G', avatarBg: '#FBBC04', submittedBy: 'Priya Kapoor', recruiterId: 102 },
    { id: 19, title: 'Cloud Support Engineer', company: 'Google', location: 'Hyderabad, Telangana', deadline: '2026-12-20', applications: 0, salary: '24 LPA', openings: 6, cgpa: 7.5, branches: ['CSE', 'IT', 'ECE'], type: 'Full-Time', status: 'pending', tags: ['Linux', 'Networking', 'GCP', 'Troubleshooting'], description: 'Help enterprise customers design, deploy and debug workloads on Google Cloud. You will work directly with customer engineering teams and the product organisation.', rounds: 'Online Assessment → Technical Interview → Googleyness → HR', backlogs: 'Not allowed', avatar: 'G', avatarBg: '#EA4335', submittedBy: 'Priya Kapoor', recruiterId: 102 },
  ];

  private nextId = 20;

  findAll(): Opportunity[] {
    return this.opportunities;
  }

  findPublished(): Opportunity[] {
    return this.opportunities.filter((o) => o.status === 'Published');
  }

  findById(id: number): Opportunity | undefined {
    return this.opportunities.find((o) => o.id === id);
  }

  create(data: Omit<Opportunity, 'id'>): Opportunity {
    const opp: Opportunity = { ...data, id: this.nextId++, applications: data.applications ?? 0, createdAt: new Date().toISOString() };
    this.opportunities.push(opp);
    return opp;
  }

  update(id: number, data: Partial<Opportunity>): Opportunity | undefined {
    const idx = this.opportunities.findIndex((o) => o.id === id);
    if (idx === -1) return undefined;
    this.opportunities[idx] = { ...this.opportunities[idx], ...data };
    return this.opportunities[idx];
  }

  remove(id: number): boolean {
    const idx = this.opportunities.findIndex((o) => o.id === id);
    if (idx === -1) return false;
    this.opportunities.splice(idx, 1);
    return true;
  }
}
