import React, { useState } from "react";
import OpportunityEditor from "./OpportunityEditor.jsx";
import { confirmDialog } from "../../../shared/components/AppDialog.jsx";

export default function MyOpportunities({
  opportunities,
  onUpdateOpportunity,
  onDeleteOpportunity,
  setActiveTab,
  setSelectedRoleFilter,
}) {
  const [editing, setEditing] = useState(null);
  const published = (o) =>
    ["published", "closed"].includes(o.status.toLowerCase());
  return (
    <div>
      <div className="section-header-wrap">
        <h2>My Opportunities</h2>
        <p>
          Edit all details until publication. CGPA can increase or decrease
          before approval; after approval it can only decrease.
        </p>
        <button
          className="btn-primary-action"
          onClick={() => setActiveTab("post")}
        >
          Post New Opportunity
        </button>
      </div>
      <div className="opportunities-grid">
        {opportunities.map((o) => (
          <article className="opp-card-custom" key={o.id}>
            <div className="opp-card-top">
              <h3>{o.title}</h3>
              <span className={`badge-status ${o.status.toLowerCase()}`}>
                {o.status}
              </span>
            </div>
            <p>
              <strong>Job ID: {o.jobId}</strong> · {o.type}
            </p>
            <p>{o.location}</p>
            <p>
              {o.ctc} · Minimum CGPA: {o.cgpa}
            </p>
            <p>Deadline: {o.deadline}</p>
            <p>{o.branches.join(", ")}</p>
            <div className="opp-actions-row">
              <button
                className="btn-view-apps"
                onClick={() => {
                  setSelectedRoleFilter(String(o.id));
                  setActiveTab("applications");
                }}
              >
                View Applications ({o.applications})
              </button>
              <button
                className="btn-secondary-action"
                onClick={() => {
                  setEditing({ ...o });
                }}
              >
                {published(o) ? "Lower CGPA" : "Edit"}
              </button>
              {!published(o) && (
                <button
                  className="btn-delete-opp"
                  onClick={async () => {
                    if (await confirmDialog(`Remove "${o.title}"?`))
                      onDeleteOpportunity(o.id);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      {!opportunities.length && <p>No opportunities posted yet.</p>}
      {editing && (
        <OpportunityEditor
          key={editing.id}
          opportunity={
            opportunities.find((o) => o.id === editing.id) || editing
          }
          opportunities={opportunities}
          onSave={onUpdateOpportunity}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
