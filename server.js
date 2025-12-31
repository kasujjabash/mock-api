const express = require('express');
const cors = require('cors');
const { createServer, Model, Response } = require('miragejs');

// Import seed data
const groupsData = require('./data/seed-groups');
const contactsData = require('./data/seed-contacts');
const reportsData = require('./data/seed-reports');
const {
  generateMCSubmissions,
  generateServiceSubmissions,
  generateBaptismSubmissions,
  generateSalvationSubmissions,
} = require('./data/seed-submissions');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Test user accounts
const TEST_USERS = [
  {
    id: 151,
    username: "fellowship@worshipharvest.org",
    password: "password123",
    contactId: 1,
    fullName: "Emmanuel Okello",
    email: "fellowship@worshipharvest.org",
    roles: ["MC Shepherd"],
    permissions: ["REPORT_VIEW", "REPORT_SUBMIT", "CRM_VIEW", "CRM_EDIT"],
    manageGroupIds: [100],
    viewGroupIds: [100, 20],
  },
  {
    id: 152,
    username: "zone@worshipharvest.org",
    password: "password123",
    contactId: 1,
    fullName: "Zone Leader North",
    email: "zone@worshipharvest.org",
    roles: ["Zone Leader"],
    permissions: ["REPORT_VIEW", "REPORT_SUBMIT", "REPORT_VIEW_SUBMISSIONS", "CRM_VIEW", "CRM_EDIT", "GROUP_VIEW"],
    manageGroupIds: [20, 100, 101, 102, 103, 104],
    viewGroupIds: [20, 100, 101, 102, 103, 104, 10],
  },
  {
    id: 153,
    username: "location@worshipharvest.org",
    password: "password123",
    contactId: 1,
    fullName: "Location Pastor Kampala",
    email: "location@worshipharvest.org",
    roles: ["Location Pastor"],
    permissions: ["REPORT_VIEW", "REPORT_SUBMIT", "REPORT_VIEW_SUBMISSIONS", "CRM_VIEW", "CRM_EDIT", "GROUP_VIEW", "GROUP_EDIT"],
    manageGroupIds: [10, 20, 21, 22, 23, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119],
    viewGroupIds: [10, 20, 21, 22, 23, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 4],
  },
  {
    id: 154,
    username: "fob@worshipharvest.org",
    password: "password123",
    contactId: 1,
    fullName: "FOB Leader East Africa",
    email: "fob@worshipharvest.org",
    roles: ["FOB Leader"],
    permissions: ["REPORT_VIEW", "REPORT_SUBMIT", "REPORT_VIEW_SUBMISSIONS", "CRM_VIEW", "CRM_EDIT", "GROUP_VIEW", "GROUP_EDIT"],
    manageGroupIds: [4, 10, 11, 12],
    viewGroupIds: [4, 10, 11, 12, 2],
  },
  {
    id: 155,
    username: "network@worshipharvest.org",
    password: "password123",
    contactId: 1,
    fullName: "Network Leader Africa",
    email: "network@worshipharvest.org",
    roles: ["Network Leader"],
    permissions: ["REPORT_VIEW", "REPORT_SUBMIT", "REPORT_VIEW_SUBMISSIONS", "CRM_VIEW", "CRM_EDIT", "GROUP_VIEW", "GROUP_EDIT", "USER_VIEW"],
    manageGroupIds: [2, 4, 10, 11, 12],
    viewGroupIds: [2, 4, 10, 11, 12, 1],
  },
  {
    id: 156,
    username: "movement@worshipharvest.org",
    password: "password123",
    contactId: 1,
    fullName: "Movement Leader Global",
    email: "movement@worshipharvest.org",
    roles: ["Movement Leader"],
    permissions: ["REPORT_VIEW", "REPORT_SUBMIT", "REPORT_VIEW_SUBMISSIONS", "CRM_VIEW", "CRM_EDIT", "GROUP_VIEW", "GROUP_EDIT", "USER_VIEW", "USER_EDIT"],
    manageGroupIds: [1, 2, 3, 4, 5],
    viewGroupIds: [1, 2, 3, 4, 5],
  },
  {
    id: 157,
    username: "admin@worshipharvest.org",
    password: "password123",
    contactId: 1,
    fullName: "System Administrator",
    email: "admin@worshipharvest.org",
    roles: ["RoleAdmin"],
    permissions: [
      "ROLE_EDIT", "USER_VIEW", "USER_EDIT", "GROUP_EDIT", "GROUP_VIEW",
      "EVENT_EDIT", "EVENT_VIEW", "REPORT_VIEW_SUBMISSIONS", "DASHBOARD",
      "CRM_VIEW", "CRM_EDIT", "TAG_VIEW", "TAG_EDIT", "REPORT_VIEW",
      "REPORT_EDIT", "REPORT_SUBMIT",
    ],
    manageGroupIds: [1, 2, 3, 4, 5],
    viewGroupIds: [1, 2, 3, 4, 5],
  },
];

