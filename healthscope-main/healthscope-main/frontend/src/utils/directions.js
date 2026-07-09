/**
 * Build a Google Maps driving directions deep link for a hospital.
 * Prefers lat/lng when available; falls back to name + address text query.
 */
export function buildDirectionsUrl(hospital) {
  const { latitude, longitude, name, vicinity } = hospital

  if (latitude != null && longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`
  }

  const query = encodeURIComponent(`${name}, ${vicinity}`)
  return `https://www.google.com/maps/dir/?api=1&destination=${query}&travelmode=driving`
}
