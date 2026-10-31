export function filterOversightUsers(users, role, search = '', branch = '') {
  const query = search.trim().toLocaleLowerCase();
  return users.filter((user) => user.role === role &&
    (role !== 'candidate' || !branch || user.branch.toLocaleLowerCase() === branch.toLocaleLowerCase()) &&
    [user.name, user.email, user.roll, user.branch, user.company, user.batch, user.cgpa].some((value) => String(value ?? '').toLocaleLowerCase().includes(query)))
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base', numeric: true }) || a.email.localeCompare(b.email));
}

export function validateUserForm(form, role, users, policy) {
  const errors = {};
  const name = form.name.trim(), email = form.email.trim().toLowerCase();
  if (name.length < 2 || name.length > 100 || (name.match(/\p{L}/gu) || []).length < 2 || !/^[\p{L}][\p{L}\p{M} .'-]*$/u.test(name)) errors.name = 'Enter a name with at least two letters (maximum 100 characters).';
  const [local, domain] = email.split('@');
  if (email.length > 254 || !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email) || local?.startsWith('.') || local?.endsWith('.') || email.includes('..') || local?.length > 64 || domain?.split('.').some((part) => !part || part.length > 63 || part.startsWith('-') || part.endsWith('-'))) errors.email = 'Enter a valid email address, such as name@example.com.';
  else if (users.some((u) => u.email.toLowerCase() === email)) errors.email = 'This email already belongs to a user.';
  else if (role === 'candidate' && policy && email.split('@')[1] !== policy.studentEmailDomain) errors.email = `Use an @${policy.studentEmailDomain} email address.`;
  if (role === 'candidate') {
    const roll = form.rollNumber.trim().toUpperCase();
    const selectedBranch = policy?.branches.find((b) => b.name === form.department);
    const parts = roll.match(/^B(\d{2})(CS|IT|EC|EE|ME|CV)(\d{3})$/);
    if (!parts || Number(parts[1]) > new Date().getFullYear() % 100 || Number(parts[3]) === 0 || (selectedBranch && parts[2] !== selectedBranch.code)) errors.rollNumber = `Use ${policy?.rollExample || 'B26CS001'} format with your branch code and admission year.`;
    else if (users.some((u) => u.roll?.toUpperCase() === roll)) errors.rollNumber = 'This roll number already exists.';
    if (!selectedBranch) errors.department = 'Select a branch from the list.';
    if (!/^\d+(\.\d{1,2})?$/.test(form.cgpa) || Number(form.cgpa) > 10) errors.cgpa = 'Enter CGPA from 0 to 10 with at most two decimals.';
    if (!/^\d+$/.test(form.backlogs) || Number(form.backlogs) > 50) errors.backlogs = 'Enter a whole number from 0 to 50.';
  } else {
    const company = form.company.trim();
    if (company.length < 2 || company.length > 100 || !/\p{L}/u.test(company) || /[<>\r\n]/.test(company)) errors.company = 'Enter a valid company name containing letters (2–100 characters).';
    if (!/^\d{4}$/.test(form.batch) || Number(form.batch) < 1990 || Number(form.batch) > new Date().getFullYear()) errors.batch = `Enter a graduation year from 1990 to ${new Date().getFullYear()}.`;
    if (!/^\d+$/.test(form.referrals) || Number(form.referrals) > 10) errors.referrals = 'Enter a whole number from 0 to 10.';
    for (const key of ['headline', 'location']) {
      if (form[key]?.trim() && (form[key].trim().length > 100 || !/\p{L}/u.test(form[key]) || /[<>\r\n]/.test(form[key]))) errors[key] = 'Enter valid text containing letters (maximum 100 characters).';
    }
  }
  return errors;
}
