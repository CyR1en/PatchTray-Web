import type { PageComponent, PageName } from "./types";

type PageLoader = () => Promise<PageComponent>;

/**
 * One dynamic import per route keeps unrelated page code out of the initial
 * client bundle. Static HTML remains complete while the current page chunk
 * loads, then React hydrates with the already-resolved component.
 */
const pageLoaders: Record<PageName, PageLoader> = {
  home: () => import("../pages/HomePage").then(({ HomePage }) => HomePage),
  download: () => import("../pages/DownloadPage").then(({ DownloadPage }) => DownloadPage),
  faq: () => import("../pages/FaqPage").then(({ FaqPage }) => FaqPage),
  firstVst3ChainGuide: () =>
    import("../pages/FirstVst3ChainGuidePage").then(({ FirstVst3ChainGuidePage }) => FirstVst3ChainGuidePage),
  guides: () => import("../pages/GuidesPage").then(({ GuidesPage }) => GuidesPage),
  voicemeeterVst3Guide: () =>
    import("../pages/VoicemeeterVst3GuidePage").then(({ VoicemeeterVst3GuidePage }) => VoicemeeterVst3GuidePage),
  vst3WithoutDawGuide: () =>
    import("../pages/Vst3WithoutDawGuidePage").then(({ Vst3WithoutDawGuidePage }) => Vst3WithoutDawGuidePage),
  privacy: () => import("../pages/PrivacyPage").then(({ PrivacyPage }) => PrivacyPage),
  terms: () => import("../pages/TermsPage").then(({ TermsPage }) => TermsPage),
  refunds: () => import("../pages/RefundsPage").then(({ RefundsPage }) => RefundsPage),
  support: () => import("../pages/SupportPage").then(({ SupportPage }) => SupportPage),
  checkoutSuccess: () =>
    import("../pages/CheckoutSuccessPage").then(({ CheckoutSuccessPage }) => CheckoutSuccessPage),
  concepts: () => import("../pages/ConceptPage").then(({ ConceptPage }) => ConceptPage),
  blog: () => import("../pages/BlogPage").then(({ BlogPage }) => BlogPage),
  blogArticle: () =>
    import("../pages/BlogArticlePage").then(({ BlogArticlePage }) => BlogArticlePage),
  notFound: () => import("../pages/NotFoundPage").then(({ NotFoundPage }) => NotFoundPage),
};

export function loadPageComponent(page: PageName): Promise<PageComponent> {
  return pageLoaders[page]();
}
