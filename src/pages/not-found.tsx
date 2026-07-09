import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 — FinCalc</title>
      </Helmet>
      <div className="min-h-[60vh] w-full flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">404</h1>
          </div>
          <p className="text-muted-foreground mb-6">페이지를 찾을 수 없습니다.</p>
          <Link
            to="/ko"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            홈으로 가기
          </Link>
        </div>
      </div>
    </>
  );
}
