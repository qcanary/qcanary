import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Qcanary",
};

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#22C55E",
            colorBackground: "#111111",
            colorText: "#FAFAFA",
            colorTextSecondary: "#71717A",
            colorInputBackground: "#0F0F0F",
            colorInputText: "#FAFAFA",
            borderRadius: "0.5rem",
            fontFamily: "var(--font-inter)",
          },
          elements: {
            card: "bg-surface border border-border",
            headerTitle: "text-text-primary",
            headerSubtitle: "text-text-muted",
            formButtonPrimary: "bg-accent text-black hover:bg-accent/90",
            formFieldLabel: "text-text-primary",
            formFieldInput: "bg-code-bg text-text-primary border border-border",
            footerActionText: "text-text-muted",
            footerActionLink: "text-accent hover:opacity-90",
            socialButtonsBlockButton:
              "bg-surface border border-border text-text-primary hover:bg-surface/80",
            socialButtonsBlockButtonText: "text-text-primary",
          },
        }}
        afterSignInUrl="/onboarding"
        signUpUrl="/sign-up"
      />
    </main>
  );
}
