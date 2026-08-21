"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginScreen } from "@/components/LoginScreen";
import { useAppSelector } from "@/store/hooks";

export default function LoginPage() {
  const router = useRouter();
  const { token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && user) {
      router.push("/chat");
    }
  }, [token, user, router]);

  return <LoginScreen />;
}
