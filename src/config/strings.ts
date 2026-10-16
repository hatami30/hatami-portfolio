/**
 * All visible UI text lives here (not in components), so switching language is one line
 * (`lang` in src/config/site.ts) and adding another language is one more object.
 * Post and project content is written in MDX and is not part of this file.
 */
import { site, type Lang } from './site';

const en = {
  skipToContent: 'Skip to content',
  themeToggle: 'Toggle dark mode',
  mainNav: 'Main',
  nav: { projects: 'Projects', blog: 'Blog', about: 'About', contact: 'Contact' },
  breadcrumbs: { label: 'Breadcrumb', home: 'Home' },
  footer: {
    rss: 'RSS feed',
    resume: 'Resume',
    email: 'Email',
    navigate: 'Navigate',
    elsewhere: 'Elsewhere',
    rights: (year: number, name: string) => `© ${year} ${name}`,
  },
  home: {
    statusAvailable: 'Available for new projects & roles',
    greeting: 'Hello, I am',
    taglineLead: 'I build products that',
    taglineHighlight: 'actually move the needle.',
    speechBubble:
      'Building high-performance web systems and intuitive user interfaces. Focused on turning complex technical challenges into simple, reliable software. Open for collaboration!',
    speechBubbleMobile:
      'Complex technical problems, turned into simple, reliable software. Open for collaboration.',
    ctaProjects: 'View projects',
    ctaContact: 'Get in touch',
    featuredProjects: 'Featured projects',
    allProjects: 'All projects',
    latestPosts: 'Latest writing',
    allPosts: 'All posts',
    closingTitle: 'Let’s work together',
    closingText: 'Have a role or a project in mind? Send me a message.',
  },
  desk: {
    tag: 'LIVE FROM THE DESK',
    title: 'Currently at my desk',
    description:
      'Real signals from my workstation: what I am listening to, what I am building, and where I am working from. Updated as I go.',
    nowPlaying: 'Now playing',
    currently: 'Currently',
    local: 'Local',
  },
  manifesto:
    'Writing clean code and designing intuitive UI that never confuses users. The focus: turning complex business challenges into simple, elegant software.',
  capabilities: {
    tag: 'SERVICES & SPECIALIZATIONS',
    title: 'How I Help Build & Scale Your Product',
    description:
      'Helping founders and engineering teams ship fast, clean-architecture digital products built to scale seamlessly over time.',
  },
  faq: {
    tag: 'FREQUENT QUESTIONS',
    title: 'Ready to collaborate or discuss an architectural challenge?',
    description:
      'I am always open to discussing new opportunities, systems architecture, or freelance projects. Let’s build something fast and reliable.',
    cta: 'Start a Conversation',
  },
  projects: {
    title: 'Projects',
    intro: 'Selected work, written up as case studies.',
    metaDescription: (name: string) =>
      `Selected software projects by ${name}, written up as case studies: the problem, the role, key technical decisions and the result.`,
    role: 'Role',
    period: 'Period',
    stack: 'Stack',
    live: 'Live site',
    repo: 'Source code',
    related: 'Related writing',
    empty: 'No projects yet.',
  },
  blog: {
    title: 'Blog',
    intro: 'Notes on what I build and learn.',
    metaDescription: (name: string) =>
      `Technical articles by ${name} on software engineering: notes on what I build, how it works and what I learn along the way.`,
    search: 'Search posts',
    searchUnavailable:
      'Search is created during the build. Run "pnpm build && pnpm preview" to try it locally.',
    topics: 'Topics',
    tagTitle: (tag: string) => `Posts tagged “${tag}”`,
    tagDescription: (tag: string, count: number, name: string) =>
      `${count} ${count === 1 ? 'article' : 'articles'} tagged “${tag}” on the blog of ${name}, with notes on software engineering.`,
    readingTime: (minutes: number) => `${minutes} min read`,
    updated: 'Updated',
    newer: 'Newer post',
    older: 'Older post',
    toc: 'On this page',
    pageOf: (page: number, total: number) => `Page ${page} of ${total}`,
    newerPosts: 'Newer posts',
    olderPosts: 'Older posts',
    relatedProject: 'Related project',
    relatedPosts: 'Related posts',
    empty: 'No posts yet.',
    comments: 'Comments',
  },
  about: {
    title: 'About',
    skills: 'Skills',
    resume: 'Download resume',
    metaDescription: (name: string, role: string) =>
      `About ${name}, ${role}: background, skills and how to get in touch.`,
  },
  contact: {
    title: 'Contact',
    intro: 'Send a message and I will reply by email.',
    metaDescription: (name: string) =>
      `Contact ${name}: send a message through the form or write by email about roles, projects and collaboration.`,
    directEmail: 'Or email me directly',
    name: 'Name',
    email: 'Email',
    message: 'Message',
    send: 'Send message',
    sending: 'Sending…',
    success: 'Thank you! Your message has been sent.',
    error: 'Something went wrong. Please try again, or email me directly.',
    fieldErrors: {
      required: 'This field is required.',
      too_short: 'This is too short.',
      too_long: 'This is too long.',
      invalid_email: 'Enter a valid email address.',
    },
  },
  notFound: {
    title: 'Page not found',
    text: 'The page you are looking for does not exist or has moved.',
    home: 'Back to home',
  },
  // Text of /llms.txt, /llms-full.txt and the .md versions of pages (read by AI tools).
  llms: {
    aboutNote: 'Bio and skills',
    contactNote: 'Contact form and direct email',
    markdownNote:
      'Every project and post is also available as clean Markdown: add .md to its URL. All content in one file: /llms-full.txt.',
    fullContent: 'All projects and posts as one Markdown file',
    rss: 'RSS feed of the blog',
    sitemap: 'XML sitemap',
    url: 'URL',
    published: 'Published',
    tags: 'Tags',
  },
};

