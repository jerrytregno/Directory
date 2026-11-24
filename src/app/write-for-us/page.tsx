import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { GUEST_TOPICS } from "@/lib/guest-content";
import { buttonClass, buttonSecondaryClass } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Write for Us",
  description:
    "Share your expertise, insights, and experiences with our community. Submit high-quality articles about AI, SaaS, technology, digital marketing, SEO and business growth.",
  alternates: { canonical: "/write-for-us" },
};

const guidelines = [
  "Write something original. Do not submit copied or spun content.",
  "Be useful. Explain a problem, a method, or a result a reader can apply.",
  "Use clear headings so the piece is easy to scan.",
  "Cite data, tools, and sources when you rely on them.",
  "Keep the piece focused on one topic.",
  "Promotional posts, paid placement, and affiliate pitches are not accepted. Submission is free.",
];

const requirements = [
  "A specific title and a short description of about one or two sentences.",
  "A complete article. We recommend 800 words or more. Submissions need at least 80 words.",
  "Headings, lists, and examples where they help the reader.",
  "A featured image when you have one, with a plain-language description.",
  "An author name, email, and a short bio.",
  "One topic from the list we accept, plus a few keywords.",
];

const process = [
  ["01", "Create a free account", "Sign in before you send an article. There is no fee."],
  ["02", "Write and preview", "Use the editor, save a draft, and preview the article before you submit."],
  ["03", "Submit for review", "The article starts as pending. An admin then moves it through review."],
  ["04", "Revise if needed", "If we send it back, the note explains what to change. You can edit and submit again."],
  ["05", "Publication", "Approved articles can be published immediately or scheduled. Only published articles are public."],
];

const faqs = [
  ["Is guest posting free?", "Yes. SaaSListingHub does not charge to submit, review, or publish a guest article."],
  ["Who can write?", "Anyone with a SaaSListingHub account can submit. Each person only sees and edits their own articles."],
  ["What happens after I submit?", "The article is pending, then an admin can mark it under review, approve it, reject it with feedback, or publish it."],
  ["Can I edit an article later?", "You can edit drafts, pending submissions, and articles that were sent back with feedback. Published articles stay as the editor left them."],
  ["Will unpublished articles show up in search?", "No. Drafts, pending articles, and rejected articles stay private. They are not on the public blog or in the sitemap."],
];

export default async function WriteForUsPage() {
  const session = await getSession();
  const submitHref = session ? "/write-for-us/submit" : "/login?next=/write-for-us/submit";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pine">Guest posts</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-6xl">Write for Us – Share Your Knowledge with SaaSListingHub</h1>
        <p className="mt-6 text-lg leading-8 text-ink/80">
          Share your expertise, insights, and experiences with our community. Submit high-quality articles about AI, SaaS, technology, digital marketing, SEO and business growth.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={submitHref} className={buttonClass}>
            Submit your article
          </Link>
          <Link href="/guest-posts" className={buttonSecondaryClass}>
            Read guest posts
          </Link>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-3xl font-extrabold">Topics we accept</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {GUEST_TOPICS.map((topic) => (
            <li key={topic} className="rounded-2xl border border-line bg-white px-5 py-4 text-sm font-semibold">
              {topic}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold">Guest posting guidelines</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-ink/80">
            {guidelines.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold">Content requirements</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-ink/80">
            {requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-3xl font-extrabold">Submission process</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-5">
          {process.map(([step, title, detail]) => (
            <li key={step} className="rounded-2xl border border-line bg-white p-5">
              <p className="text-xs font-semibold text-muted">{step}</p>
              <h3 className="mt-2 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 rounded-3xl border border-line bg-white px-6 py-8 sm:px-10">
        <h2 className="text-3xl font-extrabold">Submit your article</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Write in the editor, preview it, and send it for free. You can keep a draft until it is ready.
        </p>
        <Link href={submitHref} className={`${buttonClass} mt-6`}>
          Submit your article
        </Link>
      </section>

      <section className="mt-14">
        <h2 className="text-3xl font-extrabold">Frequently asked questions</h2>
        <div className="mt-6 space-y-3">
          {faqs.map(([question, answer]) => (
            <details key={question} className="rounded-2xl border border-line bg-white px-5 py-4">
              <summary className="cursor-pointer text-base font-semibold">{question}</summary>
              <p className="mt-3 text-sm leading-6 text-muted">{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
