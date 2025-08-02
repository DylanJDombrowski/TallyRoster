// app/signup/page.tsx
import { Suspense } from "react";
import SignUpForm from "@/app/components/auth/signup-form";
import { Container } from "@/app/components/Container";

export default function SignUpPage() {
  return (
    <Container>
      <div className="py-20">
        <Suspense
          fallback={
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          }
        >
          <SignUpForm />
        </Suspense>
      </div>
    </Container>
  );
}
