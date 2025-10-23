// src/components/CVForm.jsx
import React, { useState, useMemo } from "react";
import api from "../services/api.js";

export default function CVForm({ value, onChange, onUpload }) {
  const [step, setStep] = useState(1);
  const v = value || {};

  // --- helpers ---------------------------------------------------------------
  const update = (path, val) => {
    const next = structuredClone(v);
    const keys = path.split(".");
    let obj = next;
    while (keys.length > 1) obj = (obj[keys.shift()] ||= {});
    obj[keys[0]] = val;
    onChange(next);
  };

  const addItem = (key, item = {}) => onChange({ ...v, [key]: [...(v[key] || []), item] });
  const delItem = (key, idx) => onChange({ ...v, [key]: (v[key] || []).filter((_, i) => i !== idx) });

  const setArray = (key, idx, patch) => {
    const arr = [...(v[key] || [])];
    arr[idx] = { ...arr[idx], ...patch };
    onChange({ ...v, [key]: arr });
  };

  const normUrl = (u) => {
    const s = String(u || "").trim();
    if (!s) return s;
    if (!/^https?:\/\//i.test(s)) return "https://" + s;
    return s;
  };

  const uploadImage = async (file) => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post("/api/v1/uploads/image", form);
    onUpload?.(data.url);
  };

  const steps = useMemo(
    () => [
      { id: 1, label: "Basic" },
      { id: 2, label: "Education" },
      { id: 3, label: "Experience" },
      { id: 4, label: "Projects" },
      { id: 5, label: "Skills" },
      { id: 6, label: "Socials" },
    ],
    []
  );

  // --- UI --------------------------------------------------------------------
  return (
    <div>
      <ul className="nav nav-pills mb-3 flex-wrap">
        {steps.map((s) => (
          <li key={s.id} className="nav-item me-1 mb-1">
            <button
              type="button"
              className={"nav-link " + (step === s.id ? "active" : "")}
              onClick={() => setStep(s.id)}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>

      {/* STEP 1: BASIC */}
      {step === 1 && (
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Full Name</label>
            <input
              className="form-control"
              placeholder="John Doe"
              value={v.profile?.name || ""}
              onChange={(e) => update("profile.name", e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input
              className="form-control"
              type="email"
              placeholder="you@example.com"
              value={v.profile?.email || ""}
              onChange={(e) => update("profile.email", e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Phone</label>
            <input
              className="form-control"
              placeholder="+91 90000 00000"
              value={v.profile?.phone || ""}
              onChange={(e) => update("profile.phone", e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">City</label>
            <input
              className="form-control"
              placeholder="Mumbai"
              value={v.profile?.city || ""}
              onChange={(e) => update("profile.city", e.target.value)}
            />
          </div>
          <div className="col-12">
            <label className="form-label">Summary</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="A brief introduction about yourself..."
              value={v.profile?.summary || ""}
              onChange={(e) => update("profile.summary", e.target.value)}
            />
          </div>
          <div className="col-md-8">
            <label className="form-label">Profile Image</label>
            <input
              className="form-control"
              type="file"
              accept="image/*"
              onChange={(e) => uploadImage(e.target.files?.[0])}
            />
            {v.profile?.imageUrl && (
              <small className="text-success d-block mt-1">
                Uploaded: {v.profile.imageUrl}
              </small>
            )}
          </div>
          <div className="col-md-4 d-flex align-items-end">
            {v.profile?.imageUrl ? (
              <img
                src={v.profile.imageUrl}
                alt="Profile"
                className="img-thumbnail ms-auto"
                style={{ maxHeight: 72, objectFit: "cover" }}
              />
            ) : (
              <div className="text-muted small ms-auto">No image</div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: EDUCATION */}
      {step === 2 && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Education</h6>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => addItem("education", { degree: "", institution: "", start: "", end: "", percentage: "" })}
            >
              Add
            </button>
          </div>

          {(v.education || []).map((e, i) => (
            <div key={i} className="border rounded p-2 mb-2">
              <div className="row g-2">
                <div className="col-md-6">
                  <input
                    className="form-control"
                    placeholder="Degree"
                    value={e.degree || ""}
                    onChange={(ev) => setArray("education", i, { degree: ev.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <input
                    className="form-control"
                    placeholder="Institution"
                    value={e.institution || ""}
                    onChange={(ev) => setArray("education", i, { institution: ev.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="month"
                    className="form-control"
                    placeholder="Start"
                    value={e.start || ""}
                    onChange={(ev) => setArray("education", i, { start: ev.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="month"
                    className="form-control"
                    placeholder="End"
                    value={e.end || ""}
                    onChange={(ev) => setArray("education", i, { end: ev.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-control"
                    placeholder="%"
                    value={e.percentage || ""}
                    onChange={(ev) => setArray("education", i, { percentage: ev.target.value })}
                  />
                </div>
                <div className="col-md-3 text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => delItem("education", i)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STEP 3: EXPERIENCE */}
      {step === 3 && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Experience</h6>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() =>
                addItem("experience", {
                  organization: "",
                  location: "",
                  position: "",
                  ctc: "",
                  start: "",
                  end: "",
                  technologies: [],
                })
              }
            >
              Add
            </button>
          </div>

          {(v.experience || []).map((x, i) => (
            <div key={i} className="border rounded p-2 mb-2">
              <div className="row g-2">
                <div className="col-md-6">
                  <input
                    className="form-control"
                    placeholder="Organization"
                    value={x.organization || ""}
                    onChange={(ev) => setArray("experience", i, { organization: ev.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <input
                    className="form-control"
                    placeholder="Position"
                    value={x.position || ""}
                    onChange={(ev) => setArray("experience", i, { position: ev.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    className="form-control"
                    placeholder="Location"
                    value={x.location || ""}
                    onChange={(ev) => setArray("experience", i, { location: ev.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="CTC (₹)"
                    value={x.ctc || ""}
                    onChange={(ev) => setArray("experience", i, { ctc: ev.target.value })}
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="month"
                    className="form-control"
                    placeholder="Start"
                    value={x.start || ""}
                    onChange={(ev) => setArray("experience", i, { start: ev.target.value })}
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="month"
                    className="form-control"
                    placeholder="End"
                    value={x.end || ""}
                    onChange={(ev) => setArray("experience", i, { end: ev.target.value })}
                  />
                </div>
                <div className="col-12">
                  <input
                    className="form-control"
                    placeholder="Technologies (comma separated)"
                    value={(x.technologies || []).join(", ")}
                    onChange={(ev) =>
                      setArray("experience", i, {
                        technologies: ev.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
                <div className="col-12 text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => delItem("experience", i)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STEP 4: PROJECTS */}
      {step === 4 && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Projects</h6>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => addItem("projects", { title: "", teamSize: "", duration: "", technologies: [], description: "" })}
            >
              Add
            </button>
          </div>

          {(v.projects || []).map((p, i) => (
            <div key={i} className="border rounded p-2 mb-2">
              <div className="row g-2">
                <div className="col-md-6">
                  <input
                    className="form-control"
                    placeholder="Title"
                    value={p.title || ""}
                    onChange={(ev) => setArray("projects", i, { title: ev.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    placeholder="Team Size"
                    value={p.teamSize || ""}
                    onChange={(ev) => setArray("projects", i, { teamSize: ev.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    className="form-control"
                    placeholder="Duration (e.g. 3 months)"
                    value={p.duration || ""}
                    onChange={(ev) => setArray("projects", i, { duration: ev.target.value })}
                  />
                </div>
                <div className="col-12">
                  <input
                    className="form-control"
                    placeholder="Technologies (comma separated)"
                    value={(p.technologies || []).join(", ")}
                    onChange={(ev) =>
                      setArray("projects", i, {
                        technologies: ev.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
                <div className="col-12">
                  <textarea
                    className="form-control"
                    placeholder="Description"
                    rows="2"
                    value={p.description || ""}
                    onChange={(ev) => setArray("projects", i, { description: ev.target.value })}
                  />
                </div>
                <div className="col-12 text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => delItem("projects", i)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STEP 5: SKILLS */}
      {step === 5 && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Skills</h6>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => addItem("skills", { name: "", level: 50 })}
            >
              Add
            </button>
          </div>

          {(v.skills || []).map((s, i) => (
            <div key={i} className="border rounded p-2 mb-2">
              <div className="row g-2 align-items-center">
                <div className="col-md-6">
                  <input
                    className="form-control"
                    placeholder="Skill"
                    value={s.name || ""}
                    onChange={(ev) => setArray("skills", i, { name: ev.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="100"
                    value={s.level || 0}
                    onChange={(ev) => setArray("skills", i, { level: Number(ev.target.value) })}
                  />
                </div>
                <div className="col-md-2 text-end">
                  <span className="badge text-bg-secondary">{s.level || 0}%</span>
                </div>
                <div className="col-12 text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => delItem("skills", i)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STEP 6: SOCIALS */}
      {step === 6 && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Social Profiles</h6>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => addItem("socials", { platform: "LinkedIn", url: "" })}
            >
              Add
            </button>
          </div>

          {(v.socials || []).map((s, i) => (
            <div key={i} className="border rounded p-2 mb-2">
              <div className="row g-2 align-items-end">
                <div className="col-md-4">
                  <label className="form-label small text-muted">Platform</label>
                  <select
                    className="form-select"
                    value={s.platform || "LinkedIn"}
                    onChange={(ev) => setArray("socials", i, { platform: ev.target.value })}
                  >
                    {["LinkedIn", "Twitter/X", "GitHub", "GitLab", "Stack Overflow", "Dribbble", "Behance", "Medium", "Skype", "Portfolio", "Other"].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-7">
                  <label className="form-label small text-muted">Profile URL</label>
                  <input
                    className="form-control"
                    placeholder="https://linkedin.com/in/username"
                    value={s.url || ""}
                    onChange={(ev) => setArray("socials", i, { url: ev.target.value })}
                    onBlur={(ev) => setArray("socials", i, { url: normUrl(ev.target.value) })}
                  />
                </div>
                <div className="col-md-1 d-grid">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    title="Remove"
                    onClick={() => delItem("socials", i)}
                  >
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {(v.socials || []).length === 0 && (
            <div className="text-muted small">No social profiles added yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
