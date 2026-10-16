/* ═══════════════════════════════════════════════════════════════════════════
   CareerNest — Placement Officer Mock Data
   Character: Dr. Rajesh Nair · Senior Placement Officer · CareerNest University

   CONNECTED STORY:
    1. Priya Kapoor (Recruiter @ TechCorp Solutions) submits "Software Engineer"
       → appears in MOCK.submissions with status "pending"
    2. Dr. Rajesh Nair reviews it → approves & changes status to "published"
    3. Published opportunity appears in candidate (Shameer's) Opportunities page
    4. Shameer applies → shown in MOCK.applications with isReferred + referrer info
    5. After screening, application status progresses (Applied → Interview)
   ═══════════════════════════════════════════════════════════════════════════ */

const MOCK = {
    brand: { name: 'CareerNest', subtitle: 'Placement Officer' },

    user: {
        name: 'Dr. Rajesh Nair',
        email: 'rajesh@college.edu',
        initials: 'RN',
        role: 'Senior Placement Officer',
        phone: '+91 98765 43210',
        department: 'Training & Placement Cell',
        institution: 'CareerNest University',
        employeeId: 'CNU-TPO-2018-042',
        joined: 'August 15, 2018',
        location: 'Bangalore, Karnataka',
        bio: 'Dedicated placement officer with 8+ years of experience in bridging the gap between academia and industry. Passionate about mentoring students and building strong corporate partnerships to maximize placement outcomes.',
        education: [
            { degree: 'Ph.D. in Human Resource Management', institution: 'IIM Kozhikode',             year: '2017' },
            { degree: 'MBA in HR & Marketing',              institution: 'Symbiosis International University', year: '2012' },
            { degree: 'B.Tech in Computer Science',         institution: 'NIT Calicut',                year: '2010' }
        ],
        skills: ['Campus Recruitment', 'Corporate Relations', 'Student Mentoring', 'Resume Workshops', 'Interview Coaching', 'Data Analytics', 'Negotiation', 'Event Management'],
        achievements: [
            { title: 'Best Placement Officer Award',  desc: 'Recognized by AICTE for highest placement rate — 2024', icon: 'trophy' },
            { title: '95% Placement Rate',            desc: 'Achieved the highest placement rate in CareerNest University history — Batch 2025', icon: 'chart' },
            { title: '50+ Corporate Tie-ups',         desc: 'Established partnerships with Fortune 500 and leading startups', icon: 'handshake' },
            { title: 'Published Researcher',          desc: '12 papers on employability trends in IEEE and Springer journals', icon: 'book' }
        ],
        activity: {
            drivesManaged:       142,
            studentsPlaced:      2840,
            recruitersOnboarded: 310,
            workshopsConducted:  67,
            avgResponseTime:     '2.4 hrs',
            satisfactionScore:   '4.8/5'
        },
        social: {
            linkedin: 'linkedin.com/in/rajesh-nair-tpo',
            website:  'tpo.careernest.ac.in'
        }
    },

    nav: [
        { label: 'Dashboard',           href: 'p1.html' },
        { label: 'Review Opportunities', href: 'p2.html' },
        { label: 'Statistics',           href: 'p3.html' },
        { label: 'Recruiters',           href: 'p4.html' }
    ],

    stats: {
        totalCandidates: 342, placementRate: 72, highestPkg: 32, companiesVisited: 28,
        totalApps: 1247, avgPkg: 18, offersAccepted: 76, internships: 134,
        pending: 1, published: 3, totalOpps: 5, totalApplicants: 132
    },

    branches: [
        { name: 'CSE', total: 120, placed: 98, color: '#00c950', colorClass: 'green'  },
        { name: 'ECE', total: 90,  placed: 67, color: '#10b981', colorClass: 'teal'   },
        { name: 'ME',  total: 80,  placed: 45, color: '#f0b100', colorClass: 'orange' },
        { name: 'CIV', total: 72,  placed: 38, color: '#ef4444', colorClass: 'red'    },
        { name: 'EEE', total: 55,  placed: 31, color: '#f59e0b', colorClass: 'amber'  }
    ],

    trend: {
        labels:      ['Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'],
        fullTime:    [10, 18, 30, 25, 35, 28, 40, 45],
        internships: [5,  12, 15, 20, 22, 18, 25, 30]
    },

    // ── Opportunity Submissions ───────────────────────────────────────────────
    // ★ id index 0 = TechCorp Solutions "Software Engineer" (submitted by Priya Kapoor)
    //   Status "published" → Placement Officer already approved it → visible to candidates
    submissions: [
        {
            // ★ CORE OPPORTUNITY — submitted by Priya Kapoor, approved & published by Dr. Rajesh
            title:      'Software Engineer',
            company:    'TechCorp Solutions',
            status:     'published',
            avatar:     'T',
            avatarBg:   '#7C3AED',
            type:       'placement',
            location:   'Bangalore, Karnataka',
            pkg:        '₹12 LPA',
            submitter:  'Priya Kapoor',
            submitted:  '2026-02-10',
            deadline:   '2026-03-25',
            desc:       'Join TechCorp Solutions to build scalable cloud-native applications. Work on backend services using Node.js and Python and drive front-end experiences with React.',
            cgpa:       7.5,
            branches:   'Computer Science, IT, Electronics',
            backlogs:   'Not allowed',
            skills:     ['JavaScript', 'React', 'Node.js', 'SQL', 'AWS'],
            rounds:     'Resume Screening → Online Assessment → Technical Interview → HR Round',
            applied:    8,
            approvedBy: 'Dr. Rajesh Nair',
            approvedOn: '2026-02-12'
        },
        {
            title:     'Data Analyst Intern',
            company:   'Analytics Hub',
            status:    'published',
            avatar:    'A',
            avatarBg:  '#4f46e5',
            type:      'internship',
            location:  'Hyderabad',
            pkg:       '₹25,000/month',
            submitter: 'Amit Joshi',
            submitted: '2026-02-20',
            deadline:  '2026-03-25',
            desc:      'Join Analytics Hub as a Data Analyst Intern and work on real-world analytics projects using Python, SQL, and Power BI.',
            cgpa:      7.0,
            branches:  'Computer Science, Mathematics, Statistics',
            backlogs:  'Allowed',
            skills:    ['Python', 'SQL', 'Excel', 'Tableau', 'Power BI'],
            rounds:    'Resume Screening → Technical Test → Interview',
            applied:   67
        },
        {
            title:     'Frontend Developer',
            company:   'Startup XYZ',
            status:    'approved',
            avatar:    'S',
            avatarBg:  '#7c3aed',
            type:      'placement',
            location:  'Remote',
            pkg:       '₹8 LPA',
            submitter: 'Priya Kapoor',
            submitted: '2026-02-28',
            deadline:  '2026-03-30',
            desc:      'Build beautiful and performant web apps using modern JavaScript frameworks at Startup XYZ.',
            cgpa:      6.5,
            branches:  'Computer Science, IT',
            backlogs:  'Not allowed',
            skills:    ['React', 'TypeScript', 'CSS', 'REST APIs'],
            rounds:    'Portfolio Review → Coding Challenge → Technical Interview',
            applied:   0
        },
        {
            // ★ PENDING — Machine Learning Engineer by AI Dynamics (awaiting Dr. Rajesh review)
            title:     'Machine Learning Engineer',
            company:   'AI Dynamics',
            status:    'pending',
            avatar:    'A',
            avatarBg:  '#f59e0b',
            type:      'placement',
            location:  'Hyderabad',
            pkg:       '₹18 LPA',
            submitter: 'Raj Kumar',
            submitted: '2026-03-01',
            deadline:  '2026-04-01',
            desc:      'Work on state-of-the-art ML models and deploy them at scale at AI Dynamics.',
            cgpa:      8.0,
            branches:  'Computer Science, Electronics, Mathematics',
            backlogs:  'Not allowed',
            skills:    ['Python', 'TensorFlow', 'PyTorch', 'Statistics', 'SQL'],
            rounds:    'Resume → Coding → ML Assessment → Technical → HR',
            applied:   0
        },
        {
            title:            'Product Management Intern',
            company:          'MegaCorp',
            status:           'rejected',
            avatar:           'M',
            avatarBg:         '#ef4444',
            type:             'internship',
            location:         'Mumbai',
            pkg:              '₹30,000/month',
            submitter:        'Priya Kapoor',
            submitted:        '2026-02-10',
            deadline:         '2026-03-10',
            desc:             'Assist the product team in defining product strategy and launching new features.',
            cgpa:             7.5,
            branches:         'Computer Science, Business Admin, Electronics',
            backlogs:         'Allowed',
            skills:           ['Communication', 'Analytical Thinking', 'Excel', 'Product Sense'],
            rounds:           'Case Study → Group Discussion → HR Interview',
            applied:          0,
            rejectionRemark:  'Company does not meet our placement partner criteria.'
        },
        {
            title:     'DevOps Engineer',
            company:   'CloudBase Inc.',
            status:    'published',
            avatar:    'C',
            avatarBg:  '#ec4899',
            type:      'placement',
            location:  'Chennai',
            pkg:       '₹14 LPA',
            submitter: 'Sara Thomas',
            submitted: '2026-02-22',
            deadline:  '2026-03-28',
            desc:      'Design and maintain CI/CD pipelines and manage cloud infrastructure at CloudBase Inc.',
            cgpa:      7.0,
            branches:  'Computer Science, IT',
            backlogs:  'Not allowed',
            skills:    ['AWS', 'Docker', 'Kubernetes', 'Linux', 'Jenkins'],
            rounds:    'Resume → Technical Assessment → System Design → HR',
            applied:   38
        }
    ],

    stakeholders: { candidates: 324, recruiters: 47, activeDrives: 8, alumni: 156 },

    drives: [
        { company: 'TechCorp Solutions', role: 'Software Engineer',    badge: 'Interview Round',    badgeClass: 'purple' },
        { company: 'Analytics Hub',      role: 'Data Analyst Intern',  badge: 'Applications Open',  badgeClass: 'green'  },
        { company: 'AI Dynamics',        role: 'ML Engineer',          badge: 'Pending Approval',   badgeClass: 'blue'   }
    ],

    interviews: [
        { company: 'TechCorp Solutions', round: 'Technical Interview', time: 'Oct 8, 2026 — 10:00 AM' },
        { company: 'Analytics Hub',      round: 'Screening Round',     time: 'Oct 12, 2026 — 2:00 PM' }
    ],

    recruiterStats: { total: 8, active: 5, pending: 3, declined: 0 },

    notifications: [
        { id: 1, type: 'warning',  title: 'Opportunity Pending Review',     message: 'Machine Learning Engineer by AI Dynamics is awaiting your approval.',                time: '10 min ago',  read: false, href: 'p2.html', highlight: 'Machine Learning Engineer', highlightType: 'opportunity', highlightIdx: 3 },
        { id: 2, type: 'recruiter', title: 'New Recruiter Registration',    message: 'Kiran Rao from StartupX has registered and needs verification.',                    time: '25 min ago',  read: false, href: 'p4.html', highlight: 'Kiran Rao',              highlightType: 'recruiter',   highlightIdx: 4 },
        { id: 3, type: 'recruiter', title: 'Recruiter Pending Verification',message: 'Vikash Singh from SecureNet is awaiting approval.',                                 time: '1 hour ago',  read: false, href: 'p4.html', highlight: 'Vikash Singh',           highlightType: 'recruiter',   highlightIdx: 5 },
        { id: 4, type: 'recruiter', title: 'Recruiter Pending Verification',message: 'Arjun Mehta from FinTech Pro has submitted a verification request.',               time: '2 hours ago', read: false, href: 'p4.html', highlight: 'Arjun Mehta',           highlightType: 'recruiter',   highlightIdx: 6 },
        { id: 5, type: 'success',  title: 'Drive Update: TechCorp Solutions', message: 'TechCorp Solutions Software Engineer drive has 8 applications so far.',          time: '3 hours ago', read: true,  href: 'p1.html', highlight: 'TechCorp Solutions',     highlightType: 'drive',       highlightIdx: 0 },
        { id: 6, type: 'info',     title: 'Interview Scheduled',            message: 'TechCorp Solutions Technical Interview is scheduled for Oct 8, 2026 at 10:00 AM.', time: '5 hours ago', read: true,  href: 'p1.html', highlight: 'TechCorp Solutions',     highlightType: 'interview',   highlightIdx: 0 },
        { id: 7, type: 'warning',  title: 'Deadline Approaching',           message: 'Frontend Developer (Startup XYZ) application deadline is March 30, 2026.',          time: '6 hours ago', read: true,  href: 'p2.html', highlight: 'Frontend Developer',     highlightType: 'opportunity', highlightIdx: 2 },
        { id: 8, type: 'success',  title: 'Opportunity Published',          message: 'Software Engineer at TechCorp Solutions is now live — 8 candidates have applied.', time: 'Yesterday',   read: true,  href: 'p2.html', highlight: 'Software Engineer',      highlightType: 'opportunity', highlightIdx: 0 }
    ],

    recruiters: [
        { name: 'Priya Kapoor',  company: 'TechCorp Solutions', role: 'HR Manager',     opps: 2, status: 'active',  email: 'priya.kapoor@techcorp.com',      phone: '+91 98765 43210', location: 'Bangalore, Karnataka', joined: 'January 15, 2024',   bio: 'Experienced HR professional with over 8 years in talent acquisition. Posted "Software Engineer" and "Frontend Developer" drives for the 2026 batch.' },
        { name: 'Raj Kumar',     company: 'AI Dynamics',        role: 'Hiring Lead',    opps: 1, status: 'active',  email: 'raj.kumar@aidynamics.com',       phone: '+91 87654 32109', location: 'Hyderabad',            joined: 'March 22, 2024',     bio: 'Leading hiring efforts at AI Dynamics. Focused on building world-class AI and ML engineering teams across India.' },
        { name: 'Amit Joshi',    company: 'Analytics Hub',      role: 'HR Manager',     opps: 1, status: 'active',  email: 'amit.joshi@analyticshub.com',    phone: '+91 76543 21098', location: 'Pune, Maharashtra',    joined: 'June 10, 2023',      bio: 'HR manager specializing in data analytics and business intelligence roles. Focused on campus-to-corporate hiring pipelines.' },
        { name: 'Sara Thomas',   company: 'CloudBase Inc',      role: 'Recruiter',      opps: 1, status: 'active',  email: 'sara.thomas@cloudbase.io',       phone: '+91 65432 10987', location: 'Chennai, Tamil Nadu',  joined: 'September 5, 2023',  bio: 'Cloud infrastructure recruiter with expertise in identifying talent for DevOps, SRE, and cloud engineering roles.' },
        { name: 'Kiran Rao',     company: 'StartupX',           role: 'Founder & CEO',  opps: 1, status: 'pending', email: 'kiran.rao@startupx.in',          phone: '+91 54321 09876', location: 'Delhi NCR',            joined: 'December 1, 2024',   bio: 'Founder & CEO of StartupX, an early-stage fintech startup. Looking for versatile product engineers who thrive in fast-paced environments.' },
        { name: 'Vikash Singh',  company: 'SecureNet',          role: 'Recruiter',      opps: 1, status: 'pending', email: 'vikash.singh@securenet.com',     phone: '+91 43210 98765', location: 'Chennai, Tamil Nadu',  joined: 'November 18, 2024',  bio: 'Cybersecurity recruiter at SecureNet. Specializes in hiring for security operations, ethical hacking, and compliance roles.' },
        { name: 'Arjun Mehta',   company: 'FinTech Pro',        role: 'Talent Manager', opps: 1, status: 'pending', email: 'arjun.mehta@fintechpro.com',     phone: '+91 32109 87654', location: 'Mumbai, Maharashtra',  joined: 'October 28, 2024',   bio: 'Talent acquisition manager at FinTech Pro. Passionate about scaling fintech teams and bringing in diverse talent across payments and banking tech.' },
        { name: 'Meera Reddy',   company: 'EduTech Solutions',  role: 'HR Lead',        opps: 1, status: 'active',  email: 'meera.reddy@edutechsol.com',     phone: '+91 21098 76543', location: 'Bangalore, Karnataka', joined: 'February 20, 2023',  bio: 'HR lead at EduTech Solutions with a focus on hiring instructional designers, ed-tech engineers, and content strategists.' }
    ]
};

