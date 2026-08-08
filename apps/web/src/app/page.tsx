"use client";

import React, { useState } from "react";
import { ProjectGrid } from "../features/projects/ProjectGrid";
import { AppTopBar } from "../components/layout/AppTopBar";
import { AppBottomBar } from "../components/layout/AppBottomBar";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", width: "100vw",
      background: "var(--bg-canvas)", overflow: "hidden",
    }}>
      <AppTopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <ProjectGrid searchQuery={searchQuery} />
      </main>

      <AppBottomBar />
    </div>
  );
}
