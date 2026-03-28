"use client"

import Image from "next/image"
import { FC } from "react"

interface BrandLogoProps {
  theme?: "dark" | "light"
  scale?: number
}

export const BrandLogo: FC<BrandLogoProps> = ({
  theme = "dark",
  scale = 1
}) => {
  const baseSize = 256
  const size = Math.round(baseSize * scale)
  const src = "/branding/adam-logo-v2.png"
  const className =
    theme === "dark"
      ? "brightness-125 drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]"
      : ""

  return (
    <Image
      src={src}
      alt="ADAM CHATBOT logo"
      width={size}
      height={size}
      priority
      className={className}
    />
  )
}
