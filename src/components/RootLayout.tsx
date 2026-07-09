import React from "react";
import { Outlet } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <I18nProvider>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
          </div>
          <Toaster />
        </I18nProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
