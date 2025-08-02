import SignUpForm from "@/app/components/auth/signup-form";
import { Container } from "@/app/components/Container";

export default function SignUpPage() {
  return (
    <Container>
      <div className="py-20">
        <SignUpForm />
      </div>
    </Container>
  );
}
