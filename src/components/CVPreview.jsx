// src/components/CVPreview.jsx
import React from "react";

const pick = (cv) => ({
  name: cv?.profile?.name || "",
  email: cv?.profile?.email || "",
  phone: cv?.profile?.phone || "",
  city: cv?.profile?.city || "",
  summary: cv?.profile?.summary || "",
  imageUrl: cv?.profile?.imageUrl || "",
  education: cv?.education || [],
  experience: cv?.experience || [],
  projects: cv?.projects || [],
  skills: cv?.skills || [],
  socials: cv?.socials || [],
  colors: cv?.theme?.colors || { primary: "#111827", accent: "#2563eb" },
  font: cv?.theme?.font || "Inter",
  size: cv?.theme?.size || "12px",
});

// ---- helpers ---------------------------------------------------------------

const h2 = (color) => ({
  fontSize: 14,
  letterSpacing: ".08em",
  textTransform: "uppercase",
  color,
  margin: "14px 0 6px",
});
const h3 = (color) => ({ fontSize: 13, color, margin: "12px 0 6px" });
const h4 = (color) => ({
  fontSize: 12,
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color,
  margin: "14px 0 8px",
});
const chip = {
  display: "inline-block",
  border: "1px solid #ddd",
  borderRadius: 999,
  padding: "3px 8px",
  margin: 2,
  fontSize: 12,
};

const safeUrl = (u) => {
  const s = String(u || "").trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
};

const socialIcon = (platform) => {
  const p = String(platform || "").toLowerCase();
  if (p.includes("linkedin")) return "bi bi-linkedin";
  if (p.includes("twitter") || p === "x") return "bi bi-twitter-x";
  if (p.includes("github")) return "bi bi-github";
  if (p.includes("gitlab")) return "bi bi-git";
  if (p.includes("stack")) return "bi bi-stack";
  if (p.includes("dribbble")) return "bi bi-dribbble";
  if (p.includes("behance")) return "bi bi-behance";
  if (p.includes("medium")) return "bi bi-medium";
  if (p.includes("skype")) return "bi bi-skype";
  if (p.includes("portfolio") || p.includes("site") || p.includes("web"))
    return "bi bi-globe2";
  return "bi bi-link-45deg";
};

function SocialsList({ socials = [], color = "#2563eb" }) {
  if (!socials.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {socials.map((s, i) => (
        <a
          key={i}
          href={safeUrl(s.url)}
          target="_blank"
          rel="noreferrer"
          style={{
            textDecoration: "none",
            color,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 8px",
            border: `1px solid ${color}33`,
            borderRadius: 999,
            fontSize: 12,
          }}
        >
          <i className={socialIcon(s.platform)} />
          <span>{s.platform || "Profile"}</span>
        </a>
      ))}
    </div>
  );
}

// ---- Templates -------------------------------------------------------------

