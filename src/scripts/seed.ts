// src/scripts/seed.ts
// Run with: npx ts-node --esm src/scripts/seed.ts
// Or add to package.json: "seed": "ts-node --esm src/scripts/seed.ts"

import { getPayload } from 'payload'
import config from '../payload.config'

const seed = async () => {
  console.log('🌱 Starting seed...')

  const payload = await getPayload({ config })

  // =====================
  // 1. Create Admin User
  // =====================
  console.log('👤 Creating admin user...')
  
  const existingAdmin = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@ebmcgroup.eu' } },
    limit: 1,
  })

  if (existingAdmin.docs.length === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@ebmcgroup.eu',
        password: 'admin123!',
        name: 'Admin EBMC',
        role: 'super_admin',
        position: 'Administrator',
      },
    })
    console.log('✅ Admin user created')
  } else {
    console.log('⏭️ Admin user already exists')
  }

  // =====================
  // 2. Create Settings Global
  // =====================
  console.log('⚙️ Creating settings...')
  
  await payload.updateGlobal({
    slug: 'settings',
    data: {
      general: {
        siteName: 'EBMC GROUP',
        tagline: {
          fr: "L'union européenne de l'expertise digitale",
          en: 'The European union of digital expertise',
        },
      },
      contact: {
        email: 'contact@ebmcgroup.eu',
        phone: '+352 XXX XXX XXX',
        addresses: [
          {
            name: 'Siège social',
            role: 'headquarters',
            address: 'Bascharage',
            country: 'Luxembourg',
          },
          {
            name: 'Innovation Hub',
            role: 'office',
            address: 'Barcelone',
            country: 'Espagne',
          },
        ],
      },
      social: {
        linkedin: 'https://linkedin.com/company/ebmcgroup',
      },
      seo: {
        defaultTitle: 'EBMC GROUP - ESN Européenne | SAP, ICT, Cybersécurité, IA',
        defaultDescription: 'Votre ESN de référence en Europe. SAP Silver Partner depuis 2006. Expertise en SAP, ICT, Cybersécurité et Intelligence Artificielle.',
      },
    },
  })
  console.log('✅ Settings created')

  // =====================
  // 3. Create Navigation Global
  // =====================
  console.log('🧭 Creating navigation...')
  
  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      headerMenu: [
        { label: { fr: 'Expertises', en: 'Expertise' }, type: 'dropdown', children: [
          { label: { fr: 'SAP', en: 'SAP' }, link: { type: 'external', url: '/sap' }, icon: 'server' },
          { label: { fr: 'ICT', en: 'ICT' }, link: { type: 'external', url: '/ict' }, icon: 'monitor' },
          { label: { fr: 'Cybersécurité', en: 'Cybersecurity' }, link: { type: 'external', url: '/cybersecurity' }, icon: 'shield' },
          { label: { fr: 'IA Générative', en: 'Generative AI' }, link: { type: 'external', url: '/ai' }, icon: 'brain' },
        ]},
        { label: { fr: 'Pourquoi EBMC', en: 'Why EBMC' }, type: 'link', link: { type: 'external', url: '/why-ebmc' } },
        { label: { fr: 'Carrières', en: 'Careers' }, type: 'link', link: { type: 'external', url: '/careers' } },
        { label: { fr: 'Contact', en: 'Contact' }, type: 'link', link: { type: 'external', url: '/contact' } },
      ],
      ctaButton: {
        label: { fr: 'Nous contacter', en: 'Contact us' },
      },
    },
  })
  console.log('✅ Navigation created')

  // =====================
  // 4. Create Sample Offers
  // =====================
  console.log('💼 Creating sample offers...')

  const sampleOffers = [
    {
      title: 'Consultant SAP FI/CO Senior',
      slug: 'consultant-sap-fi-co-senior',
      excerpt: 'Rejoignez notre équipe SAP et participez à des projets de transformation S/4HANA auprès de grands comptes européens.',
      category: 'sap',
      type: 'cdi',
      experienceLevel: 'senior',
      location: 'Luxembourg',
      country: 'luxembourg',
      remote: 'hybrid',
      salaryMin: 70000,
      salaryMax: 90000,
      salaryCurrency: 'eur',
      salaryPeriod: 'yearly',
      salaryVisible: true,
      featured: true,
      skills: [
        { skill: 'SAP FI', required: true },
        { skill: 'SAP CO', required: true },
        { skill: 'S/4HANA', required: true },
        { skill: 'SAP BTP', required: false },
      ],
      languages: [
        { language: 'french', level: 'fluent' },
        { language: 'english', level: 'professional' },
      ],
      _status: 'published',
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'Développeur ABAP Cloud',
      slug: 'developpeur-abap-cloud',
      excerpt: 'Développez des solutions innovantes sur SAP BTP et participez à la modernisation de notre core ABAP.',
      category: 'sap',
      type: 'cdi',
      experienceLevel: 'mid',
      location: 'Luxembourg / Paris',
      country: 'luxembourg',
      remote: 'hybrid',
      salaryMin: 55000,
      salaryMax: 70000,
      salaryCurrency: 'eur',
      salaryPeriod: 'yearly',
      salaryVisible: true,
      featured: false,
      skills: [
        { skill: 'ABAP', required: true },
        { skill: 'ABAP Cloud', required: true },
        { skill: 'SAP Fiori', required: true },
        { skill: 'RAP', required: false },
        { skill: 'CAP', required: false },
      ],
      languages: [
        { language: 'french', level: 'native' },
        { language: 'english', level: 'professional' },
      ],
      _status: 'published',
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'Ingénieur DevOps / Cloud AWS',
      slug: 'ingenieur-devops-cloud-aws',
      excerpt: "Gérez et optimisez nos infrastructures cloud AWS et accompagnez nos clients dans leur transformation cloud.",
      category: 'ict',
      type: 'cdi',
      experienceLevel: 'mid',
      location: 'Barcelone',
      country: 'spain',
      remote: 'remote',
      salaryMin: 45000,
      salaryMax: 60000,
      salaryCurrency: 'eur',
      salaryPeriod: 'yearly',
      salaryVisible: true,
      featured: true,
      skills: [
        { skill: 'AWS', required: true },
        { skill: 'Terraform', required: true },
        { skill: 'Kubernetes', required: true },
        { skill: 'Docker', required: true },
        { skill: 'CI/CD', required: true },
      ],
      languages: [
        { language: 'english', level: 'fluent' },
        { language: 'spanish', level: 'native' },
      ],
      _status: 'published',
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'Expert Cybersécurité SOC',
      slug: 'expert-cybersecurite-soc',
      excerpt: 'Intégrez notre SOC managé et protégez les infrastructures critiques de nos clients contre les cybermenaces.',
      category: 'cybersecurity',
      type: 'cdi',
      experienceLevel: 'senior',
      location: 'Luxembourg',
      country: 'luxembourg',
      remote: 'onsite',
      salaryMin: 75000,
      salaryMax: 95000,
      salaryCurrency: 'eur',
      salaryPeriod: 'yearly',
      salaryVisible: true,
      featured: false,
      skills: [
        { skill: 'SIEM', required: true },
        { skill: 'EDR', required: true },
        { skill: 'Threat Intelligence', required: true },
        { skill: 'ISO 27001', required: false },
        { skill: 'CISSP', required: false },
      ],
      languages: [
        { language: 'french', level: 'fluent' },
        { language: 'english', level: 'fluent' },
      ],
      _status: 'published',
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'Consultant IA / Machine Learning',
      slug: 'consultant-ia-machine-learning',
      excerpt: 'Concevez et déployez des solutions IA innovantes pour nos clients, des copilotes aux modèles prédictifs.',
      category: 'ai',
      type: 'cdi',
      experienceLevel: 'mid',
      location: 'Paris / Remote',
      country: 'france',
      remote: 'flexible',
      salaryMin: 60000,
      salaryMax: 80000,
      salaryCurrency: 'eur',
      salaryPeriod: 'yearly',
      salaryVisible: true,
      featured: true,
      skills: [
        { skill: 'Python', required: true },
        { skill: 'Machine Learning', required: true },
        { skill: 'LLM', required: true },
        { skill: 'RAG', required: false },
        { skill: 'MLOps', required: false },
      ],
      languages: [
        { language: 'french', level: 'native' },
        { language: 'english', level: 'professional' },
      ],
      _status: 'published',
      publishedAt: new Date().toISOString(),
    },
  ]

  for (const offer of sampleOffers) {
    const existing = await payload.find({
      collection: 'offers',
      where: { slug: { equals: offer.slug } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'offers',
        data: offer,
      })
      console.log(`  ✅ Created offer: ${offer.title}`)
    } else {
      console.log(`  ⏭️ Offer already exists: ${offer.title}`)
    }
  }

  // =====================
  // 5. Create Home Page
  // =====================
  console.log('📄 Creating home page...')

  const existingHome = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
  })

  if (existingHome.docs.length === 0) {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Accueil',
        slug: 'home',
        _status: 'published',
        layout: [
          {
            blockType: 'hero',
            style: 'default',
            badge: { fr: 'SAP Silver Partner · Depuis 2006', en: 'SAP Silver Partner · Since 2006' },
            title: { fr: "L'union européenne de", en: 'The European union of' },
            highlightedText: { fr: "l'expertise digitale", en: 'digital expertise' },
            description: {
              fr: "Votre ESN de référence en Europe, née dans le SAP, enrichie par l'ICT, renforcée par la cybersécurité. Maîtriser la technologie, préserver l'humain.",
              en: 'Your reference IT services company in Europe, born in SAP, enriched by ICT, strengthened by cybersecurity. Master technology, preserve humanity.',
            },
            stats: [
              { value: '210+', label: { fr: 'Consultants', en: 'Consultants' }, icon: 'users' },
              { value: '19+', label: { fr: "Années d'expertise", en: 'Years of expertise' }, icon: 'calendar' },
              { value: '4', label: { fr: "Pôles d'expertise", en: 'Areas of expertise' }, icon: 'building' },
              { value: '99.8%', label: { fr: 'SLA garanti', en: 'Guaranteed SLA' }, icon: 'award' },
            ],
            showScrollIndicator: true,
          },
          {
            blockType: 'services',
            title: { fr: 'Une croissance portée par', en: 'Growth driven by' },
            highlightedText: { fr: '4 expertises stratégiques', en: '4 strategic areas of expertise' },
            description: {
              fr: 'De la stratégie à l\'exécution, nous couvrons l\'ensemble de vos besoins en transformation digitale.',
              en: 'From strategy to execution, we cover all your digital transformation needs.',
            },
            services: [
              {
                year: '2006',
                icon: 'server',
                title: { fr: 'SAP', en: 'SAP' },
                subtitle: { fr: 'Notre ADN', en: 'Our DNA' },
                description: { fr: 'Spécialistes ECC puis S/4HANA, SAP Silver Partner.', en: 'ECC then S/4HANA specialists, SAP Silver Partner.' },
                gradient: 'blue',
              },
              {
                year: '2019',
                icon: 'monitor',
                title: { fr: 'ICT', en: 'ICT' },
                subtitle: { fr: 'Innovation Continue', en: 'Continuous Innovation' },
                description: { fr: 'Cloud, Dev, Data & IA opérationnelle.', en: 'Cloud, Dev, Data & operational AI.' },
                gradient: 'purple',
              },
              {
                year: '2025',
                icon: 'shield',
                title: { fr: 'Cybersécurité', en: 'Cybersecurity' },
                subtitle: { fr: 'Security by Design', en: 'Security by Design' },
                description: { fr: 'SOC managé, conformité RGPD/NIS2/DORA.', en: 'Managed SOC, GDPR/NIS2/DORA compliance.' },
                gradient: 'red',
              },
              {
                year: '2026',
                icon: 'brain',
                title: { fr: 'IA Générative', en: 'Generative AI' },
                subtitle: { fr: 'Copilotes & Automation', en: 'Copilots & Automation' },
                description: { fr: 'Intégration de copilotes et automatisation intelligente.', en: 'Copilot integration and intelligent automation.' },
                gradient: 'green',
              },
            ],
          },
          {
            blockType: 'cta',
            style: 'dark',
            title: { fr: 'Prêt à transformer votre', en: 'Ready to transform your' },
            highlightedText: { fr: 'infrastructure IT', en: 'IT infrastructure' },
            description: {
              fr: 'Discutons de votre projet et découvrez comment EBMC GROUP peut vous accompagner.',
              en: 'Let\'s discuss your project and discover how EBMC GROUP can support you.',
            },
          },
        ],
      },
    })
    console.log('✅ Home page created')
  } else {
    console.log('⏭️ Home page already exists')
  }

  console.log('')
  console.log('🎉 Seed completed!')
  console.log('')
  console.log('📝 Admin credentials:')
  console.log('   Email: admin@ebmcgroup.eu')
  console.log('   Password: admin123!')
  console.log('')

  process.exit(0)
}

seed().catch((error) => {
  console.error('❌ Seed error:', error)
  process.exit(1)
})
