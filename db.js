/* ═══════════════════════════════════════════════════════════
   FÊNIX v4.1 — db.js
   Camada de dados — IndexedDB (preparado para Firebase)
   
   PARA MIGRAR PARA FIREBASE:
   Reimplemente as funções do DB com Firebase SDK.
   O app.js não precisa mudar nada.
═══════════════════════════════════════════════════════════ */

const DB_NAME    = 'fenix_db';
const DB_VERSION = 1;

/* ── Stores (tabelas) ── */
const STORES = {
  empresas:  'empresas',
  os:        'os',
  templates: 'templates',
  config:    'config',
};

let _db = null;

/* ═══════════════════════════════════════════════════════════
   INICIALIZAÇÃO
═══════════════════════════════════════════════════════════ */
async function dbInit() {
  if (_db) return _db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      // empresas
      if (!db.objectStoreNames.contains(STORES.empresas)) {
        const s = db.createObjectStore(STORES.empresas, { keyPath: 'id' });
        s.createIndex('nome', 'nome', { unique: false });
      }
      // OS
      if (!db.objectStoreNames.contains(STORES.os)) {
        const s = db.createObjectStore(STORES.os, { keyPath: 'uid' });
        s.createIndex('empresaId', 'empresaId', { unique: false });
        s.createIndex('osNum',     'osNum',     { unique: false });
        s.createIndex('data',      'data',      { unique: false });
      }
      // templates
      if (!db.objectStoreNames.contains(STORES.templates)) {
        db.createObjectStore(STORES.templates, { keyPath: 'id' });
      }
      // config (chave = empresaId)
      if (!db.objectStoreNames.contains(STORES.config)) {
        db.createObjectStore(STORES.config, { keyPath: 'empresaId' });
      }
    };
    req.onsuccess = e => { _db = e.target.result; resolve(_db); };
    req.onerror   = e => reject(e.target.error);
  });
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
async function _tx(store, mode, fn) {
  const db = await dbInit();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(store, mode);
    const st  = tx.objectStore(store);
    const req = fn(st);
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

async function _getAll(store, indexName, value) {
  const db = await dbInit();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(store, 'readonly');
    const st  = tx.objectStore(store);
    const src = indexName ? st.index(indexName) : st;
    const req = value !== undefined ? src.getAll(value) : src.getAll();
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* ═══════════════════════════════════════════════════════════
   EMPRESAS
═══════════════════════════════════════════════════════════ */
const DB = {

  // ── Empresa ──────────────────────────────────────────────
  async listarEmpresas() {
    return _getAll(STORES.empresas);
  },

  async salvarEmpresa(empresa) {
    if (!empresa.id) empresa.id = uid();
    empresa.updatedAt = new Date().toISOString();
    await _tx(STORES.empresas, 'readwrite', s => s.put(empresa));
    return empresa;
  },

  async deletarEmpresa(id) {
    await _tx(STORES.empresas, 'readwrite', s => s.delete(id));
    // Remove OS e config associadas
    const osList = await _getAll(STORES.os, 'empresaId', id);
    const db = await dbInit();
    await Promise.all(osList.map(os =>
      new Promise((res,rej) => {
        const tx = db.transaction(STORES.os, 'readwrite');
        const req = tx.objectStore(STORES.os).delete(os.uid);
        req.onsuccess=res; req.onerror=rej;
      })
    ));
    try { await _tx(STORES.config, 'readwrite', s => s.delete(id)); } catch(e) {}
  },

  // ── Configuração por empresa ──────────────────────────────
  async carregarConfig(empresaId) {
    try {
      const result = await _tx(STORES.config, 'readonly', s => s.get(empresaId));
      return result || null;
    } catch(e) { return null; }
  },

  async salvarConfig(empresaId, config) {
    config.empresaId  = empresaId;
    config.updatedAt  = new Date().toISOString();
    await _tx(STORES.config, 'readwrite', s => s.put(config));
    return config;
  },

  // ── OS ───────────────────────────────────────────────────
  async listarOS(empresaId) {
    const all = await _getAll(STORES.os, 'empresaId', empresaId);
    return all.sort((a,b) => new Date(b.geradoEm) - new Date(a.geradoEm));
  },

  async buscarOS(uid) {
    try {
      return await _tx(STORES.os, 'readonly', s => s.get(uid));
    } catch(e) { return null; }
  },

  async salvarOS(empresaId, os) {
    if (!os.uid) os.uid = uid();
    os.empresaId  = empresaId;
    os.updatedAt  = new Date().toISOString();
    os._pendSync  = true; // marcado para sync com Firebase futuramente
    await _tx(STORES.os, 'readwrite', s => s.put(os));
    return os;
  },

  async deletarOS(uid) {
    await _tx(STORES.os, 'readwrite', s => s.delete(uid));
  },

  async listarOSPorPeriodo(empresaId, de, ate) {
    const all = await this.listarOS(empresaId);
    return all.filter(os => {
      if (!os.data) return false;
      return (!de || os.data >= de) && (!ate || os.data <= ate);
    });
  },

  // ── Templates ─────────────────────────────────────────────
  async listarTemplates(empresaId) {
    const all = await _getAll(STORES.templates);
    return all.filter(t => t.empresaId === empresaId);
  },

  async salvarTemplate(empresaId, template) {
    if (!template.id) template.id = uid();
    template.empresaId = empresaId;
    template.updatedAt = new Date().toISOString();
    await _tx(STORES.templates, 'readwrite', s => s.put(template));
    return template;
  },

  async deletarTemplate(id) {
    await _tx(STORES.templates, 'readwrite', s => s.delete(id));
  },

  // ── Export / Import ───────────────────────────────────────
  async exportarTudo(empresaId) {
    const [config, os, templates] = await Promise.all([
      this.carregarConfig(empresaId),
      this.listarOS(empresaId),
      this.listarTemplates(empresaId),
    ]);
    return {
      versao: '4.1',
      exportadoEm: new Date().toISOString(),
      empresaId,
      config, os, templates,
    };
  },

  async importarBanco(dados, empresaId) {
    let add = 0, upd = 0;
    const osList = Array.isArray(dados.os) ? dados.os : dados.os ? [dados.os] : [];
    for (const os of osList) {
      os.empresaId = empresaId;
      if (!os.uid) os.uid = uid();
      const exists = await this.buscarOS(os.uid);
      exists ? upd++ : add++;
      await _tx(STORES.os, 'readwrite', s => s.put(os));
    }
    return { add, upd };
  },

};

/* ═══════════════════════════════════════════════════════════
   FIREBASE BRIDGE (implementar quando chegar o Firebase)
   
   Quando integrar Firebase, crie firebase.js e sobrescreva:
   
   DB.salvarOS = async (empresaId, os) => {
     // salva local (IndexedDB) E remoto (Firestore)
     await indexedDB_salvarOS(empresaId, os);
     if (navigator.onLine) await firestore.collection(...).set(os);
     else queueSync(os);
   }
═══════════════════════════════════════════════════════════ */
