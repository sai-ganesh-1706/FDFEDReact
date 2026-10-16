// ═══════════════════════════════════════════════════════════════════════════════
// CareerNest — Recruiter Mock Data
// Character: Priya Kapoor · HR Manager · TechCorp Solutions
//
// CONNECTED STORY:
//  1. Recruiter (Priya) posts "Software Engineer" → Placement Officer approves & publishes
//  2. Candidate (Shameer) sees it, applies, asks Alumni (Sneha Reddy, also @ TechCorp) for referral
//  3. Sneha accepts → Shameer's application appears here with ⭐ Referred tag + Sneha's details
//  4. Priya screens Shameer → moves him through rounds, sends feedback
//  5. Priya schedules Technical Interview → link appears in Shameer's InterviewCalendar
// ═══════════════════════════════════════════════════════════════════════════════

export const defaultRecruiter = {
  name: "Priya Kapoor",
  role: "HR Manager",
  email: "priya.kapoor@techcorp.com",
  avatar: "PK",
  company: "TechCorp Solutions",
  department: "Talent Acquisition",
  phone: "+91 98765 43210",
  location: "Bangalore, Karnataka",
  joinedDate: "January 2024"
};

// ── Opportunities posted by Priya ──────────────────────────────────────────────
// ID 1 = "Software Engineer" — the CORE opportunity in the full flow
export const defaultOpportunities = [
  {
    id: 1,
    title: "Software Engineer",
    location: "Bangalore, Karnataka",
    ctc: "12 LPA",
    openings: "15",
    cgpa: "7.5",
    type: "Full-Time",
    branches: ["CSE", "ECE", "IT"],
    skills: ["JavaScript", "React", "Node.js", "SQL", "AWS"],
    applications: 8,
    deadline: "2026-03-25",
    status: "Published",          // Placement officer has approved & published
    description:
      "Join TechCorp Solutions to build high-scale web platforms and microservices. You will collaborate with cross-functional teams, own backend services using Node.js, and drive front-end experiences with React."
  },
  {
    id: 2,
    title: "Frontend Developer",
    location: "Bangalore, Karnataka",
    ctc: "8 LPA",
    openings: "8",
    cgpa: "7.0",
    type: "Full-Time",
    branches: ["CSE", "IT"],
    skills: ["HTML", "CSS", "React", "TypeScript"],
    applications: 3,
    deadline: "2026-03-28",
    status: "Published",
    description:
      "Join our UI team building responsive, engaging user interfaces for enterprise applications at TechCorp Solutions."
  },
  {
    id: 3,
    title: "Data Analyst Intern",
    location: "Remote",
    ctc: "₹35,000 / month",
    openings: "5",
    cgpa: "7.5",
    type: "Internship",
    branches: ["CSE", "ECE", "IT", "EEE"],
    skills: ["Python", "SQL", "Tableau", "PowerBI"],
    applications: 2,
    deadline: "2026-04-10",
    status: "Published",
    description:
      "Analyze datasets, build interactive dashboards, and deliver valuable business intelligence for TechCorp Solutions."
  }
];

