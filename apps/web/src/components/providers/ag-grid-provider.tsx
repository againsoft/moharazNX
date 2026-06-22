"use client";

import { AgGridProvider } from "ag-grid-react";
import { AllCommunityModule } from "ag-grid-community";

const modules = [AllCommunityModule];

export function AgGridSetup({ children }: { children: React.ReactNode }) {
  return <AgGridProvider modules={modules}>{children}</AgGridProvider>;
}
