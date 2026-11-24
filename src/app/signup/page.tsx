import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/AuthForms";
import { AuthShell } from "@/components/AuthShell";
import { getSession } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { buttonClass, buttonSecondaryClass } from "@/lib/styles";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);
  const session = await getSession();
  if (session) {
    const continueHref = nextPath === "/" ? "/submit" : nextPath;
    return (
      <AuthShell
        title="You're signed in"
        lede={`${session.name} is already signed in on this browser. Log out to create a different account.`}
      >
        <div className="space-y-3">
          <Link href={continueHref} className={`${buttonClass} w-full`}>
            Continue
          </Link>
          <form action={logout}>
            <input type="hidden" name="next" value="/signup" />
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
      title="Create an account"
      lede="Accounts are free. You only need one to submit a listing."
      footer={
        <>
          Already have an account?{" "}
          <Link href={params.next ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"} className="font-semibold text-pine hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm nextPath={nextPath} />
    </AuthShell>
  );
}
