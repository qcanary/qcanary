/**
 * Marketing landing page
 * Full implementation: Session 16
 */
export default function MarketingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          <span className="text-accent">Qcanary</span>
        </h1>
        <p className="mt-4 text-lg text-text-muted">
          BullMQ monitoring that never touches your Redis.
        </p>
      </div>
    </main>
  );
}
