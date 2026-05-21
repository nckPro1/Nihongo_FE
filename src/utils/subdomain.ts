/**
 * Subdomain detection utility
 *
 * Production:
 * - admin.zenigo.com → isAdminSubdomain = true
 * - zenigo.com → isAdminSubdomain = false
 *
 * Development:
 * - localhost:5173/admin/* → use /admin routes (no subdomain)
 * - admin.localhost:5173 → isAdminSubdomain = true (requires hosts file)
 */

export function isAdminSubdomain(): boolean {
  if (typeof window === 'undefined') return false

  const hostname = window.location.hostname

  // Production: check for admin subdomain
  if (hostname.startsWith('admin.')) {
    return true
  }

  // Development: check for admin.localhost
  if (hostname === 'admin.localhost') {
    return true
  }

  return false
}

export function getMainDomain(): string {
  if (typeof window === 'undefined') return ''

  const hostname = window.location.hostname

  // Remove 'admin.' prefix if present
  if (hostname.startsWith('admin.')) {
    return hostname.replace('admin.', '')
  }

  return hostname
}

/**
 * Redirect to appropriate domain based on context
 */
export function redirectToAdminDomain() {
  if (typeof window === 'undefined') return

  const hostname = window.location.hostname

  // Already on admin subdomain
  if (isAdminSubdomain()) return

  // Development: use /admin routes instead of subdomain
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    window.location.href = '/admin/login'
    return
  }

  // Production: redirect to admin subdomain
  const protocol = window.location.protocol
  const port = window.location.port ? `:${window.location.port}` : ''
  window.location.href = `${protocol}//admin.${hostname}${port}/login`
}

export function redirectToUserDomain() {
  if (typeof window === 'undefined') return

  const hostname = window.location.hostname

  // Already on user domain
  if (!isAdminSubdomain()) return

  // Development: use root routes
  if (hostname === 'admin.localhost') {
    window.location.href = 'http://localhost:5173/'
    return
  }

  // Production: redirect to main domain
  const protocol = window.location.protocol
  const port = window.location.port ? `:${window.location.port}` : ''
  const mainDomain = getMainDomain()
  window.location.href = `${protocol}//${mainDomain}${port}/`
}
