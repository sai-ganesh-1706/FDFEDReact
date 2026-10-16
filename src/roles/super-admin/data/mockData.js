// Mock data for Super Admin — replace with real API calls

export const mockColleges = [
  {
    id: 1,
    name: 'IIT Madras',
    code: 'IITM',
    email: 'admin@iitm.ac.in',
    phone: '+91 44 2257 8000',
    address: 'Chennai, Tamil Nadu',
    website: 'https://www.iitm.ac.in',
    status: 'active',
    admin: { id: 10, name: 'Dr. Ganesh Kumar', email: 'ganesh@iitm.ac.in', status: 'active' },
    stats: { students: 1240, placementOfficers: 4, alumni: 3800, recruiters: 62, placed: 980 },
  },
  {
    id: 2,
    name: 'NIT Trichy',
    code: 'NITT',
    email: 'admin@nitt.edu',
    phone: '+91 431 250 3000',
    address: 'Tiruchirappalli, Tamil Nadu',
    website: 'https://www.nitt.edu',
    status: 'active',
    admin: { id: 11, name: 'Prof. Lakshmi Narayanan', email: 'lakshmi@nitt.edu', status: 'active' },
    stats: { students: 980, placementOfficers: 3, alumni: 2900, recruiters: 45, placed: 790 },
  },
  {
    id: 3,
    name: 'VIT Vellore',
    code: 'VIT',
    email: 'admin@vit.ac.in',
    phone: '+91 416 224 0911',
    address: 'Vellore, Tamil Nadu',
    website: 'https://www.vit.ac.in',
    status: 'active',
    admin: null,
    stats: { students: 2100, placementOfficers: 6, alumni: 5200, recruiters: 88, placed: 1650 },
  },
  {
    id: 4,
    name: 'Anna University',
    code: 'AU',
    email: 'admin@annauniv.edu',
    phone: '+91 44 2235 8989',
    address: 'Chennai, Tamil Nadu',
    website: 'https://www.annauniv.edu',
    status: 'inactive',
    admin: { id: 12, name: 'Dr. Priya Sharma', email: 'priya@annauniv.edu', status: 'inactive' },
    stats: { students: 450, placementOfficers: 2, alumni: 1200, recruiters: 20, placed: 310 },
  },
];

export const mockStats = {
  totalColleges: 4,
  activeColleges: 3,
  suspendedColleges: 0,
  totalStudents: 4770,
  totalAlumni: 13100,
  totalPlacementOfficers: 15,
  totalCollegeAdmins: 3,
  totalPlaced: 3730,
};

