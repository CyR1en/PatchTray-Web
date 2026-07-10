import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { pageMeta } from "./lib/pageMeta";
import { ConceptPage } from "./pages/ConceptPage";
import { DownloadPage } from "./pages/DownloadPage";
import { GuidePage } from "./pages/GuidePage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function App() {
  const cleanPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const page = cleanPath === "/download" ? "download" : cleanPath === "/guide" ? "guide" : "home";

  useEffect(() => {
    if (cleanPath === "/concepts") {
      document.title = "PatchTray concepts — design review";
      return;
    }
    if (cleanPath === "/" || cleanPath === "/download" || cleanPath === "/guide") {
      document.title = pageMeta[page].title;
      document.querySelector('meta[name="description"]')?.setAttribute("content", pageMeta[page].description);
    }
  }, [cleanPath, page]);

  return (
    <>
      {cleanPath === "/" && <HomePage />}
      {cleanPath === "/download" && <DownloadPage />}
      {cleanPath === "/guide" && <GuidePage />}
      {cleanPath === "/concepts" && <ConceptPage />}
      {cleanPath !== "/" && cleanPath !== "/download" && cleanPath !== "/guide" && cleanPath !== "/concepts" && <NotFoundPage />}
      <Analytics />
    </>
  );
}