// Initialize in-memory database
let DB = {
  contacts: [],
  groups: [],
  reports: [],
  submissions: [],
  users: TEST_USERS,
};

// Seed database
function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Seed groups
  const allGroups = [
    groupsData.movement,
    ...groupsData.networks,
    ...groupsData.fobs,
    ...groupsData.locations,
    ...groupsData.zones,
    ...groupsData.fellowships,
  ];
  DB.groups = allGroups;

  // Seed contacts
  DB.contacts = contactsData;

  // Seed reports
  DB.reports = reportsData;

  // Seed submissions
  const mcSubmissions = generateMCSubmissions();
  const serviceSubmissions = generateServiceSubmissions();
  const baptismSubmissions = generateBaptismSubmissions();
  const salvationSubmissions = generateSalvationSubmissions();
  DB.submissions = [...mcSubmissions, ...serviceSubmissions, ...baptismSubmissions, ...salvationSubmissions];

  console.log(`✅ Seeded: ${DB.contacts.length} contacts, ${DB.groups.length} groups, ${DB.reports.length} reports, ${DB.submissions.length} submissions`);
}

seedDatabase();

// Helper to simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simple root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Project Zoe Mock API Server',
    version: '1.0.0',
    documentation: '/docs',
    endpoints: {
      auth: '/api/auth/*',
      groups: '/api/groups/*',
      contacts: '/api/crm/contacts/*',
      reports: '/api/reports/*',
      dashboard: '/api/dashboard/*',
    },
    testUsers: TEST_USERS.map(u => ({
      username: u.username,
      password: 'password123',
      role: u.roles[0],
    })),
  });
});

app.get('/docs', (req, res) => {
  res.json({
    message: 'API Documentation',
    baseUrl: `http://localhost:${PORT}/api`,
    testAccounts: TEST_USERS.map(u => ({
      username: u.username,
      password: 'password123',
      role: u.roles[0],
      accessLevel: u.fullName,
    })),
  });
});

// ============ AUTHENTICATION ============
app.post('/api/auth/login', async (req, res) => {
  await delay(400);
  
  const { username, password, churchName } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  const user = TEST_USERS.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Build hierarchy based on user's access
  const myGroups = DB.groups
    .filter(g => user.manageGroupIds.includes(g.id))
    .map(g => ({
      id: g.id,
      name: g.name,
      type: g.type,
      categoryId: g.categoryId,
      categoryName: g.categoryName,
      role: 'Leader',
      parentId: g.parentId,
      memberCount: g.memberCount,
    }));

  res.json({
    token: `mock_jwt_${user.id}_${Date.now()}`,
    refreshToken: `mock_refresh_${user.id}_${Date.now()}`,
    expiresIn: 604800,
    user: {
      id: user.id,
      contactId: user.contactId,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      avatar: `https://i.pravatar.cc/200?img=${user.id}`,
      isActive: true,
      roles: user.roles,
      permissions: user.permissions,
    },
    hierarchy: {
      myGroups,
      canManageGroupIds: user.manageGroupIds,
      canViewGroupIds: user.viewGroupIds,
    },
  });
});

