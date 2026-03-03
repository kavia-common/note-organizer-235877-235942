import React from "react";

function formatMeta(note) {
  const d = note.updated_at || note.created_at;
  if (!d) return "";
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
  } catch {
    return String(d);
  }
}

function excerpt(text) {
  const t = String(text || "").trim().replace(/\s+/g, " ");
  if (!t) return "No content yet…";
  return t.length > 92 ? `${t.slice(0, 92)}…` : t;
}

// PUBLIC_INTERFACE
export function NotesSidebar({
  tags,
  activeTag,
  onSelectTag,
  notes,
  selectedId,
  onSelectNote,
  loading,
}) {
  return (
    <aside className="Panel" aria-label="Notes list">
      <div className="PanelHeader">
        <div className="PanelTitle">
          <span>///</span> Notes
        </div>
        <div className="MutedText">{loading ? "Syncing…" : `${notes.length} total`}</div>
      </div>

      <div className="PanelBody">
        <div className="SidebarToolbar">
          <div className="MutedText">Filter by tag:</div>
        </div>

        <div className="TagRow" style={{ marginTop: 10, marginBottom: 14 }}>
          <button
            type="button"
            className={`TagChip ${activeTag ? "" : "TagChipActive"}`}
            onClick={() => onSelectTag("")}
          >
            All
          </button>
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              className={`TagChip ${activeTag === t ? "TagChipActive" : ""}`}
              onClick={() => onSelectTag(t)}
              title={`Filter by #${t}`}
            >
              #{t}
            </button>
          ))}
          {tags.length === 0 ? <span className="MutedText">No tags yet</span> : null}
        </div>

        <div className="NoteList">
          {notes.length === 0 ? (
            <div className="MutedText">No notes match your filters.</div>
          ) : (
            notes.map((n) => (
              <div
                key={n.id}
                role="button"
                tabIndex={0}
                className={`NoteCard ${String(selectedId) === String(n.id) ? "NoteCardActive" : ""}`}
                onClick={() => onSelectNote(String(n.id))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelectNote(String(n.id));
                }}
                aria-label={`Open note ${n.title || "Untitled"}`}
              >
                <div className="NoteTitleRow">
                  <h3 className="NoteTitle">{n.title || "Untitled Note"}</h3>
                  <div className="NoteMeta">{formatMeta(n)}</div>
                </div>
                <p className="NoteExcerpt">{excerpt(n.content)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
