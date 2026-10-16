import React from 'react';

// Dummy resume data shown inline instead of iframe
const DUMMY_RESUME = {
  name: 'Candidate',
  title: 'Software Engineer',
  contact: {
    email: 'candidate@email.com',
    phone: '+91 98765 43210',
    linkedin: 'linkedin.com/in/candidate',
    location: 'Bangalore, India',
  },
  summary:
    'Motivated and detail-oriented Computer Science graduate with strong foundations in data structures, algorithms, and full-stack development. Experienced in building scalable web applications using React, Node.js, and cloud services. Passionate about solving complex problems and contributing to impactful products.',
  education: [
    {
      degree: 'B.Tech in Computer Science & Engineering',
      institution: 'National Institute of Technology',
      year: '2021 – 2025',
      cgpa: '8.7 / 10',
    },
  ],
  experience: [
    {
      role: 'Software Engineering Intern',
      company: 'TechCorp Pvt. Ltd.',
      duration: 'May 2024 – Jul 2024',
      points: [
        'Developed RESTful APIs using Node.js and Express, reducing response time by 25%.',
        'Built dynamic UI components in React with TypeScript improving code reusability.',
        'Integrated CI/CD pipelines using GitHub Actions for automated testing and deployment.',
      ],
    },
  ],
  skills: [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
    'SQL', 'MongoDB', 'Docker', 'Git', 'REST APIs', 'AWS (S3, EC2)',
  ],
  projects: [
    {
      name: 'PlaceConnect – Campus Placement Portal',
      tech: 'React, Node.js, MongoDB, JWT',
      desc: 'Built a full-stack placement management system for colleges with role-based access for students, alumni, recruiters, and administrators.',
    },
    {
      name: 'AI Resume Screener',
      tech: 'Python, FastAPI, OpenAI API',
      desc: 'Developed an AI-powered tool that parses resumes and matches them to job descriptions with relevance scoring.',
    },
  ],
  achievements: [
    'Top 5% in LeetCode India – solved 400+ problems',
    'Winner, Internal Hackathon 2024 – Best Tech Innovation',
    'Published paper on "Optimizing Graph Traversal Algorithms" – National Tech Journal',
  ],
};

