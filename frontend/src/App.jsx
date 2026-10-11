import React from "react";
import { useMemo, useState } from "react";
import "./styles.css";

const applications = [
  { id: "APP-1024", name: "Aarav Malhotra", initials: "AM", program: "MSc Computer Science", country: "Canada", date: "Oct 08, 2026", status: "Under Review" },
  { id: "APP-1023", name: "Priya Sharma", initials: "PS", program: "MSc Data Science", country: "United Kingdom", date: "Oct 07, 2026", status: "Submitted" },
  { id: "APP-1022", name: "Rahul Verma", initials: "RV", program: "MBA", country: "UAE", date: "Oct 06, 2026", status: "Offer Received" },
  { id: "APP-1021", name: "Ananya Singh", initials: "AS", program: "MSc Information Systems", country: "Canada", date: "Oct 05, 2026", status: "Visa Processing" },
  { id: "APP-1020", name: "Karan Patel", initials: "KP", program: "BSc Computer Science", country: "Australia", date: "Oct 04, 2026", status: "Rejected" },
];

const stats = [
  { label: "Total Students", value: "1,284", change: "+12.8%", icon: "♙", color: "purple" },
  { label: "Universities", value: "248", change: "+8.2%", icon: "⌂", color: "blue" },
  { label: "Active Programs", value: "562", change: "+14.3%", icon: "▤", color: "orange" },
  { label: "Applications", value: "846", change: "+18.6%", icon: "↗", color: "green" },
];

const destinations = [
  { name: "Canada", count: 342, percent: 82, flag: "🇨🇦" },
  { name: "United Kingdom", count: 256, percent: 64, flag: "🇬🇧" },
  { name: "Australia", count: 148, percent: 43, flag: "🇦🇺" },
  { name: "United Arab Emirates", count: 100, percent: 28, flag: "🇦🇪" },
];

const statusClass = {
  "Under Review": "review",
  Submitted: "submitted",
  "Offer Received": "offer",
  "Visa Processing": "visa",
  Rejected: "rejected",
};

