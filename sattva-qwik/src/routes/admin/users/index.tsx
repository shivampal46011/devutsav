import { component$, useSignal, useStore, useVisibleTask$, $ } from '@builder.io/qwik';
import { getApiBase } from '~/lib/apiBase';
import { fmtDate, TOKEN_KEY } from '../shared';

interface UserRow {
  _id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  dob: string | null;
  pob_city: string;
  first_landing_url: string;
  device_details: string;
  browser_details: string;
  location: string;
  sessions: number | null;
  createdAt: string;
}

function shortBrowser(ua: string): string {
  if (!ua) return '';
  if (/iPhone|iPad/.test(ua)) return 'iOS Safari';
  if (/Android/.test(ua)) return 'Android';
  if (/Edg\//.test(ua)) return 'Edge';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Safari\//.test(ua)) return 'Safari';
  return ua.slice(0, 24);
}

export default component$(() => {
  const store = useStore<{ users: UserRow[]; total: number; loading: boolean; err: string }>({
    users: [], total: 0, loading: false, err: '',
  });
  const tokenSig = useSignal<string>('');

  const fetchUsers = $(async () => {
    if (!tokenSig.value) return;
    store.loading = true;
    try {
      const res = await fetch(`${getApiBase()}/api/admin/users`, {
        headers: { Authorization: `Bearer ${tokenSig.value}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      store.users = data.users || [];
      store.total = data.total || 0;
      store.err = '';
    } catch (e: any) {
      store.err = String(e?.message || e);
    } finally {
      store.loading = false;
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    try { tokenSig.value = localStorage.getItem(TOKEN_KEY) || ''; } catch {}
    fetchUsers();
  });

  return (
    <div class="p-3">
      <div class="flex items-center justify-between mb-2">
        <div class="term-amber font-bold tracking-widest">USERS // {store.total}</div>
        <button onClick$={() => fetchUsers()} class="term-cyan hover:term-amber border border-[#1f2937] px-2 py-0.5">REFRESH</button>
      </div>
      {store.err && <div class="term-red mb-2">{store.err}</div>}
      {store.loading && <div class="term-dim">loading…</div>}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="term-dim text-[10px] uppercase">
              <th class="text-left py-1">NAME</th>
              <th class="text-left">PHONE</th>
              <th class="text-left">EMAIL</th>
              <th class="text-left">SOURCE</th>
              <th class="text-left">FIRST LANDING</th>
              <th class="text-left">DEVICE</th>
              <th class="text-left">LOCATION</th>
              <th class="text-right">SESS</th>
              <th class="text-left">CREATED</th>
            </tr>
          </thead>
          <tbody>
            {!store.loading && store.users.length === 0 && (
              <tr><td colSpan={9} class="term-dim py-4">no users</td></tr>
            )}
            {store.users.map((u) => (
              <tr key={u._id} class="term-row border-t border-[#111827]">
                <td class="py-1.5 term-amber">{u.name || <span class="term-dim">—</span>}</td>
                <td class="term-cyan tabular-nums">{u.phone || <span class="term-dim">—</span>}</td>
                <td>{u.email || <span class="term-dim">—</span>}</td>
                <td class="term-amber font-bold">{u.source || <span class="term-dim">—</span>}</td>
                <td class="term-green">{u.first_landing_url || <span class="term-dim">—</span>}</td>
                <td class="term-dim">{shortBrowser(u.browser_details) || '—'}</td>
                <td class="term-dim">{u.location || '—'}</td>
                <td class="text-right tabular-nums">{u.sessions ?? '—'}</td>
                <td class="term-dim">{u.createdAt ? fmtDate(u.createdAt) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p class="term-dim mt-3 text-[10px]">
        SOURCE = codename of the form that captured the user. Known codenames:
        <span class="term-amber"> DOSHA_ANALYZER</span> (analyzer page form).
        Older records without a stored source fall back to <span class="term-dim">URL:&lt;first landing&gt;</span> or <span class="term-dim">UNKNOWN</span>.
      </p>
    </div>
  );
});
