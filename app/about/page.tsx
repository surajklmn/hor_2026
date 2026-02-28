import Link from "next/link";
import {
  Megaphone,
  MapPin,
  Users,
  CheckCircle2,
  TrendingUp,
  Globe,
  ArrowRight,
} from "lucide-react";
// ─── Impact numbers ──────────────────────────────────────────────────────────

// ─── How it works steps ──────────────────────────────────────────────────────

const STEPS = [
  {
    n: "01",
    title: "Spot a Problem",
    body: "Identify a local or national issue — from a stalled bridge project in Lalitpur-3 to unsafe drinking water in Rukum East.",
    icon: <MapPin size={18} />,
  },
  {
    n: "02",
    title: "Raise Your Voice",
    body: "Use our interactive map to pin the issue to your specific constituency and start a structured petition.",
    icon: <Megaphone size={18} />,
  },
  {
    n: "03",
    title: "Build Momentum",
    body: "Share the petition within your community to gather upvotes and verified signatures that demonstrate the scale of demand.",
    icon: <TrendingUp size={18} />,
  },
  {
    n: "04",
    title: "Demand Action",
    body: "Once a petition hits a critical threshold, our team facilitates a formal dialogue with elected representatives and public institutions.",
    icon: <CheckCircle2 size={18} />,
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <main className="bg-gray-50">
      {/* ── Hero ── */}
      <section className="relative bg-blue-900 text-white overflow-hidden min-h-screen flex flex-col justify-center">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-700/40 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-emerald-600/20 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 text-base font-semibold text-white/80 mb-8 select-none">
            <Globe size={14} />
            About NepalVoice
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-7">
            Democracy Shouldn&apos;t Only Happen
            <br />
            <span className="text-emerald-400">Every Five Years</span>
          </h1>
          <p className="text-blue-100 text-xl sm:text-2xl leading-relaxed max-w-2xl mx-auto">
            NepalVoice is Nepal&apos;s first dedicated Civic Tech petition
            platform — bridging the gap between citizen frustration and
            government action.
          </p>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto w-full grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block text-base font-bold uppercase tracking-widest text-red-500 mb-4">
              The Problem
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-900 mb-6 leading-snug">
              The Silence in the System
            </h2>
            <div className="space-y-5 text-lg text-gray-600 leading-relaxed">
              <p>
                In Nepal, democracy often feels like a ceremony that happens
                once every five years at the ballot box. But between elections,
                the voices of ordinary citizens — especially those in rural
                constituencies — often go unheard.
              </p>
              <p>
                Broken roads, unsafe drinking water, and policy gaps aren&apos;t
                just &ldquo;complaints&rdquo;; they are failures of
                accountability. For too long, the only way to be heard was
                through unorganized social media outrage or physical protests
                that rarely led to trackable change.
              </p>
            </div>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-7 space-y-4">
            {[
              "Voices of rural constituencies routinely ignored",
              "No structured channel for citizen advocacy",
              "Social media outrage fades without accountability",
              "Physical protests rarely produce trackable change",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-red-400 block" />
                </span>
                <p className="text-base text-red-800 font-medium leading-snug">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Solution ── */}
      <section className="bg-white border-y border-gray-100 min-h-screen flex flex-col justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <span className="inline-block text-base font-bold uppercase tracking-widest text-emerald-600 mb-4">
            Our Solution
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-900 mb-6 leading-snug">
            Democracy in Your Pocket
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mb-12">
            SpeakUp Nepal is the country&apos;s first dedicated Civic Tech
            petition platform. We bridge the gap between citizen frustration and
            government action by providing a structured, digital infrastructure
            for advocacy. Unlike a typical social media post, a petition on
            SpeakUp Nepal is:
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: <MapPin size={18} />,
                title: "Localized",
                body: "Directly tied to your specific constituency using our interactive map.",
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100",
              },
              {
                icon: <Users size={18} />,
                title: "Collective",
                body: "Built on the power of verified signatures to show the real scale of public demand.",
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                border: "border-emerald-100",
              },
              {
                icon: <CheckCircle2 size={18} />,
                title: "Trackable",
                body: "We bridge petitions to relevant government agencies and follow up on results.",
                color: "text-violet-600",
                bg: "bg-violet-50",
                border: "border-violet-100",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-2xl border ${item.border} ${item.bg} p-6 flex flex-col gap-3`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm ${item.color}`}
                >
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-xl">
                  {item.title}
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto w-full">
          <span className="inline-block text-base font-bold uppercase tracking-widest text-blue-600 mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-900 mb-3 leading-snug">
            When Citizens Organize, Power Responds
          </h2>
          <p className="text-lg text-gray-500 mb-12">
            We believe in a simple four-step loop that turns frustration into
            accountability.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-4 items-start hover:border-blue-100 hover:shadow-md transition-all duration-200"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-900 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                  {step.n}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600">{step.icon}</span>
                    <h3 className="font-bold text-gray-900 text-xl">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-base text-gray-500 leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Join the Movement (CTA) ── */}
      <section className="bg-white border-y border-gray-100 min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-16 text-center">
        <span className="inline-block text-base font-bold uppercase tracking-widest text-emerald-600 mb-4">
          Join the Movement
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-900 mb-6">
          Your Voice Has Power
        </h2>
        <p className="text-lg text-gray-600 max-w-xl mx-auto mb-12 leading-relaxed">
          Whether you are a student in Kathmandu, a farmer in Sarlahi, or a
          member of our global diaspora — every signature, every petition, every
          shared link brings Nepal closer to the democracy it deserves.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/petition/new"
            className="inline-flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all"
          >
            <Megaphone size={18} />
            Start a Petition
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-7 py-3.5 rounded-xl transition-all"
          >
            <MapPin size={18} />
            Explore the Map
          </Link>
          <Link
            href="/petitions"
            className="inline-flex items-center gap-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-7 py-3.5 rounded-xl transition-all"
          >
            <ArrowRight size={18} />
            Browse Petitions
          </Link>
        </div>
      </section>
    </main>
  );
}
