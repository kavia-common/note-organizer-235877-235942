import React, { useMemo } from "react";
import "./App.css";
import { TopNav } from "./components/TopNav";
import { NotesSidebar } from "./components/NotesSidebar";
import { NoteEditor } from "./components/NoteEditor";
import { useNotes } from "./hooks/useNotes";

// PUBLIC_INTERFACE
function App() {
  const {
    filteredNotes,
    selectedId,
    selectedNote,

    allTags,
    activeTag,
    setActiveTag,

    search,
    setSearch,

    loading,
    saving,
    error,
    setError,

    setSelectedId,
    createNote,
    saveNote,
    deleteNote,
  } = useNotes();

  const safeDelete = async (id) => {
    const ok = window.confirm("Delete this note permanently?");
    if (!ok) return;
    await deleteNote(id);
  };

  const subtitle = useMemo(() => {
    if (activeTag) return `Filtered by #${activeTag}`;
    if (search.trim()) return `Searching “${search.trim()}”`;
    return "All notes";
  }, [activeTag, search]);

  return (
    <div className="AppShell">
      <TopNav
        search={search}
        onSearchChange={(v) => setSearch(v)}
        onCreateNote={() => createNote()}
        saving={saving}
      />

      <main className="Main">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <NotesSidebar
            tags={allTags}
            activeTag={activeTag}
            onSelectTag={(t) => setActiveTag(t)}
            notes={filteredNotes}
            selectedId={selectedId}
            onSelectNote={(id) => setSelectedId(id)}
            loading={loading}
          />

          <div className="Panel" aria-label="Status">
            <div className="PanelHeader">
              <div className="PanelTitle">
                <span>///</span> Status
              </div>
              <button className="Btn BtnSm BtnGhost" type="button" onClick={() => setError("")}>
                Clear
              </button>
            </div>
            <div className="PanelBody">
              <div className="MutedText">{subtitle}</div>
              {loading ? <div className="Loading" style={{ marginTop: 8 }}>loading…</div> : null}
              {error ? (
                <div className="Alert" style={{ marginTop: 10 }}>
                  {error}
                </div>
              ) : (
                <div className="MutedText" style={{ marginTop: 10 }}>
                  Backend: {process.env.REACT_APP_API_BASE || "(not set)"}
                </div>
              )}
            </div>
          </div>
        </div>

        <NoteEditor note={selectedNote} saving={saving} onSave={saveNote} onDelete={safeDelete} />
      </main>
    </div>
  );
}

export default App;
