import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.18),transparent_35%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <LoginForm className=" dark w-full max-w-5xl" />
      </div>
    </main>
  );
}
