"use client";

import React, { useState } from "react";
import { ProjectGrid } from "../features/projects/ProjectGrid";
import { AppTopBar } from "../components/layout/AppTopBar";
import { AppBottomBar } from "../components/layout/AppBottomBar";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--bg-canvas)] overflow-hidden">
      <AppTopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="flex-1 overflow-y-auto min-h-0">
        <ProjectGrid searchQuery={searchQuery} />
      </main>

      <AppBottomBar />
    </div>
  );
}
