import type { ComponentType } from "react";
import { useDocumentMeta } from "./hooks/useDocumentMeta";
import { resolveRoute } from "./lib/routes";

export function App({ pathname, PageComponent }: { pathname: string; PageComponent: ComponentType }) {
  const route = resolveRoute(pathname);

  useDocumentMeta(route?.page ?? "notFound", route?.path ?? "/404");

  return <PageComponent />;
}
