import { CheckoutSuccessPage } from "../pages/CheckoutSuccessPage";
import { ConceptPage } from "../pages/ConceptPage";
import { DownloadPage } from "../pages/DownloadPage";
import { FaqPage } from "../pages/FaqPage";
import { FirstVst3ChainGuidePage } from "../pages/FirstVst3ChainGuidePage";
import { GuidesPage } from "../pages/GuidesPage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PrivacyPage } from "../pages/PrivacyPage";
import { RefundsPage } from "../pages/RefundsPage";
import { SupportPage } from "../pages/SupportPage";
import { TermsPage } from "../pages/TermsPage";
import { VoicemeeterVst3GuidePage } from "../pages/VoicemeeterVst3GuidePage";
import { Vst3WithoutDawGuidePage } from "../pages/Vst3WithoutDawGuidePage";
import type { PageComponent, PageName } from "./types";
import { BlogArticlePage } from "../pages/BlogArticlePage";
import { BlogPage } from "../pages/BlogPage";

/**
 * Eager component map used only by the server renderer. The browser uses
 * `pageLoaders.ts` so it downloads the current route instead of every page.
 */
export const pageComponents: Record<PageName, PageComponent> = {
  home: HomePage,
  download: DownloadPage,
  faq: FaqPage,
  firstVst3ChainGuide: FirstVst3ChainGuidePage,
  guides: GuidesPage,
  voicemeeterVst3Guide: VoicemeeterVst3GuidePage,
  vst3WithoutDawGuide: Vst3WithoutDawGuidePage,
  privacy: PrivacyPage,
  terms: TermsPage,
  refunds: RefundsPage,
  support: SupportPage,
  checkoutSuccess: CheckoutSuccessPage,
  concepts: ConceptPage,
  blog: BlogPage,
  blogArticle: BlogArticlePage,
  notFound: NotFoundPage,
};
