import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "@/components/AuthForms";
import { AuthShell } from "@/components/AuthShell";
import { Notice } from "@/components/Notice";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; oobCode?: string }>;
}) {
  const params = await searchParams;
  const token = params.oobCode || params.token || "";

  return (
    <AuthShell
      title="Choose a new password"
      lede="This replaces the password on your account and signs out older sessions."
      footer={
        <Link href="/forgot-password" className="font-semibold text-pine hover:underline">
          Request a new link
        </Link>
      }
    >
      {token ? <ResetForm token={token} /> : <Notice tone="error">This reset link is missing a token.</Notice>}
    </AuthShell>
  );
}