app.post('/api/auth/refresh', async (req, res) => {
  await delay(400);
  res.json({
    token: `new_mock_jwt_${Date.now()}`,
    refreshToken: `new_refresh_${Date.now()}`,
    expiresIn: 604800,
  });
});

app.post('/api/auth/logout', async (req, res) => {
  await delay(400);
  res.status(204).send();
});

app.get('/api/auth/me', async (req, res) => {
  await delay(400);
  const user = TEST_USERS[0];
  res.json({
    id: user.id,
    contactId: user.contactId,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    avatar: `https://i.pravatar.cc/200?img=${user.id}`,
    isActive: true,
    roles: user.roles,
    permissions: user.permissions,
  });
});

// ============ GROUPS ============
app.get('/api/groups', async (req, res) => {
  await delay(400);
  
  res.json({
    groups: DB.groups.map(g => ({
      id: g.id,
      name: g.name,
      type: g.type,
      categoryId: g.categoryId,
      categoryName: g.categoryName,
      privacy: g.privacy,
      parentId: g.parentId,
      memberCount: g.memberCount,
      activeMembers: Math.floor(g.memberCount * 0.9),
      details: g.details,
      metaData: g.metaData,
    })),
    summary: {
      totalGroups: DB.groups.length,
      totalMembers: DB.groups.reduce((sum, g) => sum + g.memberCount, 0),
    },
  });
});

app.get('/api/groups/me', async (req, res) => {
  await delay(400);
  const user = TEST_USERS[0];
  const groups = DB.groups.filter(g => user.manageGroupIds.includes(g.id));

  res.json({
    groups: groups.map(g => ({
      id: g.id,
      name: g.name,
      type: g.type,
      categoryId: g.categoryId,
      categoryName: g.categoryName,
      role: 'Leader',
      privacy: g.privacy,
      parentId: g.parentId,
      memberCount: g.memberCount,
      activeMembers: Math.floor(g.memberCount * 0.9),
      details: g.details,
      metaData: g.metaData,
    })),
    summary: {
      totalGroups: groups.length,
      totalMembers: groups.reduce((sum, g) => sum + g.memberCount, 0),
    },
  });
});

app.get('/api/groups/:id', async (req, res) => {
  await delay(400);
  const group = DB.groups.find(g => g.id === parseInt(req.params.id));
  
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  const parent = group.parentId ? DB.groups.find(g => g.id === group.parentId) : null;

  res.json({
    id: group.id,
    name: group.name,
    type: group.type,
    categoryId: group.categoryId,
    categoryName: group.categoryName,
    privacy: group.privacy,
    details: group.details,
    parentId: group.parentId,
    parent: parent ? { id: parent.id, name: parent.name } : null,
    memberCount: group.memberCount,
    activeMembers: Math.floor(group.memberCount * 0.9),
    address: group.address,
    metaData: group.metaData,
  });
});

app.get('/api/groups/:id/members', async (req, res) => {
  await delay(400);
  const groupId = parseInt(req.params.id);
  const { limit = 50, offset = 0 } = req.query;

  const contacts = DB.contacts.filter(c => c.groupId === groupId);
  const paginatedContacts = contacts.slice(offset, offset + parseInt(limit));

  res.json({
    members: paginatedContacts.map(c => ({
      id: c.id,
      contactId: c.id,
      name: `${c.firstName} ${c.lastName}`,
      firstName: c.firstName,
      lastName: c.lastName,
      avatar: `https://i.pravatar.cc/200?img=${c.id}`,
      phone: c.phone,
      email: c.email,
      role: c.role || 'Member',
      ageGroup: c.ageGroup,
      gender: c.gender,
      isActive: true,
      groupId: c.groupId,
    })),
    pagination: {
      total: contacts.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: offset + parseInt(limit) < contacts.length,
    },
  });
});