// ── Applications received for the posted opportunities ────────────────────────
// Shameer Basha Shaik (id: 1) is the MAIN candidate — referred by Sneha Reddy
export const defaultApplications = [
  {
    // ★ MAIN CANDIDATE — Shameer Basha Shaik
    // Referred by alumni Sneha Reddy (also at TechCorp Solutions, 2021 batch)
    // Status: Interview (resume ✓, assessment ✓, now in technical)
    // Recruiter feedback sent back to candidate dashboard
    id: 1,
    name: "Shameer Basha Shaik",
    initials: "SB",
    branch: "Computer Science",
    cgpa: 8.7,
    role: "Software Engineer",
    status: "Interview",
    isReferred: true,
    referrerName: "Sneha Reddy",
    referrerInitials: "SR",
    referrerAvatarColor: "#d97706",
    referrerCompany: "TechCorp Solutions",
    referrerBatch: "2021 Batch",
    referrerNote:
      "Shameer is a remarkably strong candidate. I've reviewed his React projects and competitive programming profiles — he's a great fit for this role. Referral submitted!",
    appliedDate: "2026-02-15",
    email: "shameer@college.in",
    phone: "+91 9876543210",
    resumeFile: "Shameer_Basha_Shaik_Resume_2026.pdf",
    opportunityId: 1,
    rounds: {
      resume:     "Pass",
      assessment: "Pass",
      technical:  "Pass",
      hr:         "Pending"
    },
    evaluation: {
      technicalSkills:    4,
      problemSolving:     5,
      communication:      4,
      confidence:         4,
      overallPerformance: 4
    },
    recruiterFeedback:
      "Shameer performed exceptionally well in the coding assessment (score 92/100) and cleared the technical interview with strong answers on system design and React internals. Communication is clear and confident. Moving to HR round. Highly recommend for the role.",
    feedbackSent: true
  },
  {
    id: 2,
    name: "Arjun Sharma",
    initials: "AS",
    branch: "Computer Science",
    cgpa: 9.1,
    role: "Software Engineer",
    status: "Assessment",
    isReferred: false,
    appliedDate: "2026-02-18",
    email: "arjun.sharma@college.edu",
    phone: "+91 98451 22345",
    resumeFile: "Arjun_Sharma_Resume_v2.pdf",
    opportunityId: 1,
    rounds: {
      resume:     "Pass",
      assessment: "Pending",
      technical:  "Pending",
      hr:         "Pending"
    },
    evaluation: {},
    recruiterFeedback: "",
    feedbackSent: false
  },
  {
    id: 3,
    name: "Sneha Patel",
    initials: "SP",
    branch: "Electronics",
    cgpa: 8.2,
    role: "Software Engineer",
    status: "Shortlisted",
    isReferred: false,
    appliedDate: "2026-02-22",
    email: "sneha.patel@college.edu",
    phone: "+91 98234 56789",
    resumeFile: "Sneha_Patel_Resume.pdf",
    opportunityId: 1,
    rounds: {
      resume:     "Reviewing",
      assessment: "Pending",
      technical:  "Pending",
      hr:         "Pending"
    },
    evaluation: {},
    recruiterFeedback: "",
    feedbackSent: false
  },
  {
    id: 4,
    name: "Vikram Nair",
    initials: "VN",
    branch: "Computer Science",
    cgpa: 9.1,
    role: "Frontend Developer",
    status: "Assessment",
    isReferred: true,
    referrerName: "Amit Patel",
    referrerInitials: "AP",
    referrerAvatarColor: "#4f46e5",
    referrerCompany: "TechCorp Solutions",
    referrerBatch: "2020 Batch",
    referrerNote: "Vikram built the UI for our internal dashboard project — solid React skills.",
    appliedDate: "2026-02-25",
    email: "vikram.nair@college.edu",
    phone: "+91 97123 45678",
    resumeFile: "Vikram_Frontend.pdf",
    opportunityId: 2,
    rounds: {
      resume:     "Pass",
      assessment: "Pending",
      technical:  "Pending",
      hr:         "Pending"
    },
    evaluation: {},
    recruiterFeedback: "",
    feedbackSent: false
  },
  {
    id: 5,
    name: "Pooja Rao",
    initials: "PR",
    branch: "Information Technology",
    cgpa: 7.9,
    role: "Frontend Developer",
    status: "Applied",
    isReferred: false,
    appliedDate: "2026-03-01",
    email: "pooja.rao@college.edu",
    phone: "+91 99887 66554",
    resumeFile: "Pooja_CV.pdf",
    opportunityId: 2,
    rounds: {
      resume:     "Reviewing",
      assessment: "Pending",
      technical:  "Pending",
      hr:         "Pending"
    },
    evaluation: {},
    recruiterFeedback: "",
    feedbackSent: false
  },
  {
    id: 6,
    name: "Rohit Verma",
    initials: "RV",
    branch: "Computer Science",
    cgpa: 8.5,
    role: "Software Engineer",
    status: "Offered",
    isReferred: false,
    appliedDate: "2026-02-10",
    email: "rohit.verma@college.edu",
    phone: "+91 91234 56780",
    resumeFile: "Rohit_SWE.pdf",
    opportunityId: 1,
    rounds: {
      resume:     "Pass",
      assessment: "Pass",
      technical:  "Pass",
      hr:         "Pass"
    },
    evaluation: {
      technicalSkills:    5,
      problemSolving:     4,
      communication:      5,
      confidence:         5,
      overallPerformance: 5
    },
    recruiterFeedback:
      "Rohit is an outstanding candidate. Perfect scores in all rounds. Offer extended and accepted.",
    feedbackSent: true
  }
];

