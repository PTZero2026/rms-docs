import { findReviewCase } from './datasets'
import { roleForAccount } from './identity'
import { loadTenant } from './repository'

// A guide link selects an existing demo identity. Normal navigation still uses the session picker.
export function openReviewCase() {
  const url = new URL(location.href)
  if (url.pathname !== '/' || !url.searchParams.has('cas')) return
  const match = findReviewCase(url.searchParams.get('cas')!)
  if (!match) return
  try {
    const { tenant, review } = match
    const actor = loadTenant(tenant).rows.find(r => r.kind === 'account' && r.owner === review.actor)
    if (!actor) return
    sessionStorage.setItem('rms.persona', JSON.stringify({
      tenant, role: roleForAccount(actor), userId: actor.owner, name: actor.title, unit: actor.unit,
    }))
    url.searchParams.delete('cas')
    url.hash = review.route
    history.replaceState(null, '', url)
  } catch {
    // Workspace handles unavailable storage and offers recovery for invalid snapshots.
  }
}