app.get('/api/groups/categories', async (req, res) => {
  await delay(400);
  res.json({
    categories: [
      { id: 1, name: 'Missional Community', groupCount: 46 },
      { id: 2, name: 'Zone', groupCount: 13 },
      { id: 3, name: 'Location', groupCount: 4 },
      { id: 4, name: 'Forward Operating Base', groupCount: 2 },
      { id: 5, name: 'Network', groupCount: 2 },
      { id: 6, name: 'Movement', groupCount: 1 },
    ],
  });
});

// ============ CONTACTS/CRM ============
app.get('/api/crm/contacts', async (req, res) => {
  await delay(400);
  const { limit = 50, offset = 0, search, groupId } = req.query;
  let contacts = [...DB.contacts];

  if (search) {
    const searchLower = search.toLowerCase();
    contacts = contacts.filter(c =>
      c.firstName.toLowerCase().includes(searchLower) ||
      c.lastName.toLowerCase().includes(searchLower) ||
      (c.email && c.email.toLowerCase().includes(searchLower))
    );
  }

  if (groupId) {
    contacts = contacts.filter(c => c.groupId === parseInt(groupId));
  }

  const paginatedContacts = contacts.slice(offset, offset + parseInt(limit));

  res.json({
    contacts: paginatedContacts.map(c => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      firstName: c.firstName,
      lastName: c.lastName,
      avatar: `https://i.pravatar.cc/200?img=${c.id}`,
      email: c.email,
      phone: c.phone,
      ageGroup: c.ageGroup,
      gender: c.gender,
      dateOfBirth: c.dateOfBirth,
      isActive: true,
      primaryGroup: {
        id: c.groupId,
        name: DB.groups.find(g => g.id === c.groupId)?.name || 'Unknown',
        role: c.role || 'Member',
      },
    })),
    pagination: {
      total: contacts.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: offset + parseInt(limit) < contacts.length,
    },
  });
});

app.get('/api/crm/contacts/:id', async (req, res) => {
  await delay(400);
  const contact = DB.contacts.find(c => c.id === parseInt(req.params.id));
  
  if (!contact) {
    return res.status(404).json({ message: 'Contact not found' });
  }

  const group = DB.groups.find(g => g.id === contact.groupId);

  res.json({
    id: contact.id,
    category: 'Person',
    person: {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      ageGroup: contact.ageGroup,
      gender: contact.gender,
      civilStatus: contact.civilStatus,
      placeOfWork: contact.placeOfWork,
      avatar: `https://i.pravatar.cc/200?img=${contact.id}`,
      dateOfBirth: contact.dateOfBirth,
    },
    emails: contact.email ? [{
      id: contact.id,
      category: 'Personal',
      value: contact.email,
      isPrimary: true,
    }] : [],
    phones: [{
      id: contact.id,
      category: 'Mobile',
      value: contact.phone,
      isPrimary: true,
    }],
    addresses: contact.country ? [{
      id: contact.id,
      category: 'Home',
      isPrimary: true,
      country: contact.country,
      district: contact.district,
      freeForm: contact.freeForm || '',
    }] : [],
    groupMemberships: [{
      id: contact.id,
      groupId: contact.groupId,
      role: contact.role || 'Member',
      group: {
        id: contact.groupId,
        name: group?.name || 'Unknown',
        categoryName: group?.categoryName || '',
      },
    }],
    identifications: [],
    relationships: [],
  });
});

