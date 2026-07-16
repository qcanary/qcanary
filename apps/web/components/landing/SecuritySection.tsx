import Link from "next/link";
import { EyeOff, FileCode, Server, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SecuritySection() {
  return (
    <section className="border-y border-border bg-gradient-to-b from-surface/20 to-bg">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 max-w-2xl animate-fade-in-up">
            <Badge variant="outline" className="mb-4 border-accent/30 text-accent">Security</Badge>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">We don&rsquo;t need your keys. Here&rsquo;s the proof.</h2>
            <p className="mt-3 text-text-muted">
              Radical transparency isn&rsquo;t a marketing angle. It&rsquo;s the bare minimum
              for infrastructure tools.
            </p>
          </div>

          <div className="mb-10 grid gap-5 md:grid-cols-2 animate-fade-in-up-delay-1">
            {/* Card 1: Zero Redis Exposure */}
            <div className="card-hover group rounded-xl border border-border bg-surface/40 p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">Zero Redis Exposure</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Your Redis URL never leaves your network. Our agent runs inside your
                worker process and streams metadata over HTTPS. We couldn&rsquo;t access your Redis
                even if we wanted to.
              </p>
            </div>

            {/* Card 2: Metadata Only */}
            <div className="card-hover group rounded-xl border border-border bg-surface/40 p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <EyeOff className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">Metadata Only</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                We collect jobId, queueName, status, duration, and errorMessage. We never
                see your job payloads, your business data, or your Redis keys. Ever.
              </p>
            </div>

            {/* Card 3: Open Source Agent */}
            <div className="card-hover group rounded-xl border border-border bg-surface/40 p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <FileCode className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">Open Source Agent</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                The @qcanary/agent package is MIT-licensed. Audit every line. Run it
                through your security review. Fork it if we disappear.
              </p>
            </div>

            {/* Card 4: Self-Hosted Option */}
            <div className="card-hover group rounded-xl border border-border bg-surface/40 p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Server className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">Self-Hosted Option</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Enterprise teams can deploy the entire dashboard on-premise or in their
                own VPC. No data leaves your infrastructure. Contact us for details.
              </p>
            </div>
          </div>

          {/* Honesty block */}
          <div className="animate-fade-in-up-delay-2 mx-auto max-w-2xl rounded-xl border border-border bg-surface/20 px-6 py-5 text-center">
            <p className="text-sm italic text-text-muted">
              We are not SOC 2 certified yet. We are working toward SOC 2 Type II.{" "}
              <Link href="/trust#compliance" className="text-accent hover:underline">
                Track our progress &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
