import { SITE_URL as BASE_URL } from "@/lib/env";

type JobRow = {
  id: string;
  title_ko: string;
  title_en: string | null;
  department: string | null;
  employment_type: string | null;
  description_ko: string | null;
  description_en: string | null;
  requirements_ko: string | null;
  requirements_en: string | null;
  benefits_ko: string | null;
  benefits_en: string | null;
  deadline: string | null;
  created_at: string;
};

const HIRING_ORG = {
  "@type": "Organization",
  name: "나진테크",
  alternateName: "NAJIN TECHNOLOGY",
  sameAs: BASE_URL,
  logo: `${BASE_URL}/images/logo/najin-logo.png`,
};

const JOB_LOCATION = {
  "@type": "Place",
  address: {
    "@type": "PostalAddress",
    streetAddress: "산막공단남14길 170",
    addressLocality: "양산시",
    addressRegion: "경상남도",
    postalCode: "50571",
    addressCountry: "KR",
  },
};

function mapEmploymentType(raw: string | null | undefined) {
  const v = (raw || "").trim();
  if (!v) return "FULL_TIME";
  if (v.includes("계약")) return "CONTRACTOR";
  if (v.includes("파트") || v.includes("아르바이트")) return "PART_TIME";
  if (v.includes("인턴")) return "INTERN";
  if (v.includes("임시")) return "TEMPORARY";
  return "FULL_TIME";
}

function joinNonEmpty(parts: (string | null | undefined)[]) {
  return parts.filter((p) => p && p.trim()).join("\n\n");
}

export function buildJobPostingsJsonLd(jobs: JobRow[], locale: string) {
  if (!jobs || jobs.length === 0) return null;
  const isKo = locale === "ko";

  return jobs.map((job) => {
    const title = isKo ? job.title_ko : job.title_en || job.title_ko;
    const description = joinNonEmpty([
      isKo ? job.description_ko : job.description_en || job.description_ko,
      isKo ? job.requirements_ko : job.requirements_en || job.requirements_ko,
      isKo ? job.benefits_ko : job.benefits_en || job.benefits_ko,
    ]);

    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title,
      description,
      datePosted: job.created_at,
      ...(job.deadline ? { validThrough: job.deadline } : {}),
      employmentType: mapEmploymentType(job.employment_type),
      hiringOrganization: HIRING_ORG,
      jobLocation: JOB_LOCATION,
      ...(job.department ? { industry: job.department } : {}),
      directApply: true,
      url: `${BASE_URL}/${locale}/careers#job-${job.id}`,
    };
  });
}
