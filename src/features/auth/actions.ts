"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { authSchema, type AuthInput } from "./schema";

export async function loginAction(input: AuthInput) {
  const supabase = await createClient();
  const parsed = authSchema.parse(input);

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.email,
    password: parsed.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function signupAction(input: AuthInput) {
  const supabase = await createClient();
  const parsed = authSchema.parse(input);

  const { error } = await supabase.auth.signUp({
    email: parsed.email,
    password: parsed.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function logoutAction() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");
}