export type Strings = typeof en;

const id: Strings = {
  skipToContent: 'Langsung ke konten',
  themeToggle: 'Ganti mode gelap',
  mainNav: 'Utama',
  nav: { projects: 'Proyek', blog: 'Blog', about: 'Tentang', contact: 'Kontak' },
  breadcrumbs: { label: 'Breadcrumb', home: 'Beranda' },
  footer: {
    rss: 'RSS feed',
    resume: 'CV',
    email: 'Email',
    navigate: 'Navigasi',
    elsewhere: 'Lainnya',
    rights: (year, name) => `© ${year} ${name}`,
  },
  home: {
    statusAvailable: 'Terbuka untuk proyek & peran baru',
    greeting: 'Halo, saya',
    taglineLead: 'Saya bikin produk yang',
    taglineHighlight: 'beneran berdampak.',
    speechBubble:
      'Membangun sistem web berperforma tinggi dan antarmuka yang intuitif. Fokus mengubah tantangan teknis yang rumit jadi perangkat lunak yang simpel dan andal. Terbuka untuk kolaborasi!',
    speechBubbleMobile:
      'Masalah teknis yang rumit, diubah jadi perangkat lunak yang simpel dan andal. Terbuka untuk kolaborasi.',
    ctaProjects: 'Lihat proyek',
    ctaContact: 'Hubungi saya',
    featuredProjects: 'Proyek pilihan',
    allProjects: 'Semua proyek',
    latestPosts: 'Tulisan terbaru',
    allPosts: 'Semua tulisan',
    closingTitle: 'Mari berkolaborasi',
    closingText: 'Punya peran atau proyek yang ingin dibicarakan? Kirim pesan kepada saya.',
  },
  desk: {
    tag: 'LANGSUNG DARI MEJA KERJA',
    title: 'Sedang ada di meja kerja',
    description:
      'Sinyal nyata dari workstation saya: apa yang sedang didengar, apa yang sedang dibangun, dan dari mana saya bekerja. Diperbarui berkala.',
    nowPlaying: 'Sedang diputar',
    currently: 'Aktivitas',
    local: 'Lokal',
  },
  manifesto:
    'Nulis kode yang rapi dan bikin desain UI yang gak bikin user bingung. Fokusnya: nyelesaiin masalah bisnis kamu yang ribet jadi simpel.',
  capabilities: {
    tag: 'LAYANAN & SPESIALISASI',
    title: 'Keahlian & Solusi Rekayasa Produk',
    description:
      'Membantu founder dan tim teknik mewujudkan produk digital yang cepat, berarsitektur bersih, dan mudah dirawat dalam jangka panjang.',
  },
  faq: {
    tag: 'PERTANYAAN UMUM',
    title: 'Tertarik kolaborasi atau diskusi tantangan teknis?',
    description:
      'Saya selalu terbuka untuk membahas peluang kerja baru, arsitektur sistem, atau proyek freelance. Mari bangun sistem yang cepat dan andal.',
    cta: 'Mulai Diskusi',
  },
  projects: {
    title: 'Proyek',
    intro: 'Karya pilihan, ditulis sebagai studi kasus.',
    metaDescription: (name) =>
      `Proyek perangkat lunak pilihan oleh ${name}, ditulis sebagai studi kasus: masalah, peran, keputusan teknis penting, dan hasilnya.`,
    role: 'Peran',
    period: 'Periode',
    stack: 'Teknologi',
    live: 'Situs live',
    repo: 'Kode sumber',
    related: 'Tulisan terkait',
    empty: 'Belum ada proyek.',
  },
  blog: {
    title: 'Blog',
    intro: 'Catatan tentang apa yang saya bangun dan pelajari.',
    metaDescription: (name) =>
      `Artikel teknis oleh ${name} tentang rekayasa perangkat lunak: catatan tentang apa yang saya bangun, cara kerjanya, dan yang saya pelajari.`,
    search: 'Cari tulisan',
    searchUnavailable:
      'Pencarian dibuat saat build. Jalankan "pnpm build && pnpm preview" untuk mencobanya secara lokal.',
    topics: 'Topik',
    tagTitle: (tag) => `Tulisan dengan tag “${tag}”`,
    tagDescription: (tag, count, name) =>
      `${count} artikel dengan tag “${tag}” di blog ${name}, berisi catatan tentang rekayasa perangkat lunak.`,
    readingTime: (minutes) => `${minutes} menit baca`,
    updated: 'Diperbarui',
    newer: 'Tulisan lebih baru',
    older: 'Tulisan lebih lama',
    toc: 'Di halaman ini',
    pageOf: (page, total) => `Halaman ${page} dari ${total}`,
    newerPosts: 'Tulisan lebih baru',
    olderPosts: 'Tulisan lebih lama',
    relatedProject: 'Proyek terkait',
    relatedPosts: 'Tulisan terkait',
    empty: 'Belum ada tulisan.',
    comments: 'Komentar',
  },
  about: {
    title: 'Tentang',
    skills: 'Keahlian',
    resume: 'Unduh CV',
    metaDescription: (name, role) =>
      `Tentang ${name}, ${role}: latar belakang, keahlian, dan cara menghubungi.`,
  },
  contact: {
    title: 'Kontak',
    intro: 'Kirim pesan dan saya akan membalas lewat email.',
    metaDescription: (name) =>
      `Hubungi ${name}: kirim pesan lewat formulir atau tulis email tentang peran, proyek, dan kolaborasi.`,
    directEmail: 'Atau email langsung',
    name: 'Nama',
    email: 'Email',
    message: 'Pesan',
    send: 'Kirim pesan',
    sending: 'Mengirim…',
    success: 'Terima kasih! Pesan Anda sudah terkirim.',
    error: 'Terjadi kesalahan. Silakan coba lagi, atau kirim email langsung.',
    fieldErrors: {
      required: 'Kolom ini wajib diisi.',
      too_short: 'Terlalu pendek.',
      too_long: 'Terlalu panjang.',
      invalid_email: 'Masukkan alamat email yang valid.',
    },
  },
  notFound: {
    title: 'Halaman tidak ditemukan',
    text: 'Halaman yang Anda cari tidak ada atau sudah dipindahkan.',
    home: 'Kembali ke beranda',
  },
  llms: {
    aboutNote: 'Profil dan keahlian',
    contactNote: 'Formulir kontak dan email langsung',
    markdownNote:
      'Setiap proyek dan tulisan juga tersedia sebagai Markdown bersih: tambahkan .md pada URL-nya. Seluruh konten dalam satu file: /llms-full.txt.',
    fullContent: 'Semua proyek dan tulisan dalam satu file Markdown',
    rss: 'RSS feed blog',
    sitemap: 'Sitemap XML',
    url: 'URL',
    published: 'Diterbitkan',
    tags: 'Tag',
  },
};

const dictionaries: Record<Lang, Strings> = { en, id };

export const t: Strings = dictionaries[site.lang];
