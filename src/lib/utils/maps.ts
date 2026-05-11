"use server"

import { request as httpsRequest } from "node:https"
import { request as httpRequest } from "node:http"

export interface ThaiAddressResult {
  address?: string
  subdistrict: string
  district: string
  province: string
  postal_code: string
}

interface DbEntry {
  district: string
  amphoe: string
  province: string
  zipcode: string | number
}

// Use GET (not HEAD) — Google often ignores HEAD and doesn't return Location header
async function getFirstRedirectLocation(url: string): Promise<string> {
  return new Promise((resolve) => {
    const make = url.startsWith("https") ? httpsRequest : httpRequest
    const req = make(
      url,
      {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
          "Accept": "text/html,application/xhtml+xml",
        },
      },
      (res) => {
        const loc = res.headers.location
        res.resume()
        if (!loc) { resolve(url); return }
        resolve(loc.startsWith("http") ? loc : new URL(loc, url).toString())
      }
    )
    req.on("error", () => resolve(url))
    req.setTimeout(8000, () => { req.destroy(); resolve(url) })
    req.end()
  })
}

function extractCoordsFromUrl(url: string): { lat: number; lng: number } | null {
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) }
  const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) }
  return null
}

function extractQueryParam(url: string): string | null {
  try {
    return new URL(url).searchParams.get("q")
  } catch {
    return null
  }
}

async function geocodeToThaiAddress(lat: number, lng: number): Promise<ThaiAddressResult | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=th`,
    { headers: { "User-Agent": "HSM-Solar-Admin/1.0" }, cache: "no-store" }
  )
  if (!res.ok) return null
  const data = await res.json()
  const addr = data.address ?? {}

  // Bangkok: state = ISO code like "TH-10", city = "กรุงเทพมหานคร"
  // Other provinces: state = "จังหวัดXXX"
  const rawState = addr.state ?? ""
  const isBangkok = addr.city === "กรุงเทพมหานคร" || /^TH-\d/.test(rawState)
  const province = isBangkok
    ? "กรุงเทพมหานคร"
    : rawState.replace(/^จังหวัด/, "") || (addr.city ?? "").replace(/^จังหวัด/, "")

  const postalCode = addr.postcode ?? ""
  if (!province || !postalCode) return null

  // Bangkok: quarter = แขวง (subdistrict), suburb = เขต (district)
  // Provinces: village/suburb = ตำบล (subdistrict), city_district/county = อำเภอ (district)
  const nominatimSubdistrict = isBangkok
    ? (addr.quarter ?? addr.suburb ?? "").replace(/^(แขวง|ตำบล)/, "")
    : (addr.village ?? addr.suburb ?? addr.neighbourhood ?? "").replace(/^(แขวง|ตำบล)/, "")
  const nominatimDistrict = isBangkok
    ? (addr.suburb ?? "").replace(/^(เขต|อำเภอ)/, "")
    : (addr.city_district ?? addr.county ?? "").replace(/^(เขต|อำเภอ)/, "")

  const { searchAddressByZipcode } = await import("thai-address-database")
  const entries = searchAddressByZipcode(postalCode) as DbEntry[]
  if (!entries.length) return null

  const match =
    entries.find((e) => e.district === nominatimSubdistrict) ??
    entries.find((e) => e.amphoe === nominatimDistrict) ??
    entries.find((e) => e.province === province) ??
    entries[0]

  return {
    subdistrict: match.district,
    district: match.amphoe,
    province: match.province,
    postal_code: postalCode,
  }
}

async function searchAndGeocode(query: string): Promise<ThaiAddressResult | null> {
  // Strip building/street name — use only last 3 comma-separated parts
  // "Supalai Condo, 29 Charoen Rat Rd, Bang Khlo, Bang Kho Laem, Bangkok 10120"
  // → "Bang Khlo, Bang Kho Laem, Bangkok 10120"
  const parts = query.split(",").map((p) => p.trim()).filter(Boolean)
  const locationQuery = parts.length > 3 ? parts.slice(-3).join(", ") : query
  const addressFromQuery = parts.length > 3 ? parts.slice(0, -3).join(", ") : undefined

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json&addressdetails=1&accept-language=th&countrycodes=th&limit=1`,
    { headers: { "User-Agent": "HSM-Solar-Admin/1.0" }, cache: "no-store" }
  )
  if (!res.ok) return null
  const results = await res.json()
  if (!results.length) return null
  const result = await geocodeToThaiAddress(parseFloat(results[0].lat), parseFloat(results[0].lon))
  if (result && addressFromQuery) result.address = addressFromQuery
  return result
}

export async function resolveMapsUrl(url: string): Promise<ThaiAddressResult | null> {
  const isShortUrl = /maps\.app\.goo\.gl|goo\.gl\/maps/.test(url)
  const resolvedUrl = isShortUrl ? await getFirstRedirectLocation(url) : url

  const coords = extractCoordsFromUrl(resolvedUrl)
  if (coords) return geocodeToThaiAddress(coords.lat, coords.lng)

  const query = extractQueryParam(resolvedUrl)
  if (query) return searchAndGeocode(query)

  return null
}
