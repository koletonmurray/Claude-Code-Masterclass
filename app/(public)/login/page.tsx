import AuthForm from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div style={{ paddingTop: "6rem" }}>
      <AuthForm mode="login" />
    </div>
  );
}
