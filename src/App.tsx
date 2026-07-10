import { useEffect } from "react";
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

  if (cleanPath === "/") return <HomePage />;
  if (cleanPath === "/download") return <DownloadPage />;
  if (cleanPath === "/guide") return <GuidePage />;
  if (cleanPath === "/concepts") return <ConceptPage />;
  return <NotFoundPage />;
}
