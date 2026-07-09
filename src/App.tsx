import React from "react";
import { Navigate } from "react-router-dom";
import type { RouteRecord } from "vite-react-ssg";
import TopLevelLayout from "@/components/TopLevelLayout";
import LocaleLayout from "@/components/LocaleLayout";
import CompoundPage from "@/pages/compound-calculator";
import InstallmentPage from "@/pages/installment";
import AveragePricePage from "@/pages/average-price";
import PrivacyPage from "@/pages/privacy";
import ContactPage from "@/pages/contact";
import NotFound from "@/pages/not-found";

const localeChildren: RouteRecord[] = [
  { index: true, element: <CompoundPage /> },
  { path: "installment", element: <InstallmentPage /> },
  { path: "average-price", element: <AveragePricePage /> },
  { path: "privacy", element: <PrivacyPage /> },
  { path: "contact", element: <ContactPage /> },
];

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <TopLevelLayout />,
    children: [
      { index: true, element: <Navigate to="/ko" replace /> },
      {
        path: ":locale",
        element: <LocaleLayout />,
        children: localeChildren,
      },
      { path: "*", element: <NotFound /> },
    ],
  },
];
