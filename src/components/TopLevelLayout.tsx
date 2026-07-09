import React from "react";
import { Outlet } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/lib/theme";

export default function TopLevelLayout() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Outlet />
      </ThemeProvider>
    </HelmetProvider>
  );
}
