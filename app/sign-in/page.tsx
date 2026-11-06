import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignInRouteFallback } from "@/components/route-fallback";

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInRouteFallback />}>
      <SignInForm />
    </Suspense>
  );
}
