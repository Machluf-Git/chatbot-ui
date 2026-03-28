"use client"

import Image from "next/image"
import { FC } from "react"

interface BrandLogoProps {
  theme?: "dark" | "light"
  scale?: number
}

export const BrandLogo: FC<BrandLogoProps> = ({ theme = "dark", scale = 1 }) => {
  void theme
  const baseSize = 192
  const size = Math.round(baseSize * scale)
  const src = "/branding/adam-logo.png"

  return (
    <Image
      src={src}
      alt="ADAM CHATBOT logo"
      width={size}
      height={size}
      priority
    />
  )
}
