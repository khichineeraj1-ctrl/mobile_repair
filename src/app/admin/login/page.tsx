import { notFound, redirect } from "next/navigation";
import { login } from "../actions";
import { adminAccess, type AdminParams } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in · Admin" };

export default async function Page({ searchParams }: { searchParams: AdminParams }) {
  const access = await adminAccess();
  if (access === "off") notFound();
  if (access !== "login") redirect("/admin");
  const s = await searchParams;
  return (
    <main className="adm-login">
      <form action={login} className="adm-card">
        <div className="adm-brand">
          <span className="logo-mark" aria-hidden="true" />
          <span>
            Screen<b>Sahi</b>
          </span>
          <em>Admin</em>
        </div>
        <h1>Sign in</h1>
        <label>
          Password
          <input className="adm-input" type="password" name="password" autoComplete="current-password" required autoFocus />
        </label>
        {s.error && <p className="adm-alert">That password is not right.</p>}
        <button className="adm-btn" type="submit">
          Sign in
        </button>
      </form>
    </main>
  );
}