export default function ResumeModal({
  isOpen,
  onClose,
  candidateName = 'Candidate',
  candidate = null,
}) {
  if (!isOpen) return null;

  const candidateSkills =
    candidate?.skills && candidate.skills.length > 0
      ? candidate.skills
      : DUMMY_RESUME.skills;

  const resume = {
    name: candidate?.name || candidateName,
    title: candidate?.role || DUMMY_RESUME.title,
    contact: {
      email: `${(candidate?.name || candidateName || 'candidate')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '.')}@university.edu`,
      phone: '+91 98765 43210',
      linkedin: `linkedin.com/in/${(candidate?.name || candidateName || 'candidate')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')}`,
      location: candidate?.location || DUMMY_RESUME.contact.location,
    },
    summary:
      candidate?.message ||
      DUMMY_RESUME.summary,
    education: [
      {
        degree: `B.Tech in ${candidate?.department || 'Computer Science & Engineering'}`,
        institution: 'National Institute of Technology',
        year: `Class of ${candidate?.batch || '2025'}`,
        cgpa: `${candidate?.cgpa || '8.7'} / 10`,
      },
    ],
    experience: [
      {
        role: `${candidate?.role || 'Software Engineering'} Intern`,
        company: `${candidate?.company || 'TechCorp'} Partner Lab`,
        duration: 'May 2024 – Jul 2024',
        points: [
          `Developed and tested core features using ${candidateSkills.slice(0, 2).join(' and ')}, enhancing overall efficiency.`,
          'Collaborated closely with cross-functional engineering teams to implement high-impact feature specifications.',
          'Built robust test suites and automated deployment workflows reducing release cycle delays.',
        ],
      },
    ],
    skills: candidateSkills,
    projects: DUMMY_RESUME.projects,
    achievements: [
      `Maintained stellar academic standing with ${candidate?.cgpa || '8.7'} CGPA in ${candidate?.department || 'Engineering'}`,
      ...DUMMY_RESUME.achievements.slice(0, 2),
    ],
  };

  const handleDownload = () => {
    const resumeText = `============================================================
${(resume.name || 'CANDIDATE').toUpperCase()}
${resume.title}
============================================================
Email:    ${resume.contact.email}
Phone:    ${resume.contact.phone}
LinkedIn: ${resume.contact.linkedin}
Location: ${resume.contact.location}

------------------------------------------------------------
1. PROFESSIONAL SUMMARY
------------------------------------------------------------
${resume.summary}

------------------------------------------------------------
2. EDUCATION
------------------------------------------------------------
${resume.education.map((e) => `${e.degree}\n${e.institution} | ${e.year} | CGPA: ${e.cgpa}`).join('\n\n')}

------------------------------------------------------------
3. WORK EXPERIENCE & INTERNSHIPS
------------------------------------------------------------
${resume.experience
  .map(
    (ex) =>
      `${ex.role} — ${ex.company} (${ex.duration})\n` +
      ex.points.map((p) => `  * ${p}`).join('\n')
  )
  .join('\n\n')}

------------------------------------------------------------
4. TECHNICAL SKILLS
------------------------------------------------------------
${resume.skills.join(', ')}

------------------------------------------------------------
5. KEY PROJECTS
------------------------------------------------------------
${resume.projects
  .map((p) => `${p.name} [Technologies: ${p.tech}]\n  ${p.desc}`)
  .join('\n\n')}

------------------------------------------------------------
6. ACHIEVEMENTS & CERTIFICATIONS
------------------------------------------------------------
${resume.achievements.map((a) => `  * ${a}`).join('\n')}

============================================================
Generated from CareerNest Alumni Referral Portal
============================================================`;

    const blob = new Blob([resumeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = (resume.name || 'Candidate').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `${cleanName}_Resume.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resume.name} - Resume</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; padding: 40px; margin: 0; }
            h1 { font-size: 24px; margin: 0 0 4px; color: #0f172a; }
            .title { font-size: 15px; color: #e76a00; font-weight: 600; margin-bottom: 8px; }
            .contact { font-size: 12px; color: #64748b; margin-bottom: 20px; border-bottom: 2px solid #e76a00; padding-bottom: 12px; }
            h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #e76a00; border-bottom: 1px solid #fed7aa; padding-bottom: 4px; margin-top: 18px; margin-bottom: 8px; }
            .section-item { margin-bottom: 12px; }
            .item-header { font-weight: 600; font-size: 14px; }
            .item-sub { font-size: 12px; color: #64748b; margin-bottom: 4px; }
            ul { margin: 4px 0 0 20px; padding: 0; }
            li { margin-bottom: 3px; font-size: 13px; color: #475569; }
            .skills-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
            .skill-pill { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${resume.name}</h1>
          <div class="title">${resume.title}</div>
          <div class="contact">
            Email: ${resume.contact.email} &bull; Phone: ${resume.contact.phone} &bull; Location: ${resume.contact.location} &bull; LinkedIn: ${resume.contact.linkedin}
          </div>
          <h2>Professional Summary</h2>
          <p style="font-size: 13px; color: #475569;">${resume.summary}</p>
          <h2>Education</h2>
          ${resume.education
            .map(
              (e) => `
            <div class="section-item">
              <div class="item-header">${e.degree}</div>
              <div class="item-sub">${e.institution} | ${e.year} | CGPA: ${e.cgpa}</div>
            </div>
          `
            )
            .join('')}
          <h2>Experience</h2>
          ${resume.experience
            .map(
              (ex) => `
            <div class="section-item">
              <div class="item-header">${ex.role} &mdash; ${ex.company}</div>
              <div class="item-sub">${ex.duration}</div>
              <ul>${ex.points.map((p) => `<li>${p}</li>`).join('')}</ul>
            </div>
          `
            )
            .join('')}
          <h2>Technical Skills</h2>
          <div class="skills-wrap">
            ${resume.skills.map((s) => `<span class="skill-pill">${s}</span>`).join('')}
          </div>
          <h2>Projects</h2>
          ${resume.projects
            .map(
              (p) => `
            <div class="section-item">
              <div class="item-header">${p.name} <span style="font-size: 12px; font-weight: normal; color: #64748b;">(${p.tech})</span></div>
              <div style="font-size: 13px; color: #475569;">${p.desc}</div>
            </div>
          `
            )
            .join('')}
          <h2>Achievements</h2>
          <ul>${resume.achievements.map((a) => `<li>${a}</li>`).join('')}</ul>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div
      className="resume-modal-overlay"
      style={{ display: 'flex' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="resume-modal" style={{ maxWidth: '760px', width: '95%' }}>
        {/* Modal Header */}
        <div className="resume-modal-header">
          <div className="resume-modal-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e76a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>{resume.name} — Resume</span>
          </div>
          <div className="resume-modal-actions-top">
            <button
              type="button"
              className="resume-download-btn"
              onClick={handleDownload}
              title="Download Resume (.txt)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download</span>
            </button>
            <button
              type="button"
              className="resume-print-btn"
              onClick={handlePrint}
              title="Print or Save as PDF"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              className="resume-modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Inline Resume */}
        <div
          className="resume-modal-body"
          style={{ padding: '24px 28px', overflowY: 'auto', maxHeight: '75vh', fontSize: '14px', lineHeight: 1.6, color: '#1e293b' }}
        >
          {/* Header */}
          <div style={{ borderBottom: '2px solid #e76a00', paddingBottom: '14px', marginBottom: '18px' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>{resume.name}</div>
            <div style={{ fontSize: '14px', color: '#e76a00', fontWeight: 600, marginBottom: '8px' }}>{resume.title}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '12px', color: '#64748b' }}>
              <span>📧 {resume.contact.email}</span>
              <span>📞 {resume.contact.phone}</span>
              <span>🔗 {resume.contact.linkedin}</span>
              <span>📍 {resume.contact.location}</span>
            </div>
          </div>

          {/* Summary */}
          <Section title="Summary">
            <p style={{ color: '#475569' }}>{resume.summary}</p>
          </Section>

          {/* Education */}
          <Section title="Education">
            {resume.education.map((e, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <div style={{ fontWeight: 600 }}>{e.degree}</div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>{e.institution} &nbsp;|&nbsp; {e.year} &nbsp;|&nbsp; CGPA: {e.cgpa}</div>
              </div>
            ))}
          </Section>

          {/* Experience */}
          <Section title="Experience">
            {resume.experience.map((ex, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 600 }}>{ex.role} <span style={{ color: '#64748b', fontWeight: 400 }}>@ {ex.company}</span></div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{ex.duration}</div>
                <ul style={{ paddingLeft: '18px', margin: 0 }}>
                  {ex.points.map((p, j) => (
                    <li key={j} style={{ color: '#475569', marginBottom: '4px' }}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>

          {/* Skills */}
          <Section title="Skills">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {resume.skills.map((s, i) => (
                <span
                  key={i}
                  style={{
                    background: '#f1f5f9',
                    color: '#334155',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 500,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </Section>

          {/* Projects */}
          <Section title="Projects">
            {resume.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 600 }}>{p.name} <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 400 }}>({p.tech})</span></div>
                <div style={{ color: '#475569', fontSize: '13px' }}>{p.desc}</div>
              </div>
            ))}
          </Section>

          {/* Achievements */}
          <Section title="Achievements">
            <ul style={{ paddingLeft: '18px', margin: 0 }}>
              {resume.achievements.map((a, i) => (
                <li key={i} style={{ color: '#475569', marginBottom: '4px' }}>{a}</li>
              ))}
            </ul>
          </Section>

          
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: '#e76a00',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '8px',
          borderBottom: '1px solid #fed7aa',
          paddingBottom: '4px',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
