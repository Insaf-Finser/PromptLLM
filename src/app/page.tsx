import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

const faqItems = [
  {
    q: "Which model providers does PromptDesk support?",
    a: "PromptDesk currently runs evals against Groq's free API (Llama and Gemma models). Support for additional providers is on the roadmap.",
  },
  {
    q: "Is my data shared with other users?",
    a: "No. Prompts, versions, test cases, and eval results are private to your account.",
  },
  {
    q: "Is there a free tier?",
    a: "Yes — signing up and using PromptDesk is free. You provide your own model API usage.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const ctaHref = session?.user ? "/prompts" : "/signup";

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section className="mx-auto max-w-[1280px] px-6 py-24 text-center">
        <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
          Stop guessing whether your prompt got better.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-500">
          PromptDesk versions every prompt you write, runs it against real test
          cases, and shows you the pass rate — so "I tweaked it" becomes a
          number, not a feeling.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href={ctaHref}
            className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            {session?.user ? "Go to your prompts" : "Get started free"}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 pb-24">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <Feature
            title="Version every change"
            body="Every edit to a prompt is a new, immutable version — never overwrite history you might want back."
          />
          <Feature
            title="Test against real cases"
            body="Define the inputs and what a good answer looks like once. Reuse the same set across every version."
          />
          <Feature
            title="See the pass rate"
            body="Run a version against its test cases and grade the results — compare two versions side by side before you ship."
          />
        </div>
      </section>

      <section className="mx-auto max-w-[680px] px-6 pb-24">
        <h2 className="text-xl font-semibold text-neutral-900">FAQ</h2>
        <dl className="mt-4 space-y-4">
          {faqItems.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </dl>
      </section>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-medium text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm text-neutral-500">{body}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <dt className="font-medium text-neutral-900">{q}</dt>
      <dd className="mt-1 text-sm text-neutral-500">{a}</dd>
    </div>
  );
}
