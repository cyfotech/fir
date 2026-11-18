import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Clock,
  ShieldCheck,
  ArrowUpRight,
  FileCheck,
  CheckCircle2,
  Landmark,
  FileSpreadsheet,
  Receipt,
  Wallet,
} from 'lucide-react';
import { SERVICES_CATALOG, ClientCategory, ServiceItem } from '../data/services';
import { EditableElement } from './EditableElement';
import { servicesApi } from '../api/services';

export interface EditorialServiceShowcaseContent {
  title?: string | null;
  subheading?: string | null;
  description?: string | null;
  content?: string | null;
  backgroundImage?: string | null;
  parsedContent?: Record<string, any> | null;
}

interface EditorialServiceShowcaseProps {
  onSelectServiceForConsultation: (category: ClientCategory, slug: string) => void;
  onExploreAll: () => void;
  onViewServiceDetails: (slug: string) => void;
  cmsContent?: EditorialServiceShowcaseContent | null;
}

// The four flagship service slugs. These map 1:1 to live frontend routes:
//   /services/tax-planning | /services/tax-preparation | /services/bookkeeping | /services/payroll-management
const FLAGSHIP_SLUGS = [
  'tax-planning',
  'tax-preparation',
  'bookkeeping',
  'payroll-management',
];

interface FlagshipSeed {
  slug: string;
  name: string;
  category: ClientCategory;
  shortDescription: string;
  iconName: string;
  deliverables: string[];
  turnaroundTime: string;
}

const FLAGSHIP_SEED: Record<string, FlagshipSeed> = {
  'tax-planning': {
    slug: 'tax-planning',
    name: 'Tax Planning',
    category: 'business',
    shortDescription: 'Forward-looking projections, quarterly estimates, entity structuring, and year-end strategies so you can act while there is still time.',
    iconName: 'Landmark',
    deliverables: ['Annual income & tax projections', 'Quarterly estimated tax calculations', 'Entity & S-Corp structuring', 'Year-end tax planning'],
    turnaroundTime: 'Ongoing Advisory',
  },
  'tax-preparation': {
    slug: 'tax-preparation',
    name: 'Tax Preparation',
    category: 'individual',
    shortDescription: 'Accurate individual and business returns — every income source, deduction, credit and schedule considered and organized for review.',
    iconName: 'FileSpreadsheet',
    deliverables: ['Individual 1040 returns', 'Partnership & S-Corp returns', 'C-Corp & nonprofit returns', 'Prior-year & amended returns'],
    turnaroundTime: '48–72h Draft SLA',
  },
  bookkeeping: {
    slug: 'bookkeeping',
    name: 'Bookkeeping',
    category: 'business',
    shortDescription: 'Daily transaction categorization, bank & credit-card reconciliation, and AP/AR tracking that keeps your books audit-ready all year.',
    iconName: 'Receipt',
    deliverables: ['Weekly bank feed matching', 'Accounts payable & receivable', 'Monthly variance reports', 'General ledger maintenance'],
    turnaroundTime: 'Ongoing Continuous Sync',
  },
  'payroll-management': {
    slug: 'payroll-management',
    name: 'Payroll Management',
    category: 'business',
    shortDescription: 'On-time payroll runs, direct deposit, multi-state tax withholdings, and W-2/1099 annual filings with zero penalty exposure.',
    iconName: 'Wallet',
    deliverables: ['Bi-weekly & monthly runs', 'Quarterly 941/940 filings', 'Multi-state withholding', 'Year-end W-2 & 1099-NEC'],
    turnaroundTime: 'Per Defined Pay Cycle',
  },
};

const FLAGSHIP_IMAGES: Record<string, string> = {
  'tax-planning': '/assets/reference-cards/card1-planning.webp',
  'tax-preparation': '/assets/reference-cards/card2-prep.webp',
  bookkeeping: '/assets/reference-cards/card3-bookkeeping.webp',
  'payroll-management': '/assets/reference-cards/card4-payroll.webp',
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Landmark,
  FileSpreadsheet,
  Receipt,
  Wallet,
};

const CATEGORY_LABELS: Record<string, string> = {
  cpa: 'CPA Outsourcing',
  business: 'Business & Corporate',
  individual: 'Private Wealth & Individuals',
};

