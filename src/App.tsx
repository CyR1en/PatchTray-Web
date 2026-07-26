import { useDocumentMeta } from "./hooks/useDocumentMeta";
import { resolveRoute } from "./lib/routes";
import { NotFoundPage } from "./pages/NotFoundPage";

export function App() {
  const route = resolveRoute(window.location.pathname);

  useDocumentMeta(route?.page ?? "notFound");

  if (!route) return <NotFoundPage />;

  const Page = route.component;
  return <Page />;
}