export default function App() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [notice, setNotice] = useState("");

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesQuery = `${app.name} ${app.id} ${app.program} ${app.country}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === "All Statuses" || app.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  function navigate(item) {
    setActiveNav(item);
    if (item !== "Overview" && item !== "Applications") {
      setNotice(`${item} section selected. Connect this section to its API when ready.`);
    } else {
      setNotice("");
    }
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={() => navigate("Overview")}>
          <span className="brand-mark">W</span>
          <span className="brand-copy">
            <strong>waygood</strong>
            <small>EDUCATION PLATFORM</small>
          </span>
        </a>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          {[
            ["Overview", "▦"],
            ["Applications", "▤"],
            ["Students", "♙"],
            ["Universities", "⌂"],
            ["Programs", "▧"],
            ["Recommendations", "✳"],
          ].map(([label, icon]) => (
            <button
              key={label}
              className={`nav-item ${activeNav === label ? "active" : ""}`}
              onClick={() => navigate(label)}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
              {label === "Applications" && <span className="nav-count">5</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">✦</span>
            <strong>Need a hand?</strong>
            <p>Manage your study-abroad journey with confidence.</p>
            <button onClick={() => setNotice("Help center selected.")}>Visit help center ↗</button>
          </div>
          <div className="profile">
            <div className="profile-avatar">JK</div>
            <div className="profile-info">
              <strong>Jikesh Kumar</strong>
              <small>Administrator</small>
            </div>
            <span className="profile-menu">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-area" id="overview">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>{activeNav}</strong></div>
          <div className="topbar-actions">
            <span className="today-label">Sunday, October 11, 2026</span>
            <button className="icon-button" aria-label="Notifications" onClick={() => setNotice("You are all caught up on notifications.")}>♧<i /></button>
            <div className="top-avatar">JK</div>
          </div>
        </header>

        <div className="content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">YOUR EDUCATION COMMAND CENTER</p>
              <h1>{activeNav === "Overview" ? "Good evening, Jikesh" : activeNav}</h1>
              <p className="subheading">
                {activeNav === "Overview"
                  ? "Here’s what’s happening across your study-abroad platform."
                  : `Explore and manage your ${activeNav.toLowerCase()} workspace.`}
              </p>
            </div>
            <button className="primary-button" onClick={() => { navigate("Applications"); setNotice("Use the application list below to search and filter records."); }}>
              <span>＋</span> View applications
            </button>
          </section>

          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              <button aria-label="Dismiss notification" onClick={() => setNotice("")}>×</button>
            </div>
          )}

          <section className="stats-grid" aria-label="Platform statistics">
            {stats.map((stat) => (
              <article className="stat-card" key={stat.label}>
                <div className="stat-top">
                  <span className={`stat-icon ${stat.color}`}>{stat.icon}</span>
                  <span className="stat-change">↗ {stat.change}</span>
                </div>
                <p>{stat.label}</p>
                <strong className="stat-value">{stat.value}</strong>
                <span className="stat-footnote">Compared with last month</span>
              </article>
            ))}
          </section>

          <section className="overview-grid">
            <article className="panel destination-panel">
              <div className="panel-heading">
                <div>
                  <h2>Popular destinations</h2>
                  <p>Student interest by country</p>
                </div>
                <button className="text-button" onClick={() => navigate("Universities")}>View all ↗</button>
              </div>
              <div className="destination-list">
                {destinations.map((destination) => (
                  <div className="destination" key={destination.name}>
                    <span className="destination-flag">{destination.flag}</span>
                    <div className="destination-detail">
                      <div className="destination-title">
                        <strong>{destination.name}</strong>
                        <span>{destination.count} students</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-value" style={{ width: `${destination.percent}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel activity-panel">
              <div className="panel-heading">
                <div>
                  <h2>Application overview</h2>
                  <p>Current pipeline snapshot</p>
                </div>
                <span className="live-indicator"><i /> Sample data</span>
              </div>
              <div className="pipeline-total">
                <strong>846</strong>
                <span>total applications</span>
              </div>
              <div className="pipeline-bars">
                <div style={{ height: "45%" }}><span>Jan</span></div>
                <div style={{ height: "58%" }}><span>Feb</span></div>
                <div style={{ height: "51%" }}><span>Mar</span></div>
                <div style={{ height: "72%" }}><span>Apr</span></div>
                <div style={{ height: "64%" }}><span>May</span></div>
                <div style={{ height: "88%" }}><span>Jun</span></div>
                <div style={{ height: "78%" }}><span>Jul</span></div>
                <div style={{ height: "96%" }}><span>Aug</span></div>
                <div style={{ height: "70%" }}><span>Sep</span></div>
                <div style={{ height: "84%" }}><span>Oct</span></div>
              </div>
              <div className="chart-legend"><span /> Application volume · illustrative</div>
            </article>
          </section>

          <section className="panel applications-panel" id="applications">
            <div className="panel-heading applications-heading">
              <div>
                <h2>Recent applications</h2>
                <p>Review and track the latest student submissions</p>
              </div>
              <button className="text-button" onClick={() => { setQuery(""); setStatusFilter("All Statuses"); }}>Reset filters ↺</button>
            </div>

            <div className="table-tools">
              <label className="search-box">
                <span>⌕</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search student, program or ID..."
                  aria-label="Search applications"
                />
              </label>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by application status">
                <option>All Statuses</option>
                {Object.keys(statusClass).map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>STUDENT</th>
                    <th>PROGRAM & DESTINATION</th>
                    <th>SUBMITTED</th>
                    <th>STATUS</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className="student-cell">
                          <span className="student-avatar">{app.initials}</span>
                          <span><strong>{app.name}</strong><small>{app.id}</small></span>
                        </div>
                      </td>
                      <td><strong className="program-name">{app.program}</strong><small className="country-name">{app.country}</small></td>
                      <td className="date-cell">{app.date}</td>
                      <td><span className={`status-badge ${statusClass[app.status]}`}>{app.status}</span></td>
                      <td><button className="row-action" aria-label={`More options for ${app.name}`} onClick={() => setNotice(`${app.name}: ${app.status} · ${app.program}`)}>•••</button></td>
                    </tr>
                  ))}
                  {filteredApplications.length === 0 && (
                    <tr><td className="empty-state" colSpan="5">No applications match your search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span>Showing {filteredApplications.length} of {applications.length} sample applications</span>
              <span>Updated just now <i /></span>
            </div>
          </section>

          <footer className="footer">
            <span>© 2026 Waygood Education Platform</span>
            <span>Candidate Evaluation Dashboard <b>•</b> Demo data</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
