import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/AuthForms";
import { AuthShell } from "@/components/AuthShell";
import { getSession } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { buttonClass, buttonSecondaryClass } from "@/lib/styles";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);
  const session = await getSession();
  if (session) {
    const continueHref = nextPath === "/" ? "/submit" : nextPath;
    return (
      <AuthShell
        title="You're signed in"
        lede={`${session.name} is already signed in on this browser. Log out to use a different account.`}
      >
        <div className="space-y-3">
          <Link href={continueHref} className={`${buttonClass} w-full`}>
            Continue
          </Link>
          <form action={logout}>
            <input type="hidden" name="next" value="/login" />
            <button type="submit" className={`${buttonSecondaryClass} w-full`}>
              Log out
            </button>
          </form>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Log in"
      lede="Use your SaaSListingHub account to submit and manage listings."
      footer={
        <>
          New to SaaSListingHub?{" "}
          <Link href={params.next ? `/signup?next=${encodeURIComponent(nextPath)}` : "/signup"} className="font-semibold text-pine hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm nextPath={nextPath} passwordReset={params.reset === "1"} />
    </AuthShell>
  );
}
