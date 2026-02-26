"use client";

import Link from "next/link";
import { useCartOptional } from "../context/CartContext";

type Variant = "nav" | "button" | "sidebar";

/**
 * Enlace al carrito de compra. Muestra "Carrito (N)" cuando hay ítems.
 * Usar en navbar, pricing y dashboard admin-ph para que el carrito sea visible.
 */
export default function CartNavLink({ variant = "nav" }: { variant?: Variant }) {
  const cart = useCartOptional();
  const itemCount = cart?.itemCount ?? 0;
  const label = itemCount > 0 ? `Carrito (${itemCount})` : "Carrito";

  if (variant === "sidebar") {
    return (
      <Link
        href="/cart"
        className="sidebar-link"
        style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
      >
        <span aria-hidden>🛒</span>
        {label}
      </Link>
    );
  }

  if (variant === "button") {
    return (
      <Link
        href="/cart"
        className="btn btn-ghost"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 14px",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        <span aria-hidden>🛒</span>
        {label}
      </Link>
    );
  }

  return (
    <Link
      href="/cart"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 12px",
        fontSize: "14px",
        fontWeight: 500,
        color: "var(--color-primary, #818cf8)",
        textDecoration: "none",
      }}
    >
      <span aria-hidden>🛒</span>
      {label}
    </Link>
  );
}
