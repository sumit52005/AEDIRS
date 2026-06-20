// ─── AEDIRS In-Memory Data Store ─────────────────────────────────────────────
// In a production build, every read/write here is replaced by API calls to FastAPI + PostgreSQL.
// This store lets the frontend demo run fully offline.

export const store = {
  users: [
    { id: 1, name: 'Priya Sharma',       email: 'citizen@demo.com',  password: 'demo123', role: 'citizen',     phone: '9876543210' },
    { id: 2, name: 'Fire Team A',         email: 'rescue@demo.com',   password: 'demo123', role: 'rescue_team', phone: '9876543211', teamType: 'Fire' },
    { id: 3, name: 'Supt. Rajesh Kumar', email: 'auth@demo.com',     password: 'demo123', role: 'authority',   phone: '9876543212' },
  ],

  incidents: [
    { id: 1, title: 'Flood near Pune Station',          description: '30 people stranded, water level rising fast, trapped under bridge', category: 'Flood',             priority: 'P1', status: 'In Progress', lat: 18.5204, lng: 73.8567, location: 'Pune Station Area',        reportedBy: 1, assignedTeam: 'Flood Rescue A', eta: 8,  createdAt: '2025-01-15 09:23' },
    { id: 2, title: 'Building collapse at MG Road',     description: '3-storey building collapsed, people trapped under rubble',           category: 'Building Collapse', priority: 'P1', status: 'Assigned',    lat: 18.5314, lng: 73.8446, location: 'MG Road',                 reportedBy: 1, assignedTeam: 'NDRF Team A',   eta: 12, createdAt: '2025-01-15 10:05' },
    { id: 3, title: 'Vehicle fire on expressway',       description: 'Truck burning on Mumbai-Pune expressway, smoke spreading, urgent',   category: 'Fire',             priority: 'P2', status: 'Verified',    lat: 18.5089, lng: 73.8729, location: 'Mumbai-Pune Expressway',   reportedBy: 1, assignedTeam: 'Fire Team A',   eta: 6,  createdAt: '2025-01-15 10:45' },
    { id: 4, title: 'Road accident at Hinjewadi',       description: 'Multiple vehicles, 2 people unconscious, need ambulance urgently',   category: 'Road Accident',    priority: 'P2', status: 'In Progress', lat: 18.5890, lng: 73.7370, location: 'Hinjewadi IT Park',        reportedBy: 1, assignedTeam: 'Ambulance A',   eta: 5,  createdAt: '2025-01-15 11:12' },
    { id: 5, title: 'Medical emergency Baner',          description: 'Heart attack patient, unconscious, needs immediate medical attention', category: 'Medical Emergency', priority: 'P1', status: 'Assigned',    lat: 18.5590, lng: 73.7890, location: 'Baner Road',               reportedBy: 1, assignedTeam: 'Ambulance A',   eta: 4,  createdAt: '2025-01-15 11:30' },
    { id: 6, title: 'Waterlogging Kothrud',             description: 'Minor waterlogging, some property damage, no injuries reported',      category: 'Flood',             priority: 'P4', status: 'Resolved',    lat: 18.5074, lng: 73.8077, location: 'Kothrud',                   reportedBy: 1, assignedTeam: 'Flood Rescue A', eta: 0,  createdAt: '2025-01-14 08:00' },
  ],

  teams: [
    { id: 1, name: 'Fire Team A',    type: 'Fire',    lat: 18.5204, lng: 73.8567, status: 'On Route',  members: 6 },
    { id: 2, name: 'Ambulance A',    type: 'Medical', lat: 18.5314, lng: 73.8446, status: 'Busy',      members: 3 },
    { id: 3, name: 'Flood Rescue A', type: 'Flood',   lat: 18.5089, lng: 73.8729, status: 'On Route',  members: 8 },
    { id: 4, name: 'NDRF Team A',    type: 'Multi',   lat: 18.5400, lng: 73.8700, status: 'Busy',      members: 12 },
    { id: 5, name: 'Fire Team B',    type: 'Fire',    lat: 18.5600, lng: 73.8200, status: 'Available', members: 6 },
    { id: 6, name: 'Ambulance B',    type: 'Medical', lat: 18.5100, lng: 73.8900, status: 'Available', members: 3 },
  ],

  nextId: 7,

  // ── Mutations ──────────────────────────────────────────────────────────────

  addIncident(inc) {
    const newInc = { ...inc, id: this.nextId++ };
    this.incidents.unshift(newInc);
    return newInc;
  },

  updateIncidentStatus(id, status) {
    const inc = this.incidents.find(i => i.id === id);
    if (inc) { inc.status = status; inc.updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' '); }
    return inc;
  },

  assignTeamToIncident(incidentId, team, eta) {
    const inc = this.incidents.find(i => i.id === incidentId);
    if (inc) { inc.assignedTeam = team.name; inc.eta = eta; }
    const t = this.teams.find(t => t.id === team.id);
    if (t) t.status = 'On Route';
    return { inc, team: t };
  },

  setTeamStatus(teamId, status) {
    const t = this.teams.find(t => t.id === teamId);
    if (t) t.status = status;
    return t;
  },

  addUser(user) {
    const newUser = { ...user, id: this.users.length + 1, role: 'citizen' };
    this.users.push(newUser);
    return newUser;
  },

  findUser(email, password) {
    return this.users.find(u => u.email === email && u.password === password) || null;
  },

  getStats() {
    const total     = this.incidents.length;
    const active    = this.incidents.filter(i => i.status !== 'Resolved').length;
    const resolved  = this.incidents.filter(i => i.status === 'Resolved').length;
    const critical  = this.incidents.filter(i => i.priority === 'P1' && i.status !== 'Resolved').length;
    const available = this.teams.filter(t => t.status === 'Available').length;
    return { total, active, resolved, critical, available };
  },
};