app.post('/api/crm/contacts', async (req, res) => {
  await delay(400);
  const attrs = req.body;
  
  const newContact = {
    id: DB.contacts.length + 1,
    firstName: attrs.person.firstName,
    lastName: attrs.person.lastName,
    email: attrs.emails?.[0]?.value || null,
    phone: attrs.phones[0].value,
    gender: attrs.person.gender,
    ageGroup: attrs.person.ageGroup || '20-30',
    dateOfBirth: attrs.person.dateOfBirth || null,
    civilStatus: attrs.person.civilStatus || 'Single',
    placeOfWork: attrs.person.placeOfWork || null,
    groupId: attrs.groupMemberships[0].groupId,
    role: attrs.groupMemberships[0].role || 'Member',
    country: attrs.addresses?.[0]?.country || 'Uganda',
    district: attrs.addresses?.[0]?.district || 'Kampala',
  };

  DB.contacts.push(newContact);

  res.status(201).json({
    id: newContact.id,
    message: 'Contact created successfully',
    contact: {
      id: newContact.id,
      name: `${newContact.firstName} ${newContact.lastName}`,
      email: newContact.email,
      phone: newContact.phone,
    },
  });
});

app.patch('/api/crm/contacts/:id', async (req, res) => {
  await delay(400);
  const contact = DB.contacts.find(c => c.id === parseInt(req.params.id));
  
  if (!contact) {
    return res.status(404).json({ message: 'Contact not found' });
  }

  const attrs = req.body;
  
  if (attrs.person) {
    Object.assign(contact, attrs.person);
  }

  res.json({
    id: contact.id,
    message: 'Contact updated successfully',
    contact: {
      id: contact.id,
      name: `${contact.firstName} ${contact.lastName}`,
      email: contact.email,
      phone: contact.phone,
    },
  });
});

// ============ REPORTS ============
app.get('/api/reports', async (req, res) => {
  await delay(400);
  res.json({
    reports: DB.reports.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      submissionFrequency: r.submissionFrequency,
      active: r.active,
      status: r.status,
      targetGroupCategory: r.targetGroupCategory,
      fieldCount: r.fields.length,
    })),
  });
});

app.get('/api/reports/:id', async (req, res) => {
  await delay(400);
  const report = DB.reports.find(r => r.id === parseInt(req.params.id));
  
  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  res.json(report);
});

app.post('/api/reports/:reportId/submissions', async (req, res) => {
  await delay(400);
  const attrs = req.body;
  const reportId = parseInt(req.params.reportId);
  const report = DB.reports.find(r => r.id === reportId);

  const newSubmission = {
    id: Date.now(),
    reportId,
    reportName: report.name,
    groupId: attrs.groupId,
    groupName: DB.groups.find(g => g.id === attrs.groupId)?.name || 'Unknown',
    submittedAt: new Date().toISOString(),
    submittedBy: { id: 153, name: 'Test User' },
    data: attrs.data,
    canEdit: true,
  };

  DB.submissions.push(newSubmission);

  res.status(201).json(newSubmission);
});

app.get('/api/reports/submissions/me', async (req, res) => {
  await delay(400);
  const { reportId, limit = 20, offset = 0 } = req.query;
  let submissions = [...DB.submissions];

  if (reportId) {
    submissions = submissions.filter(s => s.reportId === parseInt(reportId));
  }

  submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const paginated = submissions.slice(offset, offset + parseInt(limit));

  res.json({
    submissions: paginated,
    pagination: {
      total: submissions.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: offset + parseInt(limit) < submissions.length,
    },
  });
});

