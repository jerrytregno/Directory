import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "@/components/AuthForms";
import { AuthShell } from "@/components/AuthShell";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset password"
      lede="Enter the email on your account. If it matches an account, Firebase sends a message with a link to choose a new password."
      footer={
        <Link href="/login" className="font-semibold text-pine hover:underline">
          Back to log in
        </Link>
      }
    >
      <ForgotForm />
    </AuthShell>
  );
}
