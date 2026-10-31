import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  oversightVisible?: boolean;
  collegeId?: number | null;
  password?: string;          // default '123' for newly created users
  department?: string;
  cgpa?: number;
  rollNumber?: string;
  backlogs?: number;
  company?: string;
  batch?: string;
  batchLabel?: string;
  headline?: string;
  location?: string;
  university?: string;
  phone?: string;
  about?: string;
  avatar?: string;
  avatarColor?: string;
  status?: string;
  referrals?: number;
  skills?: string[];
  socialLinks?: { github?: string; linkedin?: string; portfolio?: string };
  resumeData?: Record<string, any>;
}


@Injectable()
export class UsersRepository {
  /** Set on construction so request guards can check account status without extra DI wiring. */
  static current: UsersRepository | null = null;
  constructor() {
    UsersRepository.current = this;
    // Legacy fixtures support historical workflows. The small JSON demo set
    // and new runtime accounts populate the current User Oversight directory.
    this.users.filter((u) => ['candidate', 'alumni'].includes(u.role)).forEach((u) => { u.oversightVisible = false; });
    const demos: User[] = JSON.parse(readFileSync(join(process.cwd(), 'data', 'users.demo.json'), 'utf8'));
    for (const demo of demos) {
      const existing = this.findByEmail(demo.email);
      if (existing) this.update(existing.id, { ...demo, id: existing.id, oversightVisible: true });
      else this.users.push({ ...demo, oversightVisible: true });
    }
    this.nextId = Math.max(this.nextId, ...this.users.map((u) => u.id + 1));
  }

