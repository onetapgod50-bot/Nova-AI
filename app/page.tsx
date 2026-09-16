import Link from "next/link";
import {
  HardHat,
  Menu,
  FilePlus2,
  Layers,
  ListChecks,
  Boxes,
  Activity,
  Camera,
  Bot,
  BarChart3,
  CalendarClock,
  FileBarChart2,
  ArrowRight,
} from "lucide-react";
import HeroIllustration from "@/components/HeroIllustration";

const FEATURES = [
  {
    icon: FilePlus2,
    title: "Project Planning",
    body: "Capture employer requirements, site details, and budgets before a single shovel goes in the ground.",
  },
  {
    icon: Layers,
    title: "Blueprint Management",
    body: "Upload, version, and annotate blueprints so the plan a crew is building from is always the latest one.",
  },
  {
    icon: ListChecks,
    title: "Task Allocation",
    body: "Break any project into ordered tasks and hand each one to the right supervisor.",
  },
  {
    icon: Boxes,
    title: "Resource Management",
    body: "Track allocated, used, and remaining quantities for materials, machinery, and crews as work happens.",
  },
  {
    icon: Activity,
    title: "Construction Progress Tracking",
    body: "Every update a supervisor submits rolls straight up into project-level progress, automatically.",
  },
  {
    icon: Camera,
    title: "Site Photo Updates",
    body: "A running photo record of the site, organized by task and date, visible to the whole project team.",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    body: "BuildNova AI answers questions about your projects directly from your project data — nothing else.",
  },
  {
    icon: BarChart3,
    title: "Project Analytics",
    body: "See completion rates, resource consumption, and deadline performance at a glance.",
  },
  {
    icon: CalendarClock,
    title: "Deadline Monitoring",
    body: "Know which tasks are on track and which are falling behind before it becomes a problem.",
  },
  {
    icon: FileBarChart2,
    title: "Reports",
    body: "Generate a clear record of what happened on site, who did it, and when.",
  },
];

const WORKFLOW = [
  "Employer Requirements",
  "Engineer Planning",
  "Manager Work Allocation",
  "Supervisor Execution",
  "Progress Verification",
  "Project Completion",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <input type="checkbox" id="nav-toggle" className="peer hidden" />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white">
              <HardHat size={16} />
            </span>
            <span className="font-mono text-[15px] font-semibold tracking-tight">BuildNova</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-inkmuted md:flex">
            <a href="#home" className="hover:text-ink">Home</a>
            <a href="#about" className="hover:text-ink">About Us</a>
            <a href="#features" className="hover:text-ink">Features</a>
            <a href="#contact" className="hover:text-ink">Contact</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="rounded-md border border-line px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand">
              Login
            </Link>
            <Link href="/login" className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-bright">
              Get Started
            </Link>
          </div>

          <label htmlFor="nav-toggle" className="cursor-pointer md:hidden">
            <Menu size={22} />
          </label>
        </div>

        <div className="hidden flex-col gap-1 border-t border-line px-5 py-3 text-sm peer-checked:flex md:hidden">
          <a href="#home" className="py-1.5 text-inkmuted">Home</a>
          <a href="#about" className="py-1.5 text-inkmuted">About Us</a>
          <a href="#features" className="py-1.5 text-inkmuted">Features</a>
          <a href="#contact" className="py-1.5 text-inkmuted">Contact</a>
          <Link href="/login" className="mt-2 rounded-md border border-line px-4 py-2 text-center font-medium">Login</Link>
          <Link href="/login" className="mt-2 rounded-md bg-brand px-4 py-2 text-center font-medium text-white">Get Started</Link>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="blueprint-field border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <h1 className="max-w-lg text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Build Smarter. Manage Better. BuildNova.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-inkmuted">
              An intelligent infrastructure management platform connecting engineers, managers
              and supervisors through one centralized system.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand-bright"
              >
                Get Started <ArrowRight size={15} />
              </Link>
              <a
                href="#features"
                className="rounded-md border border-line px-5 py-3 text-sm font-medium hover:border-brand hover:text-brand"
              >
                Explore Features
              </a>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="text-xl font-semibold">One workflow, from requirements to completion</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            {WORKFLOW.map((step, i) => (
              <div key={step} className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-brand font-mono text-xs font-semibold text-brand">
                  {i + 1}
                </div>
                <p className="mt-3 text-sm leading-snug text-ink">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-b border-line bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-16">
          <h2 className="text-xl font-semibold">About BuildNova</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-inkmuted">
            BuildNova is an intelligent infrastructure management platform designed to coordinate
            construction planning, resource allocation, workforce management and site progress
            monitoring. It connects the three people who make a project happen — the engineer who
            plans it, the manager who runs it, and the supervisor who builds it — through one
            shared system, so nothing gets lost between a blueprint and a finished building.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-xl font-semibold">Everything a project team needs in one place</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-md border border-line p-5">
                <f.icon size={18} className="text-brand" strokeWidth={1.75} />
                <h3 className="mt-3 text-sm font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-inkmuted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center">
          <h2 className="text-xl font-semibold">Have questions about a pilot?</h2>
          <p className="mt-3 text-[15px] text-inkmuted">
            Reach the BuildNova team and we'll help you get your first project set up.
          </p>
          <a
            href="mailto:hello@buildnova.dev"
            className="mt-6 inline-block rounded-md bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand-bright"
          >
            hello@buildnova.dev
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-inkmuted sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-brand text-white">
              <HardHat size={12} />
            </span>
            <span className="font-mono font-medium text-ink">BuildNova</span>
          </div>
          <p>© {new Date().getFullYear()} BuildNova. Built for engineers, managers, and supervisors.</p>
        </div>
      </footer>
    </div>
  );
}