// ── Candidate User Roster ─────────────────────────────────────────────────────
// ★ id:1 = Shameer Basha Shaik — the main candidate in the full story
MOCK.users = [
    { id: 1, name: 'Shameer Basha Shaik', email: 'shameer@college.in',      role: 'candidate', roll: 'B22CS087', branch: 'Computer Science', cgpa: 8.7, backlogs: 0, status: 'active',   company: '',                   batch: '',     referrals: 1 },
    { id: 2, name: 'Aarav Sharma',        email: 'aarav.sharma@college.edu', role: 'candidate', roll: 'B22CS012', branch: 'Computer Science', cgpa: 8.5, backlogs: 0, status: 'active',   company: '',                   batch: '',     referrals: 0 },
    { id: 3, name: 'Isha Gupta',          email: 'isha.gupta@college.edu',   role: 'candidate', roll: 'B22EC045', branch: 'Electronics',      cgpa: 9.1, backlogs: 0, status: 'active',   company: '',                   batch: '',     referrals: 0 },
    { id: 4, name: 'Rohan Verma',         email: 'rohan.verma@college.edu',  role: 'candidate', roll: 'B22ME089', branch: 'Mechanical',       cgpa: 6.8, backlogs: 1, status: 'active',   company: '',                   batch: '',     referrals: 0 },
    { id: 5, name: 'Sneha Patil',         email: 'sneha.patil@college.edu',  role: 'candidate', roll: 'B22CS102', branch: 'Computer Science', cgpa: 7.2, backlogs: 0, status: 'active',   company: '',                   batch: '',     referrals: 0 },
    { id: 6, name: 'Vikram Singh',        email: 'vikram.singh@college.edu', role: 'candidate', roll: 'B22IT033', branch: 'IT',               cgpa: 5.9, backlogs: 3, status: 'inactive', company: '',                   batch: '',     referrals: 0 },
    { id: 7, name: 'Aditi Jain',          email: 'aditi.jain@college.edu',   role: 'candidate', roll: 'B22CV012', branch: 'Civil',            cgpa: 8.0, backlogs: 0, status: 'active',   company: '',                   batch: '',     referrals: 0 },
    { id: 8, name: 'Sneha Reddy',         email: 'sneha.reddy@techcorp.com', role: 'alumni',    roll: '',         branch: 'Computer Science', cgpa: 0,   backlogs: 0, status: 'active',   company: 'TechCorp Solutions', batch: '2021', referrals: 3 }
];

