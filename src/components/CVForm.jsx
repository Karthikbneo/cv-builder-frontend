// src/components/CVForm.jsx
import React, { useMemo, useState, useRef } from "react";
import api from "../services/api.js";

export default function CVForm({ value, onChange, onUpload }) {
  const [step, setStep] = useState(1);
  const [errs, setErrs] = useState({});
  const v = value || {
    profile: {},
    education: [],
    experience: [],
    projects: [],
    skills: [],
    socials: [],
  };

  // ---------------- helpers ----------------
  const update = (path, val) => {
    const next = structuredClone(v);
    const keys = path.split(".");
    let obj = next;
    while (keys.length > 1) obj = (obj[keys.shift()] ||= {});
    obj[keys[0]] = val;
    onChange(next);
  };

  const addItem = (key, item = {}) =>
    onChange({ ...v, [key]: [...(v[key] || []), item] });
  const delItem = (key, idx) =>
    onChange({ ...v, [key]: (v[key] || []).filter((_, i) => i !== idx) });

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

  // ---------------- validation ----------------
  const setFieldError = (key, msg) =>
    setErrs((e) => ({ ...e, [key]: msg || undefined }));

  const emailOk = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
  const urlOk = (s) => /^https?:\/\/[^\s]+$/i.test(String(s || "").trim());

  const validateStep = (s = step) => {
    const next = {};

    if (s === 1) {
      if (!v.profile?.name?.trim()) next["profile.name"] = "Name is required";
      if (!v.profile?.email?.trim()) next["profile.email"] = "Email is required";
      else if (!emailOk(v.profile.email)) next["profile.email"] = "Invalid email";
    }

    if (s === 2) {
      (v.education || []).forEach((e, i) => {
        if (!e.degree?.trim()) next[`education.${i}.degree`] = "Required";
        if (!e.institution?.trim())
          next[`education.${i}.institution`] = "Required";
        if (e.percentage !== undefined && e.percentage !== "") {
          const n = Number(e.percentage);
          if (Number.isNaN(n) || n < 0 || n > 100)
            next[`education.${i}.percentage`] = "0–100 only";
        }
      });
    }

    if (s === 3) {
      (v.experience || []).forEach((x, i) => {
        if (!x.organization?.trim())
          next[`experience.${i}.organization`] = "Required";
        if (!x.position?.trim()) next[`experience.${i}.position`] = "Required";
        if (x.ctc !== undefined && x.ctc !== "") {
          const n = Number(x.ctc);
          if (Number.isNaN(n) || n < 0) next[`experience.${i}.ctc`] = "Must be ≥ 0";
        }
      });
    }

    if (s === 4) {
      (v.projects || []).forEach((p, i) => {
        if (!p.title?.trim()) next[`projects.${i}.title`] = "Required";
      });
    }

    if (s === 5) {
      (v.skills || []).forEach((p, i) => {
        if (!p.name?.trim()) next[`skills.${i}.name`] = "Required";
        const lvl = Number(p.level ?? 0);
        if (Number.isNaN(lvl) || lvl < 0 || lvl > 100) next[`skills.${i}.level`] = "0–100 only";
      });
    }

    if (s === 6) {
      (v.socials || []).forEach((soc, i) => {
        if (!soc.platform?.trim())
          next[`socials.${i}.platform`] = "Required";
        if (!soc.url?.trim()) {
          next[`socials.${i}.url`] = "Profile URL is required";
        } else if (!urlOk(normUrl(soc.url))) {
          next[`socials.${i}.url`] = "Invalid URL";
        }
      });
    }

    setErrs(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(6, s + 1));
  };
  const goPrev = () => setStep((s) => Math.max(1, s - 1));

  const steps = useMemo(
    () => [
      { id: 1, label: "Basic" },
      { id: 2, label: "Education", count: v.education?.length || 0 },
      { id: 3, label: "Experience", count: v.experience?.length || 0 },
      { id: 4, label: "Projects", count: v.projects?.length || 0 },
      { id: 5, label: "Skills", count: v.skills?.length || 0 },
      { id: 6, label: "Socials", count: v.socials?.length || 0 },
    ],
    [v.education, v.experience, v.projects, v.skills, v.socials]
  );

  const hasErr = (key) => Boolean(errs[key]);
  const msg = (key) =>
    hasErr(key) ? <div className="invalid-feedback d-block">{errs[key]}</div> : null;

  // ---------------- UI ----------------
  return (
    <div>
      <ul className="nav nav-pills mb-3 flex-wrap">
        {steps.map((s) => (
          <li key={s.id} className="nav-item me-1 mb-1">
            <button
              type="button"
              className={"nav-link d-flex align-items-center " + (step === s.id ? "active" : "")}
              onClick={() => {
                if (s.id < step || validateStep(step)) setStep(s.id);
              }}
            >
              <span>{s.label}</span>
              {typeof s.count === "number" && (
                <span className="badge bg-light text-dark ms-2">{s.count}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* STEP 1: BASIC */}
      {step === 1 && (
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Full Name *</label>
            <input
              className={"form-control " + (hasErr("profile.name") ? "is-invalid" : "")}
              placeholder="John Doe"
              value={v.profile?.name || ""}
              onBlur={() => validateStep(1)}
              onChange={(e) => update("profile.name", e.target.value)}
            />
            {msg("profile.name")}
          </div>
          <div className="col-md-6">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className={"form-control " + (hasErr("profile.email") ? "is-invalid" : "")}
              placeholder="you@example.com"
              value={v.profile?.email || ""}
              onBlur={() => validateStep(1)}
              onChange={(e) => update("profile.email", e.target.value)}
              autoComplete="email"
            />
            {msg("profile.email")}
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
              onClick={() =>
                addItem("education", {
                  degree: "",
                  institution: "",
                  start: "",
                  end: "",
                  percentage: "",
                })
              }
            >
              Add
            </button>
          </div>

          {(v.education || []).map((e, i) => (
            <div key={i} className="border rounded p-2 mb-2">
              <div className="row g-2">
                <div className="col-md-6">
                  <input
                    className={
                      "form-control " + (hasErr(`education.${i}.degree`) ? "is-invalid" : "")
                    }
                    placeholder="Degree *"
                    value={e.degree || ""}
                    onBlur={() => validateStep(2)}
                    onChange={(ev) => setArray("education", i, { degree: ev.target.value })}
                  />
                  {msg(`education.${i}.degree`)}
                </div>
                <div className="col-md-6">
                  <input
                    className={
                      "form-control " +
                      (hasErr(`education.${i}.institution`) ? "is-invalid" : "")
                    }
                    placeholder="Institution *"
                    value={e.institution || ""}
                    onBlur={() => validateStep(2)}
                    onChange={(ev) =>
                      setArray("education", i, { institution: ev.target.value })
                    }
                  />
                  {msg(`education.${i}.institution`)}
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
                    className={
                      "form-control " +
                      (hasErr(`education.${i}.percentage`) ? "is-invalid" : "")
                    }
                    placeholder="%"
                    value={e.percentage || ""}
                    onBlur={() => validateStep(2)}
                    onChange={(ev) =>
                      setArray("education", i, { percentage: ev.target.value })
                    }
                  />
                  {msg(`education.${i}.percentage`)}
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
                    className={
                      "form-control " +
                      (hasErr(`experience.${i}.organization`) ? "is-invalid" : "")
                    }
                    placeholder="Organization *"
                    value={x.organization || ""}
                    onBlur={() => validateStep(3)}
                    onChange={(ev) =>
                      setArray("experience", i, { organization: ev.target.value })
                    }
                  />
                  {msg(`experience.${i}.organization`)}
                </div>
                <div className="col-md-6">
                  <input
                    className={
                      "form-control " +
                      (hasErr(`experience.${i}.position`) ? "is-invalid" : "")
                    }
                    placeholder="Position *"
                    value={x.position || ""}
                    onBlur={() => validateStep(3)}
                    onChange={(ev) => setArray("experience", i, { position: ev.target.value })}
                  />
                  {msg(`experience.${i}.position`)}
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
                    className={
                      "form-control " + (hasErr(`experience.${i}.ctc`) ? "is-invalid" : "")
                    }
                    placeholder="CTC (₹)"
                    value={x.ctc || ""}
                    onBlur={() => validateStep(3)}
                    onChange={(ev) => setArray("experience", i, { ctc: ev.target.value })}
                  />
                  {msg(`experience.${i}.ctc`)}
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

                {/* --- Technologies as tags --- */}
                <div className="col-12">
                  <label className="form-label small text-muted">Technologies</label>
                  <TechTags
                    value={x.technologies || []}
                    onAdd={(tech) =>
                      setArray("experience", i, {
                        technologies: [...(x.technologies || []), tech],
                      })
                    }
                    onRemove={(idx) =>
                      setArray("experience", i, {
                        technologies: (x.technologies || []).filter((_, t) => t !== idx),
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
              onClick={() =>
                addItem("projects", {
                  title: "",
                  teamSize: "",
                  duration: "",
                  technologies: [],
                  description: "",
                })
              }
            >
              Add
            </button>
          </div>

          {(v.projects || []).map((p, i) => (
            <div key={i} className="border rounded p-2 mb-2">
              <div className="row g-2">
                <div className="col-md-6">
                  <input
                    className={
                      "form-control " + (hasErr(`projects.${i}.title`) ? "is-invalid" : "")
                    }
                    placeholder="Title *"
                    value={p.title || ""}
                    onBlur={() => validateStep(4)}
                    onChange={(ev) => setArray("projects", i, { title: ev.target.value })}
                  />
                  {msg(`projects.${i}.title`)}
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
                    className={
                      "form-control " + (hasErr(`skills.${i}.name`) ? "is-invalid" : "")
                    }
                    placeholder="Skill *"
                    value={s.name || ""}
                    onBlur={() => validateStep(5)}
                    onChange={(ev) => setArray("skills", i, { name: ev.target.value })}
                  />
                  {msg(`skills.${i}.name`)}
                </div>
                <div className="col-md-4">
                  <input
                    type="range"
                    className={
                      "form-range " + (hasErr(`skills.${i}.level`) ? "is-invalid" : "")
                    }
                    min="0"
                    max="100"
                    value={s.level ?? 0}
                    onBlur={() => validateStep(5)}
                    onChange={(ev) =>
                      setArray("skills", i, { level: Number(ev.target.value) })
                    }
                  />
                  {msg(`skills.${i}.level`)}
                </div>
                <div className="col-md-2 text-end">
                  <span className="badge text-bg-secondary">{s.level ?? 0}%</span>
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
                  <label className="form-label small text-muted">Platform *</label>
                  <select
                    className={
                      "form-select " + (hasErr(`socials.${i}.platform`) ? "is-invalid" : "")
                    }
                    value={s.platform || "LinkedIn"}
                    onBlur={() => validateStep(6)}
                    onChange={(ev) => setArray("socials", i, { platform: ev.target.value })}
                  >
                    {[
                      "LinkedIn",
                      "Twitter/X",
                      "GitHub",
                      "GitLab",
                      "Stack Overflow",
                      "Dribbble",
                      "Behance",
                      "Medium",
                      "Skype",
                      "Portfolio",
                      "Other",
                    ].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {msg(`socials.${i}.platform`)}
                </div>
                <div className="col-md-7">
                  <label className="form-label small text-muted">Profile URL</label>
                  <input
                    className={
                      "form-control " + (hasErr(`socials.${i}.url`) ? "is-invalid" : "")
                    }
                    placeholder="https://linkedin.com/in/username"
                    value={s.url || ""}
                    onChange={(ev) => setArray("socials", i, { url: ev.target.value })}
                    onBlur={(ev) => {
                      const normalized = normUrl(ev.target.value);
                      setArray("socials", i, { url: normalized });
                      validateStep(6);
                    }}
                  />
                  {msg(`socials.${i}.url`)}
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

      {/* Step nav */}
      <div className="d-flex justify-content-between mt-3">
        <button type="button" className="btn btn-outline-secondary" onClick={goPrev}>
          Previous
        </button>
        <button type="button" className="btn btn-primary" onClick={goNext}>
          Next
        </button>
      </div>
    </div>
  );
}

/* ------------------------ Reusable TechTags input ------------------------ */
function TechTags({ value, onAdd, onRemove }) {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    // add on Enter
    if (e.key === "Enter") {
      e.preventDefault();
      const t = e.currentTarget.value.trim();
      if (!t) return;
      if (!value?.includes(t)) onAdd?.(t);
      e.currentTarget.value = "";
    }
    // backspace to remove last when empty
    if (e.key === "Backspace" && !e.currentTarget.value && value?.length) {
      onRemove?.(value.length - 1);
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap gap-2 mb-2">
        {(value || []).map((t, i) => (
          <span key={`${t}-${i}`} className="badge bg-secondary position-relative">
            {t}
            <button
              type="button"
              className="btn-close btn-close-white btn-sm ms-2"
              aria-label={`Remove ${t}`}
              style={{
                fontSize: "0.55rem",
                position: "absolute",
                top: "-4px",
                right: "-6px",
              }}
              onClick={() => onRemove?.(i)}
            />
          </span>
        ))}
      </div>

      <input
        ref={inputRef}
        type="text"
        className="form-control"
        placeholder="Type a technology and press Enter (e.g. React)"
        onKeyDown={handleKeyDown}
      />
    </>
  );
}