// ── Assessments / Interviews scheduled ────────────────────────────────────────
// Assessment ID 2 = scheduled for Shameer — will mirror on InterviewCalendar
export const defaultAssessments = [
  {
    id: 1,
    title: "Coding Assessment — Round 1",
    role: "Software Engineer",
    date: "2026-03-18",
    time: "10:00 AM",
    duration: "90 min",
    candidates: 8,
    platform: "HackerRank",
    link: "https://hackerrank.com/test/techcorp-swe-r1",
    type: "Online Test",
    candidateEmail: "shameer@college.in",
    isDraft: false
  },
  {
    id: 2,
    title: "Technical Interview — Round 2",
    role: "Software Engineer",
    date: "2026-10-08",           // matches interviewSchedule id:1 in candidate mockdata
    time: "10:00 AM",
    duration: "60 min",
    candidates: 3,
    platform: "Google Meet",
    link: "https://meet.google.com/techcorp-se-round1",
    type: "Technical Interview",
    candidateEmail: "shameer@college.in",
    isDraft: false
  },
  {
    id: 3,
    title: "HR Interview — Final Round",
    role: "Software Engineer",
    date: "2026-10-22",
    time: "11:00 AM",
    duration: "45 min",
    candidates: 1,
    platform: "Zoom",
    link: "https://zoom.us/j/techcorp-hr-final",
    type: "HR Interview",
    candidateEmail: "shameer@college.in",
    isDraft: true
  }
];

// ── Pool of eligible candidates (CandidatesFilter page) ──────────────────────
export const defaultCollegeCandidates = [
  {
    id: 101,
    name: "Shameer Basha Shaik",
    rollNo: "B22CS087",
    dept: "Computer Science",
    cgpa: 8.7,
    backlogs: 0,
    skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "AWS", "Docker"],
    email: "shameer@college.in",
    status: "Eligible"
  },
  {
    id: 102,
    name: "Arjun Sharma",
    rollNo: "2022BCSE014",
    dept: "Computer Science",
    cgpa: 9.1,
    backlogs: 0,
    skills: ["Java", "Spring Boot", "Microservices", "Docker"],
    email: "arjun.sharma@college.edu",
    status: "Eligible"
  },
  {
    id: 103,
    name: "Ananya Iyer",
    rollNo: "2022BCSE022",
    dept: "Computer Science",
    cgpa: 8.9,
    backlogs: 0,
    skills: ["Python", "Machine Learning", "FastAPI", "React"],
    email: "ananya.i@college.edu",
    status: "Eligible"
  },
  {
    id: 104,
    name: "Karan Johar",
    rollNo: "2022BECE045",
    dept: "Electronics",
    cgpa: 8.1,
    backlogs: 0,
    skills: ["C++", "Embedded Systems", "IoT", "Python"],
    email: "karan.j@college.edu",
    status: "Eligible"
  },
  {
    id: 105,
    name: "Meera Sen",
    rollNo: "2022BIT011",
    dept: "Information Technology",
    cgpa: 8.6,
    backlogs: 0,
    skills: ["React", "TypeScript", "Node.js", "MongoDB"],
    email: "meera.s@college.edu",
    status: "Eligible"
  },
  {
    id: 106,
    name: "Rohan Gupta",
    rollNo: "2022BEEE030",
    dept: "Electrical",
    cgpa: 7.4,
    backlogs: 1,
    skills: ["MATLAB", "Circuit Design", "Python"],
    email: "rohan.g@college.edu",
    status: "Has Backlog"
  },
  {
    id: 107,
    name: "Tanvi Sharma",
    rollNo: "2022BCSE088",
    dept: "Computer Science",
    cgpa: 9.5,
    backlogs: 0,
    skills: ["Data Structures", "Algorithms", "C++", "System Design"],
    email: "tanvi.s@college.edu",
    status: "Eligible"
  }
];