// ── Applications visible in Placement Officer dashboard ───────────────────────
// ★ id:1 = Shameer's application for TechCorp Solutions Software Engineer
//   isReferred:true with Sneha Reddy's referrer details
//   status progresses: Applied → Shortlisted → Assessment → Interview
MOCK.applications = [
    {
        id:            1,
        candidate:     'Shameer Basha Shaik',
        role:          'Software Engineer',
        company:       'TechCorp Solutions',
        date:          '2026-02-15',
        status:        'Interview',
        interviewDate: '2026-10-08',
        isReferred:    true,
        referrerName:  'Sneha Reddy',
        referrerBatch: '2021 Batch',
        referrerNote:  'Shameer is a remarkably strong candidate — great fit for this role.',
        recruiterFeedback: 'Exceptional coding assessment (92/100). Strong React & system design. Moving to HR.',
        recruiterRating: { overall: 4 }
    },
    {
        id:            2,
        candidate:     'Aarav Sharma',
        role:          'Data Analyst Intern',
        company:       'Analytics Hub',
        date:          '2026-03-01',
        status:        'Applied',
        interviewDate: '',
        isReferred:    false
    },
    {
        id:            3,
        candidate:     'Aarav Sharma',
        role:          'DevOps Engineer',
        company:       'CloudBase Inc.',
        date:          '2026-03-02',
        status:        'Applied',
        interviewDate: '',
        isReferred:    false
    },
    {
        id:            4,
        candidate:     'Sneha Patil',
        role:          'Software Engineer',
        company:       'TechCorp Solutions',
        date:          '2026-02-25',
        status:        'Shortlisted',
        interviewDate: '',
        isReferred:    false
    },
    {
        id:            5,
        candidate:     'Isha Gupta',
        role:          'Machine Learning Engineer',
        company:       'AI Dynamics',
        date:          '2026-02-28',
        status:        'Interview',
        interviewDate: '2026-03-05',
        isReferred:    false
    },
    {
        id:            6,
        candidate:     'Aditi Jain',
        role:          'Product Management Intern',
        company:       'MegaCorp',
        date:          '2026-02-05',
        status:        'Selected',
        interviewDate: '',
        isReferred:    false
    },
    {
        id:            7,
        candidate:     'Rohan Verma',
        role:          'Frontend Developer',
        company:       'Startup XYZ',
        date:          '2026-02-10',
        status:        'Rejected',
        interviewDate: '',
        isReferred:    false
    }
];

function signOut() {
    if (confirm('Are you sure you want to sign out?')) {
        alert('sign out');
    }
}

export { MOCK, signOut };
export default MOCK;
