// ═══════════════════════════════════════════════
//  АМАКС 2 — API СЛОЙ (Supabase REST)
// ═══════════════════════════════════════════════

class AmaksAPI {
  constructor() {
    this.base = SUPABASE_URL + '/rest/v1';
    this.h = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  async _req(url, opts = {}) {
    try {
      const r = await fetch(url, { ...opts, headers: { ...this.h, ...(opts.headers || {}) } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const text = await r.text();
      return text ? JSON.parse(text) : [];
    } catch(e) {
      console.warn('API error:', e.message);
      return null;
    }
  }

  async getAll(table, filter = '') {
    let url = `${this.base}/${table}?select=*&order=created_at.desc`;
    if (filter) url += '&' + filter;
    return await this._req(url) || [];
  }

  async insert(table, data) {
    return await this._req(`${this.base}/${table}`, {
      method: 'POST', body: JSON.stringify(data)
    });
  }

  async update(table, id, data) {
    return await this._req(`${this.base}/${table}?id=eq.${id}`, {
      method: 'PATCH', body: JSON.stringify(data)
    });
  }

  async upsert(table, data) {
    return await this._req(`${this.base}/${table}`, {
      method: 'POST',
      headers: { ...this.h, 'Prefer': 'return=representation,resolution=merge-duplicates' },
      body: JSON.stringify(data)
    });
  }

  async remove(table, id) {
    return await this._req(`${this.base}/${table}?id=eq.${id}`, { method: 'DELETE' });
  }
}

const api = new AmaksAPI();

// ── Локальное хранилище (fallback) ──────────
const LS = {
  get: (k) => { try { return JSON.parse(localStorage.getItem('amaks2_' + k) || '[]'); } catch{ return []; } },
  set: (k, v) => { try { localStorage.setItem('amaks2_' + k, JSON.stringify(v)); } catch{} }
};