  private users: User[] = [
    {
      id: 1,
      name: 'Shameer Basha Shaik',
      email: 'shameer@college.in',
      role: 'candidate',
      collegeId: 1,
      department: 'Computer Science',
      cgpa: 8.7,
      rollNumber: 'B22CS001',
      backlogs: 0,
      status: 'active',
      batchLabel: 'Placement Season 2025–26',
      headline: 'Computer Science Student | Aspiring Software Engineer',
      location: 'Bangalore, India',
      university: 'CareerNest University',
      phone: '+91 9876543210',
      about: 'I am a passionate computer science student with a strong foundation in data structures, algorithms, and web development.',
      avatar: 'SB',
      referrals: 0,
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL'],
      socialLinks: {
        github: 'https://github.com/shameerbasha',
        linkedin: 'https://linkedin.com/in/shameerbasha',
        portfolio: 'https://shameerbasha.dev',
      },
    },
    { id: 2, name: 'Aarav Sharma', email: 'aarav.sharma@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS012', department: 'Computer Science', cgpa: 8.5, backlogs: 0, status: 'active', avatar: 'AS' },
    { id: 3, name: 'Isha Gupta', email: 'isha.gupta@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EC045', department: 'Electronics', cgpa: 9.1, backlogs: 0, status: 'active', avatar: 'IG' },
    { id: 4, name: 'Rohan Verma', email: 'rohan.verma@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22ME089', department: 'Mechanical', cgpa: 6.8, backlogs: 1, status: 'active', avatar: 'RV' },
    { id: 5, name: 'Sneha Patil', email: 'sneha.patil@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS102', department: 'Computer Science', cgpa: 7.2, backlogs: 0, status: 'active', avatar: 'SP' },
    { id: 6, name: 'Vikram Singh', email: 'vikram.singh@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22IT033', department: 'IT', cgpa: 5.9, backlogs: 3, status: 'inactive', avatar: 'VS' },
    // ── Batch 2022 Candidates ─────────────────────────────────────────────────
    { id: 10, name: 'Arjun Kumar', email: 'arjun.kumar@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS020', department: 'Computer Science', cgpa: 8.9, backlogs: 0, status: 'active', avatar: 'AK' },
    { id: 11, name: 'Deepika Nair', email: 'deepika.nair@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS031', department: 'Computer Science', cgpa: 8.2, backlogs: 0, status: 'active', avatar: 'DN' },
    { id: 12, name: 'Farhan Ahmed', email: 'farhan.ahmed@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS015', department: 'Computer Science', cgpa: 7.8, backlogs: 0, status: 'active', avatar: 'FA' },
    { id: 13, name: 'Gita Rao', email: 'gita.rao@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS027', department: 'Computer Science', cgpa: 9.3, backlogs: 0, status: 'active', avatar: 'GR' },
    { id: 14, name: 'Harsh Verma', email: 'harsh.verma@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS008', department: 'Computer Science', cgpa: 8.5, backlogs: 0, status: 'active', avatar: 'HV' },
    { id: 15, name: 'Indira Pillai', email: 'indira.pillai@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS042', department: 'Computer Science', cgpa: 8.0, backlogs: 0, status: 'active', avatar: 'IP' },
    { id: 16, name: 'Jatin Malhotra', email: 'jatin.malhotra@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS033', department: 'Computer Science', cgpa: 7.5, backlogs: 1, status: 'active', avatar: 'JM' },
    { id: 17, name: 'Komal Shah', email: 'komal.shah@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS019', department: 'Computer Science', cgpa: 8.7, backlogs: 0, status: 'active', avatar: 'KS' },
    { id: 18, name: 'Lokesh Gupta', email: 'lokesh.gupta@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS055', department: 'Computer Science', cgpa: 7.2, backlogs: 2, status: 'active', avatar: 'LG' },
    { id: 19, name: 'Meera Joshi', email: 'meera.joshi@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS047', department: 'Computer Science', cgpa: 9.0, backlogs: 0, status: 'active', avatar: 'MJ' },
    { id: 20, name: 'Naman Agarwal', email: 'naman.agarwal@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS062', department: 'Computer Science', cgpa: 8.3, backlogs: 0, status: 'active', avatar: 'NA' },
    { id: 21, name: 'Preethi Krishnan', email: 'preethi.krishnan@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS083', department: 'Computer Science', cgpa: 9.1, backlogs: 0, status: 'active', avatar: 'PK2' },
    { id: 22, name: 'Rohit Tripathi', email: 'rohit.tripathi@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS094', department: 'Computer Science', cgpa: 8.4, backlogs: 0, status: 'active', avatar: 'RT' },
    { id: 23, name: 'Shruti Kapur', email: 'shruti.kapur@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS106', department: 'Computer Science', cgpa: 8.8, backlogs: 0, status: 'active', avatar: 'SK2' },
    { id: 24, name: 'Tarun Bhat', email: 'tarun.bhat@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS117', department: 'Computer Science', cgpa: 7.6, backlogs: 1, status: 'active', avatar: 'TB' },
    { id: 25, name: 'Usha Menon', email: 'usha.menon@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS128', department: 'Computer Science', cgpa: 8.1, backlogs: 0, status: 'active', avatar: 'UM' },
    { id: 26, name: 'Vijay Sinha', email: 'vijay.sinha@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS139', department: 'Computer Science', cgpa: 7.7, backlogs: 0, status: 'active', avatar: 'VS3' },
    { id: 27, name: 'Wasim Khan', email: 'wasim.khan@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS150', department: 'Computer Science', cgpa: 8.2, backlogs: 0, status: 'active', avatar: 'WK' },
    { id: 28, name: 'Xena Roy', email: 'xena.roy@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS161', department: 'Computer Science', cgpa: 9.2, backlogs: 0, status: 'active', avatar: 'XR' },
    { id: 29, name: 'Yash Pandey', email: 'yash.pandey@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS172', department: 'Computer Science', cgpa: 8.6, backlogs: 0, status: 'active', avatar: 'YP2' },
    { id: 30, name: 'Zoya Ansari', email: 'zoya.ansari@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CS183', department: 'Computer Science', cgpa: 7.9, backlogs: 0, status: 'active', avatar: 'ZA' },
    // ECE
    { id: 31, name: 'Nikhil Reddy', email: 'nikhil.reddy@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EC012', department: 'Electronics', cgpa: 8.4, backlogs: 0, status: 'active', avatar: 'NR2' },
    { id: 32, name: 'Pooja Sharma', email: 'pooja.sharma@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EC034', department: 'Electronics', cgpa: 8.6, backlogs: 0, status: 'active', avatar: 'PS2' },
    { id: 33, name: 'Ravi Krishnan', email: 'ravi.krishnan@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EC056', department: 'Electronics', cgpa: 8.1, backlogs: 0, status: 'active', avatar: 'RK' },
    { id: 34, name: 'Sana Mirza', email: 'sana.mirza@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EC007', department: 'Electronics', cgpa: 8.8, backlogs: 0, status: 'active', avatar: 'SM2' },
    { id: 35, name: 'Tarun Mishra', email: 'tarun.mishra@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EC018', department: 'Electronics', cgpa: 7.5, backlogs: 1, status: 'active', avatar: 'TM' },
    { id: 36, name: 'Uma Devi', email: 'uma.devi@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EC029', department: 'Electronics', cgpa: 8.3, backlogs: 0, status: 'active', avatar: 'UD' },
    { id: 37, name: 'Vikram Rao', email: 'vikram.rao@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EC040', department: 'Electronics', cgpa: 7.8, backlogs: 0, status: 'active', avatar: 'VR' },
    { id: 38, name: 'Waqar Ali', email: 'waqar.ali@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EC051', department: 'Electronics', cgpa: 8.0, backlogs: 1, status: 'active', avatar: 'WA' },
    { id: 39, name: 'Yogesh Patil', email: 'yogesh.patil@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EC062', department: 'Electronics', cgpa: 8.5, backlogs: 0, status: 'active', avatar: 'YP3' },
    { id: 40, name: 'Abhilash Nair', email: 'abhilash.nair@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EC073', department: 'Electronics', cgpa: 8.7, backlogs: 0, status: 'active', avatar: 'AN' },
    { id: 41, name: 'Bhumika Jain', email: 'bhumika.jain@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EC084', department: 'Electronics', cgpa: 8.2, backlogs: 0, status: 'active', avatar: 'BJ' },
    { id: 42, name: 'Chetan Sharma', email: 'chetan.sharma@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EC095', department: 'Electronics', cgpa: 7.6, backlogs: 1, status: 'active', avatar: 'CS2' },
    { id: 43, name: 'Dhruv Kapoor', email: 'dhruv.kapoor@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EC106', department: 'Electronics', cgpa: 8.9, backlogs: 0, status: 'active', avatar: 'DK' },
    { id: 44, name: 'Elina Roy', email: 'elina.roy@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EC117', department: 'Electronics', cgpa: 8.4, backlogs: 0, status: 'active', avatar: 'ER' },
    { id: 45, name: 'Faisal Khan', email: 'faisal.khan@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EC128', department: 'Electronics', cgpa: 7.7, backlogs: 0, status: 'active', avatar: 'FK' },
    // IT
    { id: 46, name: 'Yash Bansal', email: 'yash.bansal@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22IT014', department: 'IT', cgpa: 8.5, backlogs: 0, status: 'active', avatar: 'YB' },
    { id: 47, name: 'Ankit Dixit', email: 'ankit.dixit@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22IT036', department: 'IT', cgpa: 7.6, backlogs: 0, status: 'active', avatar: 'AD' },
    { id: 48, name: 'Bhavna Singh', email: 'bhavna.singh@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22IT047', department: 'IT', cgpa: 8.2, backlogs: 0, status: 'active', avatar: 'BS' },
    { id: 49, name: 'Chirag Mehta', email: 'chirag.mehta@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22IT008', department: 'IT', cgpa: 8.7, backlogs: 0, status: 'active', avatar: 'CM' },
    { id: 50, name: 'Divya Rao', email: 'divya.rao@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22IT019', department: 'IT', cgpa: 8.0, backlogs: 0, status: 'active', avatar: 'DR' },
    { id: 51, name: 'Esha Goyal', email: 'esha.goyal@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22IT030', department: 'IT', cgpa: 7.8, backlogs: 1, status: 'active', avatar: 'EG' },
    { id: 52, name: 'Farida Khan', email: 'farida.khan@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22IT041', department: 'IT', cgpa: 8.4, backlogs: 0, status: 'active', avatar: 'FK2' },
    { id: 53, name: 'Gaurav Tiwari', email: 'gaurav.tiwari@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22IT052', department: 'IT', cgpa: 8.1, backlogs: 0, status: 'active', avatar: 'GT' },
    { id: 54, name: 'Harshi Patel', email: 'harshi.patel@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22IT063', department: 'IT', cgpa: 8.6, backlogs: 0, status: 'active', avatar: 'HP' },
    { id: 55, name: 'Iqbal Shaikh', email: 'iqbal.shaikh@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22IT074', department: 'IT', cgpa: 7.5, backlogs: 0, status: 'active', avatar: 'IS' },
    { id: 56, name: 'Jayant Kumar', email: 'jayant.kumar@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22IT085', department: 'IT', cgpa: 8.3, backlogs: 0, status: 'active', avatar: 'JK' },
    { id: 57, name: 'Kavita Reddy', email: 'kavita.reddy@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22IT096', department: 'IT', cgpa: 8.9, backlogs: 0, status: 'active', avatar: 'KR2' },
    // EEE
    { id: 58, name: 'Gopal Sharma', email: 'gopal.sharma@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EE012', department: 'Electrical', cgpa: 7.9, backlogs: 0, status: 'active', avatar: 'GS' },
    { id: 59, name: 'Hina Qureshi', email: 'hina.qureshi@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EE023', department: 'Electrical', cgpa: 8.1, backlogs: 0, status: 'active', avatar: 'HQ' },
    { id: 60, name: 'Irfan Shaikh', email: 'irfan.shaikh@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EE034', department: 'Electrical', cgpa: 7.6, backlogs: 1, status: 'active', avatar: 'IS3' },
    { id: 61, name: 'Jayesh Patil', email: 'jayesh.patil@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EE045', department: 'Electrical', cgpa: 8.3, backlogs: 0, status: 'active', avatar: 'JP' },
    { id: 62, name: 'Kavitha Nair', email: 'kavitha.nair@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EE056', department: 'Electrical', cgpa: 7.5, backlogs: 0, status: 'active', avatar: 'KN' },
    { id: 63, name: 'Lalit Kumar', email: 'lalit.kumar@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EE007', department: 'Electrical', cgpa: 8.0, backlogs: 0, status: 'active', avatar: 'LK' },
    { id: 64, name: 'Manisha Yadav', email: 'manisha.yadav@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EE018', department: 'Electrical', cgpa: 7.7, backlogs: 1, status: 'active', avatar: 'MY' },
    { id: 65, name: 'Naresh Babu', email: 'naresh.babu@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EE029', department: 'Electrical', cgpa: 8.2, backlogs: 0, status: 'active', avatar: 'NB' },
    { id: 66, name: 'Omkar Desai', email: 'omkar.desai@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EE040', department: 'Electrical', cgpa: 7.8, backlogs: 0, status: 'active', avatar: 'OD' },
    { id: 67, name: 'Padma Rao', email: 'padma.rao@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22EE051', department: 'Electrical', cgpa: 8.5, backlogs: 0, status: 'active', avatar: 'PR' },
    // Mechanical
    { id: 68, name: 'Omkar Joshi', email: 'omkar.joshi@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22ME012', department: 'Mechanical', cgpa: 7.8, backlogs: 0, status: 'active', avatar: 'OJ' },
    { id: 69, name: 'Pradeep Kumar', email: 'pradeep.kumar@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22ME023', department: 'Mechanical', cgpa: 8.0, backlogs: 0, status: 'active', avatar: 'PK3' },
    { id: 70, name: 'Ramesh Nair', email: 'ramesh.nair@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22ME034', department: 'Mechanical', cgpa: 7.5, backlogs: 1, status: 'active', avatar: 'RN2' },
    { id: 71, name: 'Sunita Reddy', email: 'sunita.reddy@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22ME045', department: 'Mechanical', cgpa: 7.9, backlogs: 0, status: 'active', avatar: 'SR3' },
    { id: 72, name: 'Trilok Singh', email: 'trilok.singh@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22ME056', department: 'Mechanical', cgpa: 8.2, backlogs: 0, status: 'active', avatar: 'TS' },
    { id: 73, name: 'Uma Shankar', email: 'uma.shankar@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22ME007', department: 'Mechanical', cgpa: 7.3, backlogs: 2, status: 'active', avatar: 'US' },
    { id: 74, name: 'Varun Malhotra', email: 'varun.malhotra@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22ME018', department: 'Mechanical', cgpa: 7.6, backlogs: 0, status: 'active', avatar: 'VM' },
    { id: 75, name: 'Piyush Agarwal', email: 'piyush.agarwal@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22ME029', department: 'Mechanical', cgpa: 8.1, backlogs: 0, status: 'active', avatar: 'PA' },
    { id: 76, name: 'Reena Mishra', email: 'reena.mishra@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22ME040', department: 'Mechanical', cgpa: 7.7, backlogs: 0, status: 'active', avatar: 'RM3' },
    { id: 77, name: 'Sachin Verma', email: 'sachin.verma@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22ME051', department: 'Mechanical', cgpa: 7.4, backlogs: 1, status: 'active', avatar: 'SV' },
    // Civil
    { id: 78, name: 'Tina Shah', email: 'tina.shah@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CV012', department: 'Civil', cgpa: 7.8, backlogs: 0, status: 'active', avatar: 'TS3' },
    { id: 79, name: 'Ujwal Rao', email: 'ujwal.rao@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CV023', department: 'Civil', cgpa: 8.0, backlogs: 0, status: 'active', avatar: 'UR' },
    { id: 80, name: 'Vanshika Kapoor', email: 'vanshika.kapoor@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CV034', department: 'Civil', cgpa: 7.2, backlogs: 1, status: 'active', avatar: 'VK' },
    { id: 81, name: 'Waqas Ali', email: 'waqas.ali@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CV045', department: 'Civil', cgpa: 7.6, backlogs: 0, status: 'active', avatar: 'WA4' },
    { id: 82, name: 'Yuvraj Shetty', email: 'yuvraj.shetty@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CV056', department: 'Civil', cgpa: 7.9, backlogs: 0, status: 'active', avatar: 'YS' },
    { id: 83, name: 'Zain Siddiqui', email: 'zain.siddiqui@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CV007', department: 'Civil', cgpa: 7.4, backlogs: 2, status: 'active', avatar: 'ZS' },
    { id: 84, name: 'Anisha Kapoor', email: 'anisha.kapoor@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CV018', department: 'Civil', cgpa: 8.1, backlogs: 0, status: 'active', avatar: 'AK3' },
    { id: 85, name: 'Bharat Nair', email: 'bharat.nair@college.edu', role: 'candidate', collegeId: 1, rollNumber: 'B22CV029', department: 'Civil', cgpa: 7.5, backlogs: 0, status: 'active', avatar: 'BN' },
    // ── Alumni ───────────────────────────────────────────────────────────────
    { id: 86, name: 'Rajan Mehta', email: 'rajan.mehta@microsoft.com', role: 'alumni', collegeId: 1, company: 'Microsoft', batch: '2020', status: 'active', avatar: 'RM4', referrals: 3, headline: 'Senior Software Engineer', location: 'Hyderabad, Telangana' },
    { id: 87, name: 'Aisha Kapoor', email: 'aisha.kapoor@amazon.com', role: 'alumni', collegeId: 1, company: 'Amazon', batch: '2021', status: 'active', avatar: 'AK4', referrals: 5, headline: 'SDE-II', location: 'Bengaluru, Karnataka' },
    { id: 88, name: 'Karthik Rao', email: 'karthik.rao@wipro.com', role: 'alumni', collegeId: 1, company: 'Wipro', batch: '2022', status: 'active', avatar: 'KR3', referrals: 2, headline: 'Systems Engineer', location: 'Chennai, Tamil Nadu' },
    { id: 89, name: 'Priya Menon', email: 'priya.menon@infosys.com', role: 'alumni', collegeId: 1, company: 'Infosys', batch: '2021', status: 'active', avatar: 'PM', referrals: 4, headline: 'Technology Analyst', location: 'Pune, Maharashtra' },
    { id: 7, name: 'Vivek Anand', email: 'vivek.anand@google.com', role: 'alumni', collegeId: 1, company: 'Google', batch: '2019', status: 'active', avatar: 'VA', avatarColor: '#059669', referrals: 4, headline: 'Site Reliability Engineer', location: 'Bangalore, Karnataka' },
    { id: 90, name: 'Karan Verma', email: 'karan.verma@analyticshub.com', role: 'alumni', collegeId: 1, company: 'Analytics Hub', batch: '2023', status: 'active', avatar: 'KV', avatarColor: '#3b82f6', referrals: 2, headline: 'Data Analyst', location: 'Mumbai, Maharashtra' },
    { id: 91, name: 'Priya Sharma', email: 'priya.sharma@innovatetech.com', role: 'alumni', collegeId: 1, company: 'InnovateTech', batch: '2020', status: 'active', avatar: 'PS', avatarColor: '#ef4444', referrals: 3, headline: 'Full Stack Developer', location: 'Noida, Uttar Pradesh' },
    // ── Recruiter ────────────────────────────────────────────────────────────
    { id: 8, name: 'Meenal Kapoor', email: 'priya12@gmail.com', role: 'recruiter', collegeId: 1, company: 'TechCorp Solutions', status: 'active', avatar: 'MK' },
    // ── Placement Officer ────────────────────────────────────────────────────
    { id: 9, name: 'Dr. Rajesh Nair', email: 'rajesh@college.edu', role: 'placement_officer', collegeId: 1, department: 'Training & Placement Cell', status: 'active', avatar: 'RN', university: 'Indian Institute of Information Technology, Sri City' },
    // ── Quick-login accounts (password: '123') ─────────────────────────────
    { id: 100, name: 'Shameer Basha Shaik', email: 'c@gmail.com', role: 'candidate', collegeId: 1, password: '123', department: 'Computer Science', cgpa: 8.7, backlogs: 0, rollNumber: 'B22CS001', status: 'active', avatar: 'SB', batchLabel: 'Placement Season 2025–26', headline: 'Computer Science Student | Aspiring Software Engineer', location: 'Bangalore, India', university: 'CareerNest University', phone: '+91 9876543210', about: 'I am a passionate computer science student with a strong foundation in data structures, algorithms, and web development.', skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL'], socialLinks: { github: 'https://github.com/shameerbasha', linkedin: 'https://linkedin.com/in/shameerbasha', portfolio: 'https://shameerbasha.dev' }, resumeData: { profileResumeData: { uploadedResume: { name: 'shameer_resume_v3.pdf', date: '2026-10-14', size: '182 KB' }, resumeHistory: [ { name: 'shameer_resume_v3.pdf', date: '2026-10-14', size: '182 KB' }, { name: 'shameer_resume_v2.pdf', date: '2026-08-20', size: '175 KB' }, { name: 'shameer_resume_v1.pdf', date: '2026-06-01', size: '168 KB' }, { name: 'shameer_cv_internship.pdf', date: '2026-04-10', size: '160 KB' }, { name: 'shameer_resume_jan2026.pdf', date: '2026-01-05', size: '155 KB' } ] } } },
    { id: 101, name: 'Sneha Reddy', email: 'a@gmail.com', role: 'alumni', collegeId: 1, password: '123', company: 'Google', headline: 'Software Engineer', batch: '2021', referrals: 6, status: 'active', avatar: 'SR', avatarColor: '#d97706', location: 'Hyderabad, Telangana', department: 'Computer Science', skills: ['Go', 'Distributed Systems', 'Python', 'System Design'], socialLinks: { linkedin: 'https://linkedin.com/in/snehareddy', github: 'https://github.com/snehareddy' } },
    { id: 102, name: 'Priya Kapoor', email: 'r@gmail.com', role: 'recruiter', collegeId: 1, password: '123', company: 'Google', headline: 'University Relations Lead – Google India', phone: '+91 98001 55555', location: 'Hyderabad, Telangana', status: 'active', avatar: 'PK' },
    { id: 103, name: 'Dr. Rajesh Nair', email: 'p@gmail.com', role: 'placement_officer', collegeId: 1, password: '123', department: 'Training & Placement Cell', status: 'active', avatar: 'RN', university: 'Indian Institute of Information Technology, Sri City', phone: '+91 98450 11122' },
    // ── Super Admin & College Admins ─────────────────────────────────────────
    { id: 200, name: 'Anil Prasad', email: 'superadmin@platform.com', role: 'super_admin', collegeId: null, password: '123', status: 'active', avatar: 'AP2' },
    { id: 201, name: 'Dr. Ganesh Kumar', email: 'ca@iiit.in', role: 'college_admin', collegeId: 1, password: '123', status: 'active', avatar: 'GK', department: 'Administration', university: 'IIIT Sri City' },
    { id: 202, name: 'Dr. Priya Menon', email: 'ca@vit.in', role: 'college_admin', collegeId: 2, password: '123', status: 'active', avatar: 'PM2', department: 'Administration', university: 'VIT University' },
    { id: 203, name: 'Dr. Ramesh Sharma', email: 'ca@srm.in', role: 'college_admin', collegeId: 3, password: '123', status: 'active', avatar: 'RS', department: 'Administration', university: 'SRM Institute' },

    // ── Demo Subscription Tier Accounts (password: '123') ────────────────────


  ];

  private nextId = 236;

  findAll(): User[] {
    // Every current directory and dashboard uses the same population.
    // Archived fixtures remain addressable by ID for historical records.
    return this.users.filter((u) => u.oversightVisible !== false);
  }

  findByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findById(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }

  findByRole(role: string): User[] {
    return this.findAll().filter(u => u.role === role);
  }

  findByCollegeId(collegeId: number): User[] {
    return this.findAll().filter(u => u.collegeId === collegeId);
  }

  findByRoleAndCollege(role: string, collegeId: number): User[] {
    return this.findAll().filter(u => u.role === role && u.collegeId === collegeId);
  }

  create(data: Omit<User, 'id'>): User {
    const user: User = {
      id: this.nextId++,
      password: '123',   // default password for all new users
      ...data,
      oversightVisible: true,
    };
    this.users.push(user);
    return user;
  }

  update(id: number, data: Partial<User>): User | undefined {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.users[idx] = { ...this.users[idx], ...data };
    return this.users[idx];
  }

  remove(id: number): boolean {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    return true;
  }
}
