// Membungkus setiap <table> pada konten Markdown dengan <div class="table-scroll">
// supaya HANYA tabel itu yang bisa digeser ke samping, bukan seluruh halaman.
//
// Astro 7 memakai pengolah Markdown Sätteri. Plugin ini bertipe "hast plugin".
// Dipasang di astro.config.mjs lewat: markdown: { processor: satteri({ hastPlugins: [...] }) }
// Gaya .table-scroll ada di src/styles/global.css

// Tabel yang seluruh selnya pendek (mis. deretan angka) tidak perlu dilebarkan paksa.
const COMPACT_MAX_CHARS = 28;

function longestCellText(node, ctx) {
  let longest = 0;
  const walk = (n) => {
    if (!n || !n.children) return;
    for (const child of n.children) {
      if (child.type !== 'element') continue;
      if (child.tagName === 'td' || child.tagName === 'th') {
        longest = Math.max(longest, ctx.textContent(child).trim().length);
      } else {
        walk(child);
      }
    }
  };
  walk(node);
  return longest;
}

// Visitor 1: bungkus tabel
const wrapTable = {
    filter: ['table'],
    visit(node, ctx) {
      // Jangan bungkus dua kali bila tabel sudah berada di dalam pembungkusnya.
      const parent = ctx.parent(node);
      const cls = parent && parent.type === 'element' ? parent.properties?.className : undefined;
      if (Array.isArray(cls) ? cls.includes('table-scroll') : cls === 'table-scroll') return;

      const classes = ['table-scroll'];
      if (longestCellText(node, ctx) <= COMPACT_MAX_CHARS) classes.push('table-compact');

      ctx.wrapNode(node, {
        type: 'element',
        tagName: 'div',
        properties: {
          className: classes,
          // Area yang bisa digulir sebaiknya dapat difokuskan dengan keyboard
          // dan punya nama, agar pengguna keyboard dan pembaca layar bisa menggesernya.
          role: 'region',
          tabIndex: 0,
          ariaLabel: 'Tabel, dapat digeser ke samping',
        },
        children: [],
      });
    },
};

// Visitor 2: kotak "Contoh Kasus" / "Catatan" (blockquote).
// Di Markdown, baris yang ditulis berurutan dalam satu paragraf menyatu menjadi satu baris.
// Di dalam blockquote, tiap baris memang dimaksudkan berdiri sendiri (Judul:, Rumusan masalah:, dst.),
// jadi baris baru di sana diubah menjadi <br>. Paragraf di luar blockquote tidak disentuh.
const keepLinesInCallouts = {
  filter: ['p'],
  visit(node, ctx) {
    const parent = ctx.parent(node);
    if (!parent || parent.type !== 'element' || parent.tagName !== 'blockquote') return;
    if (!node.children || !node.children.some((c) => c.type === 'text' && c.value.includes('\n'))) return;

    const children = [];
    for (const child of node.children) {
      if (child.type === 'text' && child.value.includes('\n')) {
        // Pisahkan per baris: "a\nb" -> "a", <br>, "b"
        child.value.split('\n').forEach((line, i) => {
          if (i > 0) children.push({ type: 'element', tagName: 'br', properties: {}, children: [] });
          // Spasi di awal baris pertama harus dipertahankan (mis. setelah label tebal "Judul:").
          const text = i > 0 ? line.replace(/^\s+/, '') : line;
          if (text) children.push({ type: 'text', value: text });
        });
      } else {
        children.push(child);
      }
    }
    return { type: 'element', tagName: 'p', properties: node.properties ?? {}, children };
  },
};

export const scrollableTables = {
  name: 'scrollable-tables',
  element: [wrapTable, keepLinesInCallouts],
};