app.get('/api/reports/submissions/team', async (req, res) => {
  await delay(400);
  const { reportId } = req.query;

  const fellowships = DB.groups.filter(g => 
    g.type === 'fellowship' && [20, 21, 22, 23].includes(g.parentId)
  );

  const submissions = fellowships.map(fellowship => {
    const recentSubmissions = DB.submissions
      .filter(s => s.groupId === fellowship.id && s.reportId === (reportId ? parseInt(reportId) : 1))
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    const recentSubmission = recentSubmissions[0];

    const isOverdue = !recentSubmission || 
      (new Date() - new Date(recentSubmission.submittedAt)) > (7 * 24 * 60 * 60 * 1000);

    return {
      groupId: fellowship.id,
      groupName: fellowship.name,
      categoryName: fellowship.categoryName,
      leaderName: 'Fellowship Leader',
      reportId: reportId ? parseInt(reportId) : 1,
      reportName: 'MC Attendance Report',
      reportFrequency: 'weekly',
      lastSubmission: recentSubmission ? {
        id: recentSubmission.id,
        submittedAt: recentSubmission.submittedAt,
        status: isOverdue ? 'overdue' : 'submitted',
        data: recentSubmission.data,
      } : null,
      status: isOverdue ? 'overdue' : 'submitted',
      daysOverdue: isOverdue && recentSubmission ? 
        Math.floor((new Date() - new Date(recentSubmission.submittedAt)) / (24 * 60 * 60 * 1000)) : 0,
    };
  });

  const submitted = submissions.filter(s => s.status === 'submitted').length;
  const overdue = submissions.filter(s => s.status === 'overdue').length;

  res.json({
    submissions,
    summary: {
      total: submissions.length,
      submitted,
      overdue,
      submissionRate: submitted / submissions.length,
    },
    pagination: {
      total: submissions.length,
      limit: 50,
      offset: 0,
      hasMore: false,
    },
  });
});

app.get('/api/reports/submissions/:id', async (req, res) => {
  await delay(400);
  const submission = DB.submissions.find(s => s.id === parseInt(req.params.id));
  
  if (!submission) {
    return res.status(404).json({ message: 'Submission not found' });
  }

  res.json(submission);
});

// ============ DASHBOARD ============
app.get('/api/dashboard/summary', async (req, res) => {
  await delay(400);
  const group = DB.groups.find(g => g.id === 100);
  const recentSubmissions = DB.submissions
    .filter(s => s.groupId === 100)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const thisWeek = recentSubmissions[0]?.data || {};
  const lastWeek = recentSubmissions[1]?.data || {};

  res.json({
    group: {
      id: group.id,
      name: group.name,
      type: group.type,
      memberCount: group.memberCount,
      activeMembers: Math.floor(group.memberCount * 0.9),
    },
    thisWeek: {
      attendance: thisWeek.smallGroupAttendanceCount || 0,
      visitors: 2,
      newMembers: 0,
      salvations: 0,
      baptisms: 0,
    },
    lastWeek: {
      attendance: lastWeek.smallGroupAttendanceCount || 0,
      visitors: 1,
    },
    trend: {
      attendanceChange: thisWeek.smallGroupAttendanceCount && lastWeek.smallGroupAttendanceCount 
        ? ((thisWeek.smallGroupAttendanceCount - lastWeek.smallGroupAttendanceCount) / lastWeek.smallGroupAttendanceCount * 100).toFixed(1)
        : 0,
      visitorsChange: 100.0,
    },
    pendingReports: [],
    recentActivity: [
      {
        type: 'report_submitted',
        description: 'Fellowship Report submitted',
        timestamp: recentSubmissions[0]?.submittedAt || new Date().toISOString(),
      },
    ],
  });
});

// ============ USERS ============
app.get('/api/users', async (req, res) => {
  await delay(400);
  res.json({
    users: TEST_USERS.slice(0, 5).map(u => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      avatar: `https://i.pravatar.cc/200?img=${u.id}`,
      contactId: u.contactId,
      roles: u.roles,
      isActive: true,
    })),
    pagination: {
      total: TEST_USERS.length,
      limit: 50,
      offset: 0,
      hasMore: false,
    },
  });
});

