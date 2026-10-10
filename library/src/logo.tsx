import type React from 'react'
import { useId } from 'react'
import { pop } from './lib/confetti'

/* Aerobox Assets logomark (Figma test-belajar-ai 2672:10765): an isometric gift box on the dark glow tile.
   Body and lid are separate groups so the lid can pop open. */
export const BRAND = 'Aerobox Assets'

const BODY = `<path d="M28.3833 9.95203L44.981 19.5341L28.3833 29.1186L11.7856 19.5341L28.3833 9.95203Z" fill="white" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> <path d="M11.7856 19.5339L28.3833 29.1184V42.5334L11.7856 32.9513V19.5339Z" fill="#E3EAFF" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> <path d="M44.9805 19.5339L28.3828 29.1184V42.5334L44.9805 32.9513V19.5339Z" fill="#B8C8F8" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> <g> <path d="M18.7021 23.5288L21.4668 25.1262V38.5411L18.7021 36.9437V23.5288Z" fill="#4D7CFE"/> <path d="M18.7021 23.5288L21.4668 25.1262V38.5411L18.7021 36.9437V23.5288Z" fill="url(#paint0_linear)"/> <path d="M18.7021 23.5288L21.4668 25.1262V38.5411L18.7021 36.9437V23.5288Z" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> </g> <g> <path d="M38.064 23.5288L35.2993 25.1262V38.5411L38.064 36.9437V23.5288Z" fill="#3C61C6"/> <path d="M38.064 23.5288L35.2993 25.1262V38.5411L38.064 36.9437V23.5288Z" fill="url(#paint1_linear)"/> <path d="M38.064 23.5288L35.2993 25.1262V38.5411L38.064 36.9437V23.5288Z" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> </g>`
const LID = `<path d="M28.3829 5.80005L46.6408 16.3415L28.3829 26.8806L10.125 16.3415L28.3829 5.80005Z" fill="white" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> <path d="M10.125 16.3417L28.3829 26.8808V30.0756L10.125 19.5341V16.3417Z" fill="#E3EAFF" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> <path d="M46.6407 16.3417L28.3828 26.8808V30.0756L46.6407 19.5341V16.3417Z" fill="#B8C8F8" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> <path d="M17.8701 20.8124L20.6372 22.4098V25.6046L17.8701 24.0072V20.8124Z" fill="#98B3FE" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> <path d="M38.895 20.8124L36.1279 22.4098V25.6046L38.895 24.0072V20.8124Z" fill="#98B3FE" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> <path d="M36.128 10.271L38.8951 11.8684L20.6372 22.4099L17.8701 20.8125L36.128 10.271Z" fill="#98B3FE" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> <path d="M20.6372 10.271L38.8951 20.8125L36.128 22.4099L17.8701 11.8684L20.6372 10.271Z" fill="#98B3FE" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> <path d="M25.6159 9.63293L28.9364 11.5494L25.6159 13.4658L22.2979 11.5494L25.6159 9.63293Z" fill="#98B3FE" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> <g> <path d="M22.2979 11.5493L25.6159 13.4657V16.6606L22.2979 14.7441V11.5493Z" fill="#4D7CFE"/> <path d="M22.2979 11.5493L25.6159 13.4657V16.6606L22.2979 14.7441V11.5493Z" fill="url(#paint2_linear)"/> <path d="M22.2979 11.5493L25.6159 13.4657V16.6606L22.2979 14.7441V11.5493Z" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> </g> <g> <path d="M28.9362 11.5493L25.6157 13.4657V16.6606L28.9362 14.7441V11.5493Z" fill="#4D7CFE"/> <path d="M28.9362 11.5493L25.6157 13.4657V16.6606L28.9362 14.7441V11.5493Z" fill="url(#paint3_linear)"/> <path d="M28.9362 11.5493L25.6157 13.4657V16.6606L28.9362 14.7441V11.5493Z" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> </g> <path d="M31.1501 12.8278L34.4682 14.7442L31.1501 16.6606L27.8296 14.7442L31.1501 12.8278Z" fill="#98B3FE" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> <g> <path d="M27.8296 14.7443L31.1501 16.6607V19.8555L27.8296 17.9391V14.7443Z" fill="#4D7CFE"/> <path d="M27.8296 14.7443L31.1501 16.6607V19.8555L27.8296 17.9391V14.7443Z" fill="url(#paint4_linear)"/> <path d="M27.8296 14.7443L31.1501 16.6607V19.8555L27.8296 17.9391V14.7443Z" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> </g> <g> <path d="M34.468 14.7443L31.1499 16.6607V19.8555L34.468 17.9391V14.7443Z" fill="#4D7CFE"/> <path d="M34.468 14.7443L31.1499 16.6607V19.8555L34.468 17.9391V14.7443Z" fill="url(#paint5_linear)"/> <path d="M34.468 14.7443L31.1499 16.6607V19.8555L34.468 17.9391V14.7443Z" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> </g> <path d="M28.3828 12.5087L31.1499 14.1061L28.3828 15.7011L25.6157 14.1061L28.3828 12.5087Z" fill="#98B3FE" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> <g> <path d="M25.6157 14.1062L28.3828 15.7012V17.939L25.6157 16.3416V14.1062Z" fill="#4D7CFE"/> <path d="M25.6157 14.1062L28.3828 15.7012V17.939L25.6157 16.3416V14.1062Z" fill="url(#paint6_linear)"/> <path d="M25.6157 14.1062L28.3828 15.7012V17.939L25.6157 16.3416V14.1062Z" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> </g> <g> <path d="M31.1499 14.1062L28.3828 15.7012V17.939L31.1499 16.3416V14.1062Z" fill="#4D7CFE"/> <path d="M31.1499 14.1062L28.3828 15.7012V17.939L31.1499 16.3416V14.1062Z" fill="url(#paint7_linear)"/> <path d="M31.1499 14.1062L28.3828 15.7012V17.939L31.1499 16.3416V14.1062Z" stroke="#1F2A5A" stroke-width="0.241667" stroke-linejoin="round"/> </g>`
const DEFS = `<linearGradient x1="20.0845" y1="23.5288" x2="20.0845" y2="38.5411" gradientUnits="userSpaceOnUse"> <stop stop-color="#2C84FF"/> <stop offset="1" stop-color="#836BFF"/> </linearGradient> <linearGradient x1="36.6817" y1="23.5288" x2="36.6817" y2="38.5411" gradientUnits="userSpaceOnUse"> <stop stop-color="#2C84FF"/> <stop offset="1" stop-color="#836BFF"/> </linearGradient> <linearGradient x1="23.9569" y1="11.5493" x2="23.9569" y2="16.6606" gradientUnits="userSpaceOnUse"> <stop stop-color="#2C84FF"/> <stop offset="1" stop-color="#836BFF"/> </linearGradient> <linearGradient x1="27.276" y1="11.5493" x2="27.276" y2="16.6606" gradientUnits="userSpaceOnUse"> <stop stop-color="#2C84FF"/> <stop offset="1" stop-color="#836BFF"/> </linearGradient> <linearGradient x1="29.4898" y1="14.7443" x2="29.4898" y2="19.8555" gradientUnits="userSpaceOnUse"> <stop stop-color="#2C84FF"/> <stop offset="1" stop-color="#836BFF"/> </linearGradient> <linearGradient x1="32.8089" y1="14.7443" x2="32.8089" y2="19.8555" gradientUnits="userSpaceOnUse"> <stop stop-color="#2C84FF"/> <stop offset="1" stop-color="#836BFF"/> </linearGradient> <linearGradient x1="26.9993" y1="14.1062" x2="26.9993" y2="17.939" gradientUnits="userSpaceOnUse"> <stop stop-color="#2C84FF"/> <stop offset="1" stop-color="#836BFF"/> </linearGradient> <linearGradient x1="29.7664" y1="14.1062" x2="29.7664" y2="17.939" gradientUnits="userSpaceOnUse"> <stop stop-color="#2C84FF"/> <stop offset="1" stop-color="#836BFF"/> </linearGradient>`