export function EditorialServiceShowcase({
  onSelectServiceForConsultation,
  onExploreAll,
  onViewServiceDetails,
  cmsContent,
}: EditorialServiceShowcaseProps) {
  const [services, setServices] = useState<ServiceItem[]>(() =>
    FLAGSHIP_SLUGS.map((slug) => {
      const seed = FLAGSHIP_SEED[slug];
      const fallback = SERVICES_CATALOG.find((item) => item.slug === slug);
      return {
        id: `${slug}-seed`,
        slug,
        name: seed.name,
        category: seed.category,
        shortDescription: seed.shortDescription,
        fullDescription: seed.shortDescription,
        iconName: seed.iconName,
        deliverables: seed.deliverables,
        idealFor: fallback?.idealFor || '',
        turnaroundTime: seed.turnaroundTime,
        popular: true,
        demoType: fallback?.demoType || 'tax-workflow',
        heroTagline: seed.shortDescription,
        features: [],
        workflow: [],
        benefits: [],
        faqs: [],
        relatedSlugs: [],
      };
    }),
  );

  const displayTitle = cmsContent?.title || 'Core Practice Areas & Advisory Verticals';
  const displaySubheading = cmsContent?.subheading || 'CHAPTER 02 · FLAGSHIP SERVICES';
  const displayDescription =
    cmsContent?.description ||
    'Four flagship service lines delivered by our dual-tier review teams. Tap any card to open the live service page or book a consultation.';
  const content = cmsContent?.parsedContent || {};
  const cardGuideButton = content.cardGuideButton || 'Read More';
  const bookButton = content.bookButton || 'Book Consultation';
  const serviceImages =
    content.serviceImages && typeof content.serviceImages === 'object' && !Array.isArray(content.serviceImages)
      ? (content.serviceImages as Record<string, string>)
      : {};

  useEffect(() => {
    let active = true;
    servicesApi
      .getAll(true)
      .then((response: any) => {
        if (!active || !Array.isArray(response) || response.length === 0) return;
        const remoteBySlug = new Map(response.map((r: any) => [r.slug, r]));
        const nextServices: ServiceItem[] = FLAGSHIP_SLUGS.map((slug) => {
          const seed = FLAGSHIP_SEED[slug];
          const fallback = SERVICES_CATALOG.find((item) => item.slug === slug);
          const remote = remoteBySlug.get(slug);
          if (!remote) {
            let existing = services.find((s) => s.slug === slug);
            return existing || {
              id: `${slug}-seed`,
              slug,
              name: seed.name,
              category: seed.category,
              shortDescription: seed.shortDescription,
              fullDescription: seed.shortDescription,
              iconName: seed.iconName,
              deliverables: seed.deliverables,
              idealFor: fallback?.idealFor || '',
              turnaroundTime: seed.turnaroundTime,
              popular: true,
              demoType: fallback?.demoType || 'tax-workflow',
              heroTagline: seed.shortDescription,
              features: [],
              workflow: [],
              benefits: [],
              faqs: [],
              relatedSlugs: [],
            };
          }
          const category = remote.servicecategory?.slug || seed.category;
          return {
            id: remote.id,
            slug,
            name: remote.name || seed.name,
            category: category as ClientCategory,
            shortDescription: remote.shortDescription || seed.shortDescription,
            fullDescription: remote.fullDescription || seed.shortDescription,
            iconName: remote.iconName || seed.iconName,
            deliverables:
              Array.isArray(remote.deliverables) && remote.deliverables.length
                ? remote.deliverables
                : seed.deliverables,
            idealFor: remote.idealFor || fallback?.idealFor || '',
            turnaroundTime: remote.turnaroundTime || seed.turnaroundTime,
            popular: remote.isFeatured ?? true,
            demoType: remote.demoType || fallback?.demoType || 'tax-workflow',
            heroTagline: remote.heroTagline || remote.shortDescription || seed.shortDescription,
            features: Array.isArray(remote.features) ? remote.features : [],
            workflow: Array.isArray(remote.workflow) ? remote.workflow : [],
            benefits: Array.isArray(remote.benefits) ? remote.benefits : [],
            faqs: Array.isArray(remote.faqs) ? remote.faqs : [],
            relatedSlugs: Array.isArray(remote.relatedSlugs) ? remote.relatedSlugs : [],
          };
        });
        setServices(nextServices);
      })
      .catch((error: unknown) => {
        console.warn('Unable to load live flagship services; showing curated service cards.', error);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      id="services-preview"
      className="relative py-20 px-4 sm:px-6 lg:px-8 bg-transparent transition-colors duration-300"
      aria-label="Core Practice Areas and Advisory Verticals"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Heading — CMS-editable, preserves original styling */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-[#DCE5E2] dark:border-[rgba(32,217,149,0.18)]">
          <div className="max-w-3xl">
            <EditableElement
              sectionKey="services_showcase"
              elementKey="subheading"
              elementType="subheading"
              label="Catalog Section Subheading"
              value={displaySubheading}
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#12B981] dark:text-[#20D995] mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#20D995]" />
                <span>{displaySubheading}</span>
              </div>
            </EditableElement>

            <EditableElement
              sectionKey="services_showcase"
              elementKey="title"
              elementType="heading"
              label="Practice Catalog Headline"
              value={displayTitle}
            >
              <h2 className="text-3xl sm:text-5xl font-semibold text-[#10271F] dark:text-[#F4FAF6] tracking-tight">
                &amp; Advisory <span className="text-[#12B981] dark:text-[#20D995]">Verticals</span>
              </h2>
            </EditableElement>

            <EditableElement
              sectionKey="services_showcase"
              elementKey="description"
              elementType="paragraph"
              label="Practice Directory Description"
              value={displayDescription}
            >
              <p className="mt-3 text-sm sm:text-base text-[#425D50] dark:text-[#B3C9BD] leading-relaxed">
                {displayDescription}
              </p>
            </EditableElement>
          </div>
        </div>

        {/* Four flagship service cards — 4-col desktop, 2-col tablet, 1-col mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
          {services.map((service, idx) => {
            const Icon = ICON_MAP[service.iconName] || ShieldCheck;
            const cardImage = serviceImages[service.slug] || FLAGSHIP_IMAGES[service.slug];
            const categoryLabel = CATEGORY_LABELS[service.category] || 'Business';

            return (
              <EditableElement
                key={service.slug}
                sectionKey="services_showcase"
                elementKey={`service_${service.slug}`}
                elementType="card"
                label={`${service.name} Card`}
                value={service.name}
              >
                <article className="group flex flex-col h-full rounded-[24px] bg-white/90 dark:bg-[#09231C]/90 backdrop-blur-md border border-[#D7E7DD] dark:border-[rgba(32,217,149,0.20)] hover:border-[#12B981] dark:hover:border-[#20D995] shadow-sm dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Top status bar with pill chips */}
                  <div className="p-3.5 pb-2 flex items-center justify-between gap-2">
                    <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#063B2C]/10 dark:bg-[#063B2C]/80 text-[#063B2C] dark:text-[#20D995] border border-[#063B2C]/20 dark:border-[#20D995]/30">
                      {categoryLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold bg-black/5 dark:bg-[#061519]/70 text-[#425D50] dark:text-[#B3C9BD] border border-black/10 dark:border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full border border-emerald-400 dark:border-[#20D995]" />
                      <span>{service.turnaroundTime}</span>
                    </span>
                  </div>

                  {/* Featured card photo */}
                  <div className="relative mx-3.5 h-36 rounded-xl overflow-hidden bg-slate-900 border border-black/5 dark:border-white/5">
                    <img
                      src={cardImage}
                      alt={service.name}
                      className="w-full h-full object-cover filter brightness-95 group-hover:scale-105 group-hover:brightness-100 transition-all duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Body */}
                  <div className="p-4 pt-3.5 flex flex-col flex-1">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <span className="w-8 h-8 rounded-lg bg-[#12B981]/15 dark:bg-[#20D995]/20 flex items-center justify-center text-[#12B981] dark:text-[#20D995]">
                        <Icon className="w-4 h-4" />
                      </span>
                      <h3 className="font-bold text-base text-[#10271F] dark:text-[#F4FAF6] group-hover:text-[#12B981] dark:group-hover:text-[#20D995] transition-colors leading-snug">
                        {service.name}
                      </h3>
                    </div>

                    <p className="text-xs text-[#425D50] dark:text-[#B3C9BD] leading-relaxed mb-3.5 line-clamp-3">
                      {service.shortDescription}
                    </p>

                    <div className="space-y-1 pt-2.5 border-t border-[#D7E7DD] dark:border-[rgba(32,217,149,0.15)] mb-4">
                      <div className="text-[11px] font-bold text-[#10271F] dark:text-[#F4FAF6] mb-1 flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-[#12B981] dark:text-[#20D995]" />
                        <span>Highlights:</span>
                      </div>
                      {service.deliverables.slice(0, 3).map((del, dIdx) => (
                        <div key={dIdx} className="text-xs text-[#425D50] dark:text-[#829B8E] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-[#12B981] dark:text-[#20D995] shrink-0" />
                          <span className="truncate">{del}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions pinned to bottom */}
                    <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onViewServiceDetails(service.slug)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#12B981] dark:text-[#20D995] hover:underline underline-offset-4 group/btn"
                      >
                        <span>{cardGuideButton}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectServiceForConsultation(service.category, service.slug)}
                        className="px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-[#10271F] text-white dark:bg-[#102B21] dark:text-[#F4FAF6] border border-[#12B981]/30 dark:border-[#20D995]/30 hover:bg-[#12B981] hover:text-white dark:hover:bg-[#20D995] dark:hover:text-[#06251A] hover:shadow-[0_0_16px_rgba(32,217,149,0.35)] transition-all duration-300"
                      >
                        {bookButton}
                      </button>
                    </div>
                  </div>
                </article>
              </EditableElement>
            );
          })}
        </div>

        {/* Explore all services link */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={onExploreAll}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold bg-[#17383F] hover:bg-[#0E262B] text-white dark:bg-[#35E092] dark:hover:bg-[#27C177] dark:text-[#051917] shadow-sm transition-all"
          >
            <span>Explore All Services</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