function HeaderBlock({ d, accent, variant = "classic" }) {
  const contact = [d.email, d.phone, d.city].filter(Boolean).join(" • ");

  const avatar =
    d.imageUrl && (
      <img
        src={d.imageUrl}
        alt="profile"
        style={{
          width: 64,
          height: 64,
          objectFit: "cover",
          borderRadius: variant === "modern" ? 12 : "50%",
          border: variant === "elegant" ? "1px solid #e5e7eb" : "none",
        }}
      />
    );

  if (variant === "modern") {
    return (
      <div
        style={{
          borderLeft: `6px solid ${accent}`,
          paddingLeft: 12,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        {avatar}
        <div>
          <h1 style={{ margin: 0, fontSize: "21px" }}>{d.name}</h1>
          {contact && <div style={{ color: "#475569" }}>{contact}</div>}
          {!!d.socials.length && (
            <div style={{ marginTop: 6 }}>
              <SocialsList socials={d.socials} color={accent} />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "elegant") {
    return (
      <>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 24, margin: "0 0 4px" }}>
              {d.name}
            </h1>
            {contact && <div style={{ color: "#6b7280" }}>{contact}</div>}
          </div>
          {avatar}
        </div>
        {!!d.socials.length && (
          <div style={{ marginTop: 6 }}>
            <SocialsList socials={d.socials} color={d.colors.primary} />
          </div>
        )}
        <div style={{ height: 1, background: "#e5e7eb", margin: "10px 0" }} />
      </>
    );
  }

  // classic
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {avatar}
      <div>
        <h1 style={{ margin: 0, fontSize: "22px", color: d.colors.primary }}>{d.name}</h1>
        {contact && <div style={{ color: "#555" }}>{contact}</div>}
        {!!d.socials.length && (
          <div style={{ marginTop: 6 }}>
            <SocialsList socials={d.socials} color={accent} />
          </div>
        )}
      </div>
    </div>
  );
}

function Classic({ cv }) {
  const d = pick(cv);
  return (
    <div style={{ fontFamily: d.font, fontSize: d.size, color: "#111" }}>
      <HeaderBlock d={d} accent={d.colors.accent} variant="classic" />

      {d.summary && (
        <>
          <h2 style={h2(d.colors.accent)}>Summary</h2>
          <div>{d.summary}</div>
        </>
      )}

      {d.education.length > 0 && (
        <>
          <h2 style={h2(d.colors.accent)}>Education</h2>
          {d.education.map((e, i) => (
            <div key={i} style={{ margin: "4px 0" }}>
              <b>{e.degree}</b> — {e.institution}
            </div>
          ))}
        </>
      )}

      {d.experience.length > 0 && (
        <>
          <h2 style={h2(d.colors.accent)}>Experience</h2>
          {d.experience.map((x, i) => (
            <div key={i} style={{ margin: "4px 0" }}>
              <b>{x.position}</b> @ {x.organization} — {x.location}
            </div>
          ))}
        </>
      )}

      {d.projects.length > 0 && (
        <>
          <h2 style={h2(d.colors.accent)}>Projects</h2>
          {d.projects.map((p, i) => (
            <div key={i} style={{ margin: "4px 0" }}>
              <b>{p.title}</b> — {p.description}
            </div>
          ))}
        </>
      )}

      {d.skills.length > 0 && (
        <>
          <h2 style={h2(d.colors.accent)}>Skills</h2>
          <div>
            {d.skills.map((s, i) => (
              <span key={i} style={chip}>
                {s.name} {s.level || 0}%
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Modern({ cv }) {
  const d = pick(cv);
  return (
    <div style={{ fontFamily: d.font, fontSize: d.size, color: "#0f172a" }}>
      <HeaderBlock d={d} accent={d.colors.accent} variant="modern" />

      {d.summary && (
        <>
          <h3 style={h3(d.colors.accent)}>Summary</h3>
          <div>{d.summary}</div>
        </>
      )}

      {d.education.length > 0 && (
        <>
          <h3 style={h3(d.colors.accent)}>Education</h3>
          {d.education.map((e, i) => (
            <div key={i} style={{ margin: "6px 0" }}>
              <b>{e.degree}</b> — {e.institution}
            </div>
          ))}
        </>
      )}

      {d.experience.length > 0 && (
        <>
          <h3 style={h3(d.colors.accent)}>Experience</h3>
          {d.experience.map((x, i) => (
            <div key={i} style={{ margin: "6px 0" }}>
              <b>{x.position}</b> @ {x.organization} — {x.location}
            </div>
          ))}
        </>
      )}

      {d.projects.length > 0 && (
        <>
          <h3 style={h3(d.colors.accent)}>Projects</h3>
          {d.projects.map((p, i) => (
            <div key={i} style={{ margin: "6px 0" }}>
              <b>{p.title}</b> — {p.description}
            </div>
          ))}
        </>
      )}

      {d.skills.length > 0 && (
        <>
          <h3 style={h3(d.colors.accent)}>Skills</h3>
          <div>
            {d.skills.map((s, i) => (
              <span key={i} style={{ ...chip, background: "#f1f5f9", borderRadius: 8 }}>
                {s.name}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Elegant({ cv }) {
  const d = pick(cv);
  return (
    <div
      style={{
        fontFamily: `${d.font}, Georgia, 'Times New Roman', serif`,
        fontSize: d.size,
        color: "#1f2937",
      }}
    >
      <HeaderBlock d={d} accent={d.colors.accent} variant="elegant" />

      {d.summary && (
        <>
          <h4 style={h4(d.colors.primary)}>Profile</h4>
          <div>{d.summary}</div>
        </>
      )}

      {d.education.length > 0 && (
        <>
          <h4 style={h4(d.colors.primary)}>Education</h4>
          {d.education.map((e, i) => (
            <div key={i} style={{ margin: "6px 0" }}>
              <b>{e.degree}</b>, {e.institution}
            </div>
          ))}
        </>
      )}

      {d.experience.length > 0 && (
        <>
          <h4 style={h4(d.colors.primary)}>Experience</h4>
          {d.experience.map((x, i) => (
            <div key={i} style={{ margin: "6px 0" }}>
              <b>{x.position}</b> — {x.organization}, {x.location}
            </div>
          ))}
        </>
      )}

      {d.projects.length > 0 && (
        <>
          <h4 style={h4(d.colors.primary)}>Projects</h4>
          {d.projects.map((p, i) => (
            <div key={i} style={{ margin: "6px 0" }}>
              <b>{p.title}</b>: {p.description}
            </div>
          ))}
        </>
      )}

      {d.skills.length > 0 && (
        <>
          <h4 style={h4(d.colors.primary)}>Skills</h4>
          <div>
            {d.skills.map((s, i) => `${s.name} (${s.level || 0}%)`).join(" • ")}
          </div>
        </>
      )}
    </div>
  );
}

// ---- Root ------------------------------------------------------------------

export default function CVPreview({ cv }) {
  const t = (cv?.template || "classic").toLowerCase();

  // key={t} forces React to remount when template changes, avoiding style bleed
  return (
    <div key={t}>
      {t === "modern" ? (
        <Modern cv={cv} />
      ) : t === "elegant" ? (
        <Elegant cv={cv} />
      ) : (
        <Classic cv={cv} />
      )}
    </div>
  );
}
