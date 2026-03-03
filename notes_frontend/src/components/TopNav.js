import React from "react";

/**
 * Top navigation bar: brand, search input, global actions.
 */

// PUBLIC_INTERFACE
export function TopNav({ search, onSearchChange, onCreateNote, saving }) {
  return (
    <header className="TopNav">
      <div className="Brand" aria-label="Retro Notes">
        <div className="BrandGlow">
          <div className="BrandMark">RETRO•NOTES</div>
        </div>
        <div className="BrandSub">neon memo organizer</div>
      </div>

      <div className="NavCenter">
        <div className="SearchBar" role="search">
          <span className="SearchIcon" aria-hidden="true">
            ⌕
          </span>
          <input
            className="SearchInput"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes by title or content…"
            aria-label="Search notes"
          />
        </div>
      </div>

      <div className="NavRight">
        <button className="Btn BtnPrimary" type="button" onClick={onCreateNote} disabled={saving}>
          <span aria-hidden="true">＋</span> New note
        </button>
      </div>
    </header>
  );
}
