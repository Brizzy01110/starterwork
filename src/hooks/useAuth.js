import { useState } from 'react';

const USERS_KEY   = 'mts_users';
const SESSION_KEY = 'mts_session';

// ── Role access map ────────────────────────────────────────────────────────────
// Controls which sidebar views are reachable per role
export const ROLE_ACCESS = {
  admin:    ['dashboard','table','board','charts','history','downtime','scorecard','health','pm','parts','handoff','wiring','safety','defects','accidents','mewp','users'],
  manager:  ['dashboard','table','board','charts','history','downtime','scorecard','health','pm','parts','handoff','wiring','safety','defects','accidents','mewp'],
  operator: ['dashboard','table','board','health','pm','handoff','wiring','safety','mewp'],
};

export const ROLE_LABELS = { admin: 'Admin', manager: 'Manager', operator: 'Operator' };
export const ROLE_COLORS = { admin: '#ef4444', manager: '#818cf8', operator: '#22c55e' };

// ── Default users seeded on first run ─────────────────────────────────────────
const DEFAULT_USERS = [
  { id: '1', username: 'admin',    password: 'Admin@123', name: 'Admin User',      role: 'admin',    position: 'System Administrator',   active: true },
  { id: '2', username: 'manager',  password: 'Mgr@123',   name: 'John Smith',      role: 'manager',  position: 'Maintenance Manager',     active: true },
  { id: '3', username: 'operator', password: 'Op@123',    name: 'Mike Johnson',    role: 'operator', position: 'Maintenance Technician',  active: true },
];

// ── Persistence helpers ────────────────────────────────────────────────────────
function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}

function saveUsers(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

function loadSession(users) {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { id } = JSON.parse(raw);
    return users.find((u) => u.id === id && u.active) || null;
  } catch {
    return null;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const [users, setUsers] = useState(loadUsers);
  const [currentUser, setCurrentUser] = useState(() => loadSession(loadUsers()));

  function login(username, password) {
    const allUsers = loadUsers();
    const user = allUsers.find(
      (u) => u.username === username && u.password === password && u.active
    );
    if (!user) return { error: 'Invalid username or password.' };
    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id }));
    return { user };
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  }

  function addUser(data) {
    const newUser = {
      id: Date.now().toString(),
      username: data.username,
      password: data.password,
      name:     data.name,
      role:     data.role,
      position: data.position || '',
      active:   true,
    };
    const updated = [...users, newUser];
    setUsers(updated);
    saveUsers(updated);
    return newUser;
  }

  function updateUser(id, changes) {
    const updated = users.map((u) => (u.id === id ? { ...u, ...changes } : u));
    setUsers(updated);
    saveUsers(updated);
    if (currentUser?.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...changes }));
    }
  }

  function deleteUser(id) {
    if (id === currentUser?.id) return; // cannot delete yourself
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    saveUsers(updated);
  }

  return { currentUser, users, login, logout, addUser, updateUser, deleteUser };
}
