import { useDocumentMeta } from "./hooks/useDocumentMeta";
import type { PageComponent, ResolvedPage } from "./lib/types";

export function App({
  resolvedPage,
  PageComponent,
}: {
  resolvedPage: ResolvedPage;
  PageComponent: PageComponent;
}) {
  useDocumentMeta(resolvedPage);

  return <PageComponent resolvedPage={resolvedPage} />;
}
