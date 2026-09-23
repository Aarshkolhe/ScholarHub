import React from "react"

interface ScholarHubAiAvatarProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
  showContainer?: boolean
}

export function ScholarHubAiAvatar({
  size = "md",
  className = "",
  showContainer = true,
}: ScholarHubAiAvatarProps) {
  const sizeMap = {
    xs: "size-5",
    sm: "size-6",
    md: "size-8",
    lg: "size-10",
    xl: "size-12",
  }

  const containerSize = sizeMap[size] || sizeMap.md

  const svgContent = (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full transform transition-transform duration-300 hover:scale-105"
      role="img"
      aria-label="ScholarHub AI Mascot"
    >
      <line x1="50" y1="18" x2="50" y2="8" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="6" r="4" fill="#38BDF8" className="animate-pulse" />
      <rect x="18" y="18" width="64" height="54" rx="20" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="3" />
      <rect x="12" y="38" width="6" height="14" rx="3" fill="#94A3B8" />
      <rect x="82" y="38" width="6" height="14" rx="3" fill="#94A3B8" />
      <rect x="25" y="25" width="50" height="40" rx="14" fill="#0F172A" />
      <circle cx="40" cy="42" r="6.5" fill="#38BDF8" />
      <circle cx="42" cy="40" r="2" fill="#FFFFFF" />
      <circle cx="60" cy="42" r="6.5" fill="#38BDF8" />
      <circle cx="62" cy="40" r="2" fill="#FFFFFF" />
      <path
        d="M 42 53 Q 50 60 58 53"
        stroke="#38BDF8"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M 36 72 L 64 72 L 70 88 L 30 88 Z" fill="#E2E8F0" />
      <path d="M 40 76 L 60 76" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )

  if (!showContainer) {
    return <div className={`${containerSize} shrink-0 ${className}`}>{svgContent}</div>
  }

  return (
    <div
      className={`flex ${containerSize} shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 text-white shadow-sm shadow-blue-500/20 ${className}`}
    >
      {svgContent}
    </div>
  )
}

export default ScholarHubAiAvatar