export function logoSvg(size = 50, uid = 'ab') {
  const u = (t: string) => t.replace(/paint(\d)_linear/g, `${uid}p$1`)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 50 50" fill="none"><defs>${u(DEFS)}`
    + `<clipPath id="${uid}c"><rect width="50" height="50" rx="12.5"/></clipPath>`
    + `<filter id="${uid}f" x="-60" y="-60" width="170" height="170" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="13"/></filter>`
    + `<linearGradient id="${uid}e" x1="25" y1="0" x2="25" y2="50" gradientUnits="userSpaceOnUse"><stop stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity=".04"/></linearGradient></defs>`
    + `<g clip-path="url(#${uid}c)"><rect width="50" height="50" fill="#000"/>`
    + `<circle cx="4.5" cy="4.5" r="17.5" fill="#5654D4" fill-opacity=".68" filter="url(#${uid}f)" style="mix-blend-mode:plus-lighter"/>`
    + `<circle cx="50" cy="46" r="17.5" fill="#2C84FF" fill-opacity=".68" filter="url(#${uid}f)" style="mix-blend-mode:plus-lighter"/>`
    + `<g transform="translate(-3.125 0)"><g class="gift-body">${u(BODY)}</g></g></g>`
    + `<rect x=".25" y=".25" width="49.5" height="49.5" rx="12.25" stroke="url(#${uid}e)" stroke-width=".5"/>`
    // the lid sits outside the tile clip so it can lift above the edge when the gift opens
    + `<g transform="translate(-3.125 0)"><g class="gift-lid">${u(LID)}</g></g></svg>`
}

export function AeroboxLogo({ size = 28, className = '' }: { size?: number; className?: string }) {
  const uid = 'lg' + useId().replace(/:/g, '')
  return <span className={`ab-logo ${className}`} style={{ width: size, height: size, borderRadius: size * .25 }} aria-hidden dangerouslySetInnerHTML={{ __html: logoSvg(size, uid) }} />
}

/** open the gift once: the box shakes, the lid pops up and confetti bursts out */
export const openGift = (host: HTMLElement, pieces = 26) => {
  host.classList.remove('gift-open'); void host.offsetWidth; host.classList.add('gift-open')
  window.setTimeout(() => pop(host, pieces), 420)
}

/** hero gift: stays put; only the lid breathes. Click → the box shakes, the lid pops and confetti bursts out */
export function HeroLogo() {
  return (
    <button className="hero-logo" onClick={e => openGift(e.currentTarget, 34)} aria-label="Open the gift">
      <AeroboxLogo size={52} className="hl-mark" />
    </button>
  )
}

/** nav mark: a small open-and-pop on click */
export function NavLogo(props: React.HTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className="brand-btn" onClick={e => openGift(e.currentTarget, 12)} aria-label="Open the gift"><AeroboxLogo size={28} /></button>
}