app.post('/api/users', async (req, res) => {
  await delay(400);
  
  const { contactId, password, roles, permissions, manageGroupIds, viewGroupIds } = req.body;

  if (!contactId || !password) {
    return res.status(400).json({ message: 'contactId and password are required' });
  }

  // Check if contact exists
  const contact = DB.contacts.find(c => c.id === contactId);
  if (!contact) {
    return res.status(404).json({ message: 'Contact not found' });
  }

  // Check if user already exists for this contact
  const existingUser = DB.users.find(u => u.contactId === contactId);
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists for this contact' });
  }

  // Generate new ID
  const newId = Math.max(...DB.users.map(u => u.id)) + 1;

  const newUser = {
    id: newId,
    username: contact.email,
    password,
    contactId,
    fullName: `${contact.firstName} ${contact.lastName}`,
    email: contact.email,
    roles: roles || [],
    permissions: permissions || [],
    manageGroupIds: manageGroupIds || [],
    viewGroupIds: viewGroupIds || [],
  };

  DB.users.push(newUser);

  res.status(201).json({
    id: newUser.id,
    username: newUser.username,
    fullName: newUser.fullName,
    email: newUser.email,
    avatar: `https://i.pravatar.cc/200?img=${newUser.id}`,
    contactId: newUser.contactId,
    roles: newUser.roles,
    permissions: newUser.permissions,
    isActive: true,
  });
});

app.patch('/api/users/:id', async (req, res) => {
  await delay(400);
  
  const userId = parseInt(req.params.id);
  const { password, roles, permissions, manageGroupIds, viewGroupIds } = req.body;

  // Find the user
  const user = DB.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Update allowed fields
  if (password !== undefined) {
    user.password = password;
  }
  if (roles !== undefined) {
    user.roles = roles;
  }
  if (permissions !== undefined) {
    user.permissions = permissions;
  }
  if (manageGroupIds !== undefined) {
    user.manageGroupIds = manageGroupIds;
  }
  if (viewGroupIds !== undefined) {
    user.viewGroupIds = viewGroupIds;
  }

  res.json({
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    avatar: `https://i.pravatar.cc/200?img=${user.id}`,
    contactId: user.contactId,
    roles: user.roles,
    permissions: user.permissions,
    isActive: true,
  });
});

// ============ SEARCH ============
app.get('/api/search', async (req, res) => {
  await delay(400);
  const { q, type = 'all', limit = 20 } = req.query;
  const searchLower = q.toLowerCase();

  const results = {
    contacts: [],
    groups: [],
  };

  if (type === 'all' || type === 'contacts') {
    results.contacts = DB.contacts
      .filter(c => 
        c.firstName.toLowerCase().includes(searchLower) ||
        c.lastName.toLowerCase().includes(searchLower)
      )
      .slice(0, limit)
      .map(c => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        type: 'contact',
        avatar: `https://i.pravatar.cc/200?img=${c.id}`,
        group: DB.groups.find(g => g.id === c.groupId)?.name || 'Unknown',
      }));
  }

  if (type === 'all' || type === 'groups') {
    results.groups = DB.groups
      .filter(g => g.name.toLowerCase().includes(searchLower))
      .slice(0, limit)
      .map(g => ({
        id: g.id,
        name: g.name,
        type: 'group',
        category: g.categoryName,
        memberCount: g.memberCount,
      }));
  }

  res.json({
    results,
    total: results.contacts.length + results.groups.length,
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Project Zoe Mock API Server');
  console.log('='.repeat(60));
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📚 Docs: http://localhost:${PORT}/docs`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log('\n📊 Loaded Data:');
  console.log(`   - ${DB.contacts.length} contacts`);
  console.log(`   - ${DB.groups.length} groups (6-level hierarchy)`);
  console.log(`   - ${DB.reports.length} report types`);
  console.log(`   - ${DB.submissions.length} submissions`);
  console.log('\n🔑 Test Accounts (password: password123):');
  TEST_USERS.forEach(u => {
    console.log(`   - ${u.username.padEnd(35)} [${u.roles[0]}]`);
  });
  console.log('='.repeat(60) + '\n');
});