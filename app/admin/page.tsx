"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, getAllUsers, deleteUser, logout, seedAdmin, type User } from "@/lib/auth";

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    seedAdmin();
    const s = getSession();
    if (!s) { router.replace("/auth"); return; }
    if (s.role !== "admin") { router.replace("/"); return; }
    setSession(s);
    setUsers(getAllUsers());
    setLoading(false);
  }, [router]);

  function refreshUsers() {
    setUsers(getAllUsers());
  }

  function handleDelete(id: string) {
    if (id === "admin-001") return; // protect admin
    deleteUser(id);
    refreshUsers();
    setDeleteConfirm(null);
  }

  function handleLogout() {
    logout();
    router.replace("/auth");
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    members: users.filter((u) => u.role === "user").length,
  };

  if (loading) {
    return (
      <div className="adm-loading">
        <div className="adm-spinner" />
      </div>
    );
  }

  return (
    <div className="adm-root">
      {/* Background */}
      <div className="adm-bg">
        <div className="adm-orb adm-orb-1" />
        <div className="adm-orb adm-orb-2" />
        <div className="adm-grid" />
      </div>

      {/* Sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-logo">
          <span className="adm-logo-icon">✦</span>
          <span className="adm-logo-text">AI Builder</span>
        </div>

        <nav className="adm-nav">
          <button className="adm-nav-item adm-nav-active" id="nav-dashboard">
            <span>📊</span> Dashboard
          </button>
          <button
            className="adm-nav-item"
            id="nav-builder"
            onClick={() => router.push("/")}
          >
            <span>🚀</span> Website Builder
          </button>
        </nav>

        <div className="adm-sidebar-bottom">
          <div className="adm-user-chip">
            <div className="adm-avatar">{session?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="adm-user-name">{session?.name}</div>
              <div className="adm-user-role">Administrator</div>
            </div>
          </div>
          <button id="adm-logout" className="adm-logout-btn" onClick={handleLogout}>
            ↩ Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="adm-main">
        {/* Header */}
        <div className="adm-header">
          <div>
            <h1 className="adm-page-title">Admin Dashboard</h1>
            <p className="adm-page-sub">Manage users and platform overview</p>
          </div>
          <div className="adm-header-badge">
            <span>👑</span> Admin Panel
          </div>
        </div>

        {/* Stats */}
        <div className="adm-stats">
          <div className="adm-stat-card adm-stat-purple">
            <div className="adm-stat-icon">👥</div>
            <div className="adm-stat-num">{stats.total}</div>
            <div className="adm-stat-label">Total Users</div>
          </div>
          <div className="adm-stat-card adm-stat-blue">
            <div className="adm-stat-icon">👑</div>
            <div className="adm-stat-num">{stats.admins}</div>
            <div className="adm-stat-label">Admins</div>
          </div>
          <div className="adm-stat-card adm-stat-green">
            <div className="adm-stat-icon">🙋</div>
            <div className="adm-stat-num">{stats.members}</div>
            <div className="adm-stat-label">Members</div>
          </div>
        </div>

        {/* Users Table */}
        <div className="adm-table-card">
          <div className="adm-table-header">
            <h2 className="adm-table-title">All Users</h2>
            <input
              id="adm-search"
              type="text"
              placeholder="🔍  Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-search"
            />
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="adm-empty">No users found</td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id} className="adm-row">
                      <td>
                        <div className="adm-user-cell">
                          <div
                            className={`adm-table-avatar ${user.role === "admin" ? "adm-avatar-admin" : "adm-avatar-user"}`}
                          >
                            {user.name[0]?.toUpperCase()}
                          </div>
                          <span className="adm-cell-name">{user.name}</span>
                        </div>
                      </td>
                      <td className="adm-cell-email">{user.email}</td>
                      <td>
                        <span className={`adm-role-badge ${user.role === "admin" ? "adm-role-admin" : "adm-role-user"}`}>
                          {user.role === "admin" ? "👑 Admin" : "🙋 Member"}
                        </span>
                      </td>
                      <td className="adm-cell-date">
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                      <td>
                        {user.id !== "admin-001" ? (
                          deleteConfirm === user.id ? (
                            <div className="adm-confirm-wrap">
                              <button
                                className="adm-btn-danger"
                                onClick={() => handleDelete(user.id)}
                              >
                                Confirm
                              </button>
                              <button
                                className="adm-btn-cancel"
                                onClick={() => setDeleteConfirm(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="adm-btn-delete"
                              onClick={() => setDeleteConfirm(user.id)}
                            >
                              🗑 Delete
                            </button>
                          )
                        ) : (
                          <span className="adm-protected">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .adm-loading {
          min-height: 100vh; background: #060608;
          display: flex; align-items: center; justify-content: center;
        }
        .adm-spinner {
          width: 40px; height: 40px;
          border: 3px solid rgba(108,59,255,0.3);
          border-top-color: #6c3bff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .adm-root {
          min-height: 100vh; display: flex;
          background: #060608; font-family: 'Inter', -apple-system, sans-serif;
          color: #fff; position: relative;
        }

        /* ── Background ── */
        .adm-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .adm-orb { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.2; }
        .adm-orb-1 { width: 600px; height: 600px; background: radial-gradient(#6c3bff, transparent); top: -200px; left: 200px; }
        .adm-orb-2 { width: 400px; height: 400px; background: radial-gradient(#0ea5e9, transparent); bottom: -100px; right: 100px; }
        .adm-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* ── Sidebar ── */
        .adm-sidebar {
          width: 240px; min-height: 100vh;
          background: rgba(10,10,16,0.9);
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column;
          padding: 28px 16px; gap: 8px;
          position: relative; z-index: 10;
          backdrop-filter: blur(20px);
        }
        .adm-sidebar-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 0 8px 24px; border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 12px;
        }
        .adm-logo-icon {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #6c3bff, #0ea5e9);
          border-radius: 9px; display: flex; align-items: center;
          justify-content: center; font-size: 16px;
          box-shadow: 0 0 16px rgba(108,59,255,0.4);
        }
        .adm-logo-text { font-size: 16px; font-weight: 700; }

        .adm-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .adm-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; border-radius: 10px;
          background: none; border: none; color: rgba(255,255,255,0.5);
          font-size: 14px; font-weight: 500; cursor: pointer;
          transition: all 0.2s; text-align: left; width: 100%;
        }
        .adm-nav-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .adm-nav-active { background: rgba(108,59,255,0.2) !important; color: #a78bfa !important; }

        .adm-sidebar-bottom { margin-top: auto; display: flex; flex-direction: column; gap: 12px; }
        .adm-user-chip {
          display: flex; align-items: center; gap: 10px;
          padding: 12px; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
        }
        .adm-avatar {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #6c3bff, #0ea5e9);
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 15px; font-weight: 700;
          flex-shrink: 0;
        }
        .adm-user-name { font-size: 13px; font-weight: 600; }
        .adm-user-role { font-size: 11px; color: rgba(255,255,255,0.4); }
        .adm-logout-btn {
          width: 100%; padding: 10px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px; color: #fca5a5;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all 0.2s;
        }
        .adm-logout-btn:hover { background: rgba(239,68,68,0.18); }

        /* ── Main ── */
        .adm-main {
          flex: 1; padding: 40px;
          position: relative; z-index: 10;
          overflow-y: auto;
          display: flex; flex-direction: column; gap: 28px;
        }
        .adm-header { display: flex; align-items: flex-start; justify-content: space-between; }
        .adm-page-title { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
        .adm-page-sub { font-size: 14px; color: rgba(255,255,255,0.4); margin-top: 4px; }
        .adm-header-badge {
          display: flex; align-items: center; gap: 8px;
          background: rgba(108,59,255,0.15);
          border: 1px solid rgba(108,59,255,0.3);
          border-radius: 10px; padding: 8px 16px;
          font-size: 13px; font-weight: 600; color: #a78bfa;
        }

        /* ── Stats ── */
        .adm-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .adm-stat-card {
          padding: 24px; border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          display: flex; flex-direction: column; gap: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .adm-stat-card:hover { transform: translateY(-3px); }
        .adm-stat-purple { border-color: rgba(108,59,255,0.25); box-shadow: 0 0 30px rgba(108,59,255,0.08); }
        .adm-stat-blue   { border-color: rgba(14,165,233,0.25); box-shadow: 0 0 30px rgba(14,165,233,0.08); }
        .adm-stat-green  { border-color: rgba(34,197,94,0.25);  box-shadow: 0 0 30px rgba(34,197,94,0.08); }
        .adm-stat-icon { font-size: 28px; }
        .adm-stat-num  { font-size: 36px; font-weight: 800; letter-spacing: -1px; }
        .adm-stat-label{ font-size: 13px; color: rgba(255,255,255,0.45); }

        /* ── Table Card ── */
        .adm-table-card {
          background: rgba(10,10,16,0.7);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; overflow: hidden;
          backdrop-filter: blur(12px);
        }
        .adm-table-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .adm-table-title { font-size: 17px; font-weight: 700; }
        .adm-search {
          padding: 9px 16px; border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff; font-size: 13px; outline: none;
          transition: border-color 0.2s; width: 220px;
        }
        .adm-search:focus { border-color: rgba(108,59,255,0.5); }
        .adm-search::placeholder { color: rgba(255,255,255,0.3); }

        .adm-table-wrap { overflow-x: auto; }
        .adm-table { width: 100%; border-collapse: collapse; }
        .adm-table th {
          text-align: left; padding: 14px 24px;
          font-size: 12px; font-weight: 600;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase; letter-spacing: 0.8px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .adm-row td {
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 14px;
        }
        .adm-row:last-child td { border-bottom: none; }
        .adm-row:hover td { background: rgba(255,255,255,0.02); }

        .adm-user-cell { display: flex; align-items: center; gap: 10px; }
        .adm-table-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; flex-shrink: 0;
        }
        .adm-avatar-admin { background: linear-gradient(135deg, #6c3bff, #9d5cff); }
        .adm-avatar-user  { background: linear-gradient(135deg, #0ea5e9, #38bdf8); }
        .adm-cell-name  { font-weight: 600; }
        .adm-cell-email { color: rgba(255,255,255,0.5); font-size: 13px; }
        .adm-cell-date  { color: rgba(255,255,255,0.4); font-size: 13px; }
        .adm-empty { text-align: center; padding: 40px; color: rgba(255,255,255,0.3); font-size: 14px; }

        .adm-role-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 20px;
          font-size: 12px; font-weight: 600;
        }
        .adm-role-admin {
          background: rgba(108,59,255,0.2);
          border: 1px solid rgba(108,59,255,0.3);
          color: #c4b5fd;
        }
        .adm-role-user {
          background: rgba(14,165,233,0.15);
          border: 1px solid rgba(14,165,233,0.25);
          color: #7dd3fc;
        }

        .adm-btn-delete {
          padding: 6px 14px; border-radius: 8px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .adm-btn-delete:hover { background: rgba(239,68,68,0.2); }
        .adm-confirm-wrap { display: flex; gap: 8px; }
        .adm-btn-danger {
          padding: 6px 12px; border-radius: 8px;
          background: rgba(239,68,68,0.8); border: none;
          color: #fff; font-size: 12px; font-weight: 700;
          cursor: pointer;
        }
        .adm-btn-cancel {
          padding: 6px 12px; border-radius: 8px;
          background: rgba(255,255,255,0.1); border: none;
          color: #fff; font-size: 12px; cursor: pointer;
        }
        .adm-protected { font-size: 12px; color: rgba(255,255,255,0.3); }

        @media (max-width: 768px) {
          .adm-sidebar { display: none; }
          .adm-main { padding: 20px; }
          .adm-stats { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
