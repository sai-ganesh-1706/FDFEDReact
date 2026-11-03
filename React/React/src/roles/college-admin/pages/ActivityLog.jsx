import { useCallback, useEffect, useState } from "react";
import api, { errorMessage } from "../../../services/api.js";

export default function ActivityLog() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/activity/placement-officers");
      setEntries(data);
      setError("");
    } catch (failure) {
      setError(errorMessage(failure, "Could not load officer activity."));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
    const timer = setInterval(load, 20000);
    window.addEventListener("focus", load);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", load);
    };
  }, [load]);
  const filtered = entries.filter((entry) =>
    `${entry.actor} ${entry.action} ${entry.detail}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <section>
      <div className="section-header">
        <h2>Placement Officer Activity</h2>
        <button className="btn btn-outline" onClick={load}>
          Refresh
        </button>
      </div>
      <p>
        See who approved, rejected, returned, and published opportunities for
        your college.
      </p>
      <div className="search-bar" style={{ margin: "16px 0" }}>
        <input
          aria-label="Search officer activity"
          placeholder="Search officer, action or opportunity"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {error && <p role="status">{error}</p>}
      {loading ? (
        <p>Loading activity…</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Placement Officer</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.timestamp).toLocaleString("en-IN")}</td>
                  <td>{entry.actor}</td>
                  <td>{entry.action}</td>
                  <td>{entry.detail}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={4}>No matching officer activity yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
