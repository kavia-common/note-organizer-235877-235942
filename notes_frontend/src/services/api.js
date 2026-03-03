/**
 * Small fetch wrapper around the Notes backend.
 * Uses REACT_APP_API_BASE from CRA environment variables.
 */

const API_BASE = (process.env.REACT_APP_API_BASE || "").replace(/\/$/, "");

/** @param {Response} res */
async function parseJsonOrText(res) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  const txt = await res.text();
  return txt;
}

/**
 * @param {string} path
 * @param {RequestInit} [options]
 */
async function request(path, options = {}) {
  if (!API_BASE) {
    throw new Error(
      "Missing REACT_APP_API_BASE. Set it in notes_frontend/.env (CRA requires REACT_APP_ prefix)."
    );
  }

  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await parseJsonOrText(res);
    const message = typeof body === "string" ? body : JSON.stringify(body);
    throw new Error(`API ${res.status} ${res.statusText}: ${message}`);
  }

  // Some endpoints might return empty; handle gracefully.
  if (res.status === 204) return null;
  return parseJsonOrText(res);
}

// PUBLIC_INTERFACE
export const api = {
  /** Health check for backend availability. */
  // PUBLIC_INTERFACE
  health: async () => request("/"),

  /**
   * List/search notes.
   * Backend supports:
   * - query: searches title/content
   * - tags: repeated query param (AND semantics)
   *
   * @param {{ query?: string, tags?: string[], archived?: boolean, limit?: number, offset?: number, sort?: string }} params
   */
  // PUBLIC_INTERFACE
  listNotes: async (params = {}) => {
    const qs = new URLSearchParams();

    if (params.query) qs.set("query", params.query);

    if (Array.isArray(params.tags)) {
      params.tags
        .map((t) => String(t).trim())
        .filter(Boolean)
        .forEach((t) => qs.append("tags", t));
    }

    if (typeof params.archived === "boolean") qs.set("archived", String(params.archived));
    if (typeof params.limit === "number") qs.set("limit", String(params.limit));
    if (typeof params.offset === "number") qs.set("offset", String(params.offset));
    if (params.sort) qs.set("sort", params.sort);

    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request(`/notes${suffix}`, { method: "GET" });
  },

  /**
   * Create a note.
   * @param {{ title: string, content?: string, is_archived?: boolean, tags?: string[] }} payload
   */
  // PUBLIC_INTERFACE
  createNote: async (payload) =>
    request(`/notes`, { method: "POST", body: JSON.stringify(payload) }),

  /**
   * Update a note (backend uses PATCH).
   * @param {string|number} id
   * @param {{ title?: string, content?: string, is_archived?: boolean, tags?: string[] }} payload
   */
  // PUBLIC_INTERFACE
  updateNote: async (id, payload) =>
    request(`/notes/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  /**
   * Delete a note.
   * @param {string|number} id
   */
  // PUBLIC_INTERFACE
  deleteNote: async (id) =>
    request(`/notes/${encodeURIComponent(id)}`, { method: "DELETE" }),

  /** List tags (optional backend endpoint). */
  // PUBLIC_INTERFACE
  listTags: async () => request(`/tags`, { method: "GET" }),
};
