"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/schemas";
import { login } from "./actions";
import { Button, Input, FormField } from "@/components/ui";
export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        setError("");
        try {
          const result = await login(values);
          if ("error" in result) setError(result.error);
          else {
            router.replace("/dashboard");
            router.refresh();
          }
        } catch {
          setError("Sign-in is temporarily unavailable. Please try again.");
        }
      })}
      className="form-stack"
    >
      <FormField id="email" label="Work email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          required
          {...register("email")}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
      </FormField>
      <FormField
        id="password"
        label="Password"
        error={errors.password?.message}
      >
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          {...register("password")}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
      </FormField>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <Button disabled={!configured || isSubmitting} type="submit">
        {isSubmitting ? "Signing in…" : "Sign in securely"}{" "}
        <span aria-hidden>↗</span>
      </Button>
      <p className="muted">
        Need access or a password reset? Contact your trust administrator.
      </p>
    </form>
  );
}
