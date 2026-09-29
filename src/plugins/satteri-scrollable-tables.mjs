// Membungkus setiap <table> pada konten Markdown dengan <div class="table-scroll">
// supaya HANYA tabel itu yang bisa digeser ke samping, bukan seluruh halaman.
//
// Astro 7 memakai pengolah Markdown Sätteri. Plugin ini bertipe "hast plugin".
// Dipasang di astro.config.mjs lewat: markdown: { processor: satteri({ hastPlugins: [...] }) }
// Gaya .table-scroll ada di src/styles/global.css

export const scrollableTables = {
  name: 'scrollable-tables',
  element: {
    filter: ['table'],
    visit(node, ctx) {
      // Jangan bungkus dua kali bila tabel sudah berada di dalam pembungkusnya.
      const parent = ctx.parent(node);
      const cls = parent && parent.type === 'element' ? parent.properties?.className : undefined;
      if (Array.isArray(cls) ? cls.includes('table-scroll') : cls === 'table-scroll') return;

      ctx.wrapNode(node, {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['table-scroll'],
          // Area yang bisa digulir sebaiknya dapat difokuskan dengan keyboard
          // dan punya nama, agar pengguna keyboard dan pembaca layar bisa menggesernya.
          role: 'region',
          tabIndex: 0,
          ariaLabel: 'Tabel, dapat digeser ke samping',
        },
        children: [],
      });
    },
  },
};
