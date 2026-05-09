"use client"

import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-bg px-4">
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <h1 className="font-display font-bold text-5xl tracking-tight">
          <span className="text-text-primary">LAP</span>
          <span style={{ color: "#FF6D00" }}>ZY</span>
        </h1>

        {/* Subtítulo */}
        <p
          className="font-body text-sm tracking-[0.3em] uppercase"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Cronometragem de Kart
        </p>

        {/* Botão Google */}
        <button
          onClick={() => signIn("google")}
          className="font-body font-bold text-black bg-green rounded-md px-8 py-3 text-base transition-opacity hover:opacity-90 active:opacity-80"
        >
          Entrar com Google
        </button>
      </div>
    </main>
  )
}
