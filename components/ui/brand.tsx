"use client"

import Link from "next/link"
import { FC } from "react"
import { BrandLogo } from "../icons/brand-logo"

interface BrandProps {
  theme?: "dark" | "light"
}

export const Brand: FC<BrandProps> = ({ theme = "dark" }) => {
  return (
    <Link
      className="flex cursor-pointer flex-col items-center hover:opacity-50"
      href="/"
    >
      <div className="mb-2">
        <BrandLogo theme={theme === "dark" ? "dark" : "light"} scale={0.28} />
      </div>

      <div className="text-4xl font-bold tracking-wide">ADAM CHATBOT</div>
    </Link>
  )
}
