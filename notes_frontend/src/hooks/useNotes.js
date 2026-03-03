import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

/**
 * Notes domain hook: loads notes, manages selection, filters, and CRUD.
 * Keeps UI components dumb and single-responsibility.
 */

// PUBLIC_INTERFACE
export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedNote = useMemo(
    () => notes.find((n) => String(n.id) === String(selectedId)) || null,
    [notes, selectedId]
  );

  const allTags = useMemo(() => {
    const s = new Set();
    notes.forEach((n) => {
      const tags = Array.isArray(n.tags) ? n.tags : [];
      tags.forEach((t) => s.add(String(t)));
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notes
      .filter((n) => {
        if (activeTag) {
          const tags = Array.isArray(n.tags) ? n.tags : [];
          if (!tags.map(String).includes(activeTag)) return false;
        }
        if (!q) return true;
        const title = String(n.title || "").toLowerCase();
        const content = String(n.content || "").toLowerCase();
        return title.includes(q) || content.includes(q);
      })
      .sort((a, b) => {
        // Prefer updated_at/created_at if backend provides; fallback to id.
        const ad = a.updated_at || a.created_at || "";
        const bd = b.updated_at || b.created_at || "";
        if (ad && bd) return String(bd).localeCompare(String(ad));
        return String(b.id).localeCompare(String(a.id));
      });
  }, [notes, search, activeTag]);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Server-side search/filter (also used to keep total accurate); backend supports `query` + repeated `tags`.
      const data = await api.listNotes({
        query: search.trim() || undefined,
        tags: activeTag ? [activeTag] : undefined,
      });
      const list = Array.isArray(data) ? data : data?.items || [];
      setNotes(list);

      // Keep selection stable if possible.
      if (list.length > 0) {
        const exists = selectedId != null && list.some((n) => String(n.id) === String(selectedId));
        if (!exists) setSelectedId(String(list[0].id));
      } else {
        setSelectedId(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load notes.");
    } finally {
      setLoading(false);
    }
  }, [activeTag, search, selectedId]);

  useEffect(() => {
    // Load on first mount. We do not auto-load on each keystroke;
    // UI uses client-side filtering; backend search can be added later.
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createNote = useCallback(async () => {
    setSaving(true);
    setError("");
    try {
      const payload = { title: "Untitled Note", content: "", tags: [] };
      const created = await api.createNote(payload);
      const newId = created?.id ?? created?.note?.id;

      // Refresh and select new note.
      await loadNotes();
      if (newId != null) setSelectedId(String(newId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create note.");
    } finally {
      setSaving(false);
    }
  }, [loadNotes]);

  const saveNote = useCallback(
    async ({ id, title, content, tags }) => {
      setSaving(true);
      setError("");
      try {
        const payload = {
          title: String(title || "").trim() || "Untitled Note",
          content: String(content || ""),
          tags: Array.isArray(tags)
            ? tags
                .map((t) => String(t).trim())
                .filter(Boolean)
                .slice(0, 20)
            : [],
        };

        await api.updateNote(id, payload);
        await loadNotes();
        setSelectedId(String(id));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save note.");
      } finally {
        setSaving(false);
      }
    },
    [loadNotes]
  );

  const deleteNote = useCallback(
    async (id) => {
      setSaving(true);
      setError("");
      try {
        await api.deleteNote(id);
        await loadNotes();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to delete note.");
      } finally {
        setSaving(false);
      }
    },
    [loadNotes]
  );

  return {
    notes,
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
    loadNotes,
    createNote,
    saveNote,
    deleteNote,
  };
}
