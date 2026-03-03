import React, { useEffect, useMemo, useState } from "react";

function parseTags(text) {
  return String(text || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t.slice(1) : t));
}

function tagsToText(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return "";
  return tags.join(", ");
}

// PUBLIC_INTERFACE
export function NoteEditor({ note, saving, onSave, onDelete }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsText, setTagsText] = useState("");

  useEffect(() => {
    setTitle(note?.title || "");
    setContent(note?.content || "");
    setTagsText(tagsToText(note?.tags || []));
  }, [note?.id]); // reset editor when selection changes

  const tagPreview = useMemo(() => parseTags(tagsText), [tagsText]);

  if (!note) {
    return (
      <section className="Panel" aria-label="Editor">
        <div className="PanelHeader">
          <div className="PanelTitle">
            <span>///</span> Editor
          </div>
        </div>
        <div className="PanelBody">
          <div className="MutedText">
            Select a note from the left, or create a new one. Your notes live in the neon grid.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="Panel" aria-label="Note editor">
      <div className="PanelHeader">
        <div className="PanelTitle">
          <span>///</span> Edit note
        </div>
        <div className="Toolbar">
          <button
            className="Btn BtnSm BtnPrimary"
            type="button"
            onClick={() =>
              onSave({
                id: note.id,
                title,
                content,
                tags: parseTags(tagsText),
              })
            }
            disabled={saving}
          >
            Save
          </button>
          <button
            className="Btn BtnSm BtnDanger"
            type="button"
            onClick={() => onDelete(note.id)}
            disabled={saving}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="PanelBody">
        <div className="FormRow">
          <div className="Label">Title</div>
          <input
            className="Input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Note"
            aria-label="Note title"
          />
        </div>

        <div className="FormRow">
          <div className="Label">Tags (comma-separated)</div>
          <input
            className="Input"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="work, ideas, todo"
            aria-label="Note tags"
          />
          <div className="MutedText">
            Preview:{" "}
            {tagPreview.length ? tagPreview.map((t) => `#${t}`).join(" ") : "— (no tags)"}
          </div>
        </div>

        <div className="FormRow">
          <div className="Label">Content</div>
          <textarea
            className="Textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your note…"
            aria-label="Note content"
          />
        </div>

        <div className="HelperRow">
          <div className="MutedText">
            Tip: Use tags to create instant neon filters. Press Save to persist to the backend.
          </div>
          {saving ? <div className="Loading">saving…</div> : null}
        </div>
      </div>
    </section>
  );
}
