import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

// Default jobs data
const defaultJobs = [
  {
    title: 'Consultant SAP S/4HANA Senior',
    titleEn: 'Senior SAP S/4HANA Consultant',
    location: 'Paris',
    type: 'CDI',
    typeEn: 'Full-time',
    category: 'consulting',
    experience: '5+ ans',
    experienceEn: '5+ years',
    description: 'Accompagnez nos clients dans leur transformation digitale avec SAP S/4HANA.',
    descriptionEn: 'Support our clients in their digital transformation with SAP S/4HANA.',
    missions: [
      'Analyser les besoins métier et définir les solutions SAP adaptées',
      'Paramétrer et personnaliser les modules SAP S/4HANA',
      'Former les utilisateurs finaux',
      'Assurer le support post-déploiement',
    ],
    missionsEn: [
      'Analyze business needs and define appropriate SAP solutions',
      'Configure and customize SAP S/4HANA modules',
      'Train end users',
      'Provide post-deployment support',
    ],
    requirements: [
      'Certification SAP S/4HANA',
      "5+ années d'expérience en consulting SAP",
      'Excellentes compétences en communication',
    ],
    requirementsEn: [
      'SAP S/4HANA certification',
      '5+ years of SAP consulting experience',
      'Excellent communication skills',
    ],
    active: true,
  },
  {
    title: 'Ingénieur Cybersécurité',
    titleEn: 'Cybersecurity Engineer',
    location: 'Paris / Remote',
    type: 'CDI',
    typeEn: 'Full-time',
    category: 'tech',
    experience: '3+ ans',
    experienceEn: '3+ years',
    description: 'Protégez les systèmes de nos clients avec des solutions de sécurité avancées.',
    descriptionEn: 'Protect our clients systems with advanced security solutions.',
    missions: [
      'Réaliser des audits de sécurité et tests de pénétration',
      'Mettre en place des solutions SIEM/SOC',
      'Définir les politiques de sécurité',
      'Former les équipes aux bonnes pratiques',
    ],
    missionsEn: [
      'Conduct security audits and penetration testing',
      'Implement SIEM/SOC solutions',
      'Define security policies',
      'Train teams on best practices',
    ],
    requirements: [
      'Certifications CISSP, CEH ou équivalent',
      'Expérience en pentest et audit sécurité',
      'Maîtrise des outils de sécurité (Splunk, CrowdStrike...)',
    ],
    requirementsEn: [
      'CISSP, CEH or equivalent certifications',
      'Pentest and security audit experience',
      'Proficiency in security tools (Splunk, CrowdStrike...)',
    ],
    active: true,
  },
  {
    title: 'Développeur Full Stack React/Node.js',
    titleEn: 'Full Stack Developer React/Node.js',
    location: 'Paris / Remote',
    type: 'CDI',
    typeEn: 'Full-time',
    category: 'tech',
    experience: '2+ ans',
    experienceEn: '2+ years',
    description: 'Développez des applications web modernes avec React et Node.js.',
    descriptionEn: 'Develop modern web applications with React and Node.js.',
    missions: [
      'Développer des applications React performantes',
      'Concevoir des APIs RESTful avec Node.js',
      'Participer aux revues de code',
      "Contribuer à l'amélioration continue",
    ],
    missionsEn: [
      'Develop high-performance React applications',
      'Design RESTful APIs with Node.js',
      'Participate in code reviews',
      'Contribute to continuous improvement',
    ],
    requirements: [
      'Maîtrise de React, TypeScript et Node.js',
      'Expérience avec les bases de données (PostgreSQL, MongoDB)',
      'Connaissance des pratiques DevOps',
    ],
    requirementsEn: [
      'Proficiency in React, TypeScript and Node.js',
      'Experience with databases (PostgreSQL, MongoDB)',
      'Knowledge of DevOps practices',
    ],
    active: true,
  },
  {
    title: 'Data Scientist IA/ML',
    titleEn: 'AI/ML Data Scientist',
    location: 'Paris',
    type: 'CDI',
    typeEn: 'Full-time',
    category: 'tech',
    experience: '3+ ans',
    experienceEn: '3+ years',
    description: 'Concevez et déployez des modèles de Machine Learning pour nos clients.',
    descriptionEn: 'Design and deploy Machine Learning models for our clients.',
    missions: [
      'Analyser les données et identifier les opportunités ML',
      'Développer et entraîner des modèles',
      'Déployer les modèles en production',
      'Optimiser les performances',
    ],
    missionsEn: [
      'Analyze data and identify ML opportunities',
      'Develop and train models',
      'Deploy models to production',
      'Optimize performance',
    ],
    requirements: [
      'Master ou PhD en Data Science / IA',
      'Maîtrise de Python, TensorFlow/PyTorch',
      'Expérience en production ML (MLOps)',
    ],
    requirementsEn: [
      'Master or PhD in Data Science / AI',
      'Proficiency in Python, TensorFlow/PyTorch',
      'ML production experience (MLOps)',
    ],
    active: true,
  },
  {
    title: 'Chef de Projet IT',
    titleEn: 'IT Project Manager',
    location: 'Paris',
    type: 'CDI',
    typeEn: 'Full-time',
    category: 'management',
    experience: '5+ ans',
    experienceEn: '5+ years',
    description: 'Pilotez des projets de transformation digitale de bout en bout.',
    descriptionEn: 'Lead digital transformation projects end-to-end.',
    missions: [
      'Définir le périmètre et planning des projets',
      'Coordonner les équipes techniques',
      'Gérer les risques et les budgets',
      'Assurer le reporting aux stakeholders',
    ],
    missionsEn: [
      'Define project scope and planning',
      'Coordinate technical teams',
      'Manage risks and budgets',
      'Ensure stakeholder reporting',
    ],
    requirements: [
      'Certification PMP ou équivalent',
      "5+ ans d'expérience en gestion de projet IT",
      'Excellentes capacités de communication',
    ],
    requirementsEn: [
      'PMP certification or equivalent',
      '5+ years of IT project management experience',
      'Excellent communication skills',
    ],
    active: true,
  },
]

// Default consultants data
const defaultConsultants = [
  {
    name: 'Alexandre Martin',
    title: 'Consultant SAP Senior',
    titleEn: 'Senior SAP Consultant',
    location: 'Paris',
    experience: '12 ans',
    experienceEn: '12 years',
    category: 'sap',
    available: true,
    skills: ['SAP S/4HANA', 'SAP FI/CO', 'SAP MM', 'ABAP'],
    certifications: ['SAP S/4HANA Certified', 'PMP'],
  },
  {
    name: 'Sophie Dubois',
    title: 'Experte Cybersécurité',
    titleEn: 'Cybersecurity Expert',
    location: 'Lyon',
    experience: '8 ans',
    experienceEn: '8 years',
    category: 'security',
    available: true,
    skills: ['Pentest', 'SIEM', 'SOC', 'ISO 27001'],
    certifications: ['CISSP', 'CEH', 'OSCP'],
  },
  {
    name: 'Thomas Bernard',
    title: 'Architecte Cloud & DevOps',
    titleEn: 'Cloud & DevOps Architect',
    location: 'Paris / Remote',
    experience: '10 ans',
    experienceEn: '10 years',
    category: 'dev',
    available: false,
    skills: ['AWS', 'Azure', 'Kubernetes', 'Terraform', 'CI/CD'],
    certifications: ['AWS Solutions Architect', 'Azure Expert'],
  },
  {
    name: 'Marie Leroy',
    title: 'Data Scientist Senior',
    titleEn: 'Senior Data Scientist',
    location: 'Paris',
    experience: '7 ans',
    experienceEn: '7 years',
    category: 'data',
    available: true,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Spark'],
    certifications: ['Google ML Engineer', 'AWS ML Specialty'],
  },
  {
    name: 'Pierre Moreau',
    title: 'Consultant SAP FI/CO',
    titleEn: 'SAP FI/CO Consultant',
    location: 'Nantes',
    experience: '6 ans',
    experienceEn: '6 years',
    category: 'sap',
    available: true,
    skills: ['SAP FI', 'SAP CO', 'S/4HANA Finance'],
    certifications: ['SAP FI Certified'],
  },
  {
    name: 'Camille Petit',
    title: 'Développeuse Full Stack',
    titleEn: 'Full Stack Developer',
    location: 'Bordeaux / Remote',
    experience: '5 ans',
    experienceEn: '5 years',
    category: 'dev',
    available: true,
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    certifications: ['AWS Developer Associate'],
  },
]

// GET - Get current demo data status
export async function GET() {
  try {
    const db = await connectToDatabase()

    const jobsCount = await db.collection('jobs').countDocuments()
    const consultantsCount = await db.collection('consultants').countDocuments()
    const messagesCount = await db.collection('messages').countDocuments()
    const usersCount = await db.collection('users').countDocuments()

    // Get sample data
    const jobs = await db.collection('jobs').find({}).limit(5).toArray()
    const consultants = await db.collection('consultants').find({}).limit(5).toArray()

    return NextResponse.json({
      status: 'ok',
      counts: {
        jobs: jobsCount,
        consultants: consultantsCount,
        messages: messagesCount,
        users: usersCount,
      },
      samples: {
        jobs: jobs.map(j => ({ id: j._id.toString(), title: j.title, active: j.active })),
        consultants: consultants.map(c => ({ id: c._id.toString(), name: c.name, available: c.available })),
      },
      defaultDataAvailable: {
        jobs: defaultJobs.length,
        consultants: defaultConsultants.length,
      },
    })
  } catch (error) {
    console.error('Error fetching demo data status:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Seed or reset demo data
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body // 'seed', 'reset', 'clear'

    const db = await connectToDatabase()
    const results: Record<string, unknown> = {}

    switch (action) {
      case 'seed':
        // Only add if collections are empty
        const existingJobs = await db.collection('jobs').countDocuments()
        const existingConsultants = await db.collection('consultants').countDocuments()

        if (existingJobs === 0) {
          const jobsWithDates = defaultJobs.map(job => ({
            ...job,
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
          const jobsResult = await db.collection('jobs').insertMany(jobsWithDates)
          results.jobs = { inserted: jobsResult.insertedCount }
        } else {
          results.jobs = { skipped: true, existing: existingJobs }
        }

        if (existingConsultants === 0) {
          const consultantsWithDates = defaultConsultants.map(consultant => ({
            ...consultant,
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
          const consultantsResult = await db.collection('consultants').insertMany(consultantsWithDates)
          results.consultants = { inserted: consultantsResult.insertedCount }
        } else {
          results.consultants = { skipped: true, existing: existingConsultants }
        }
        break

      case 'reset':
        // Delete all and re-insert default data
        await db.collection('jobs').deleteMany({})
        await db.collection('consultants').deleteMany({})

        const jobsWithDates = defaultJobs.map(job => ({
          ...job,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
        const consultantsWithDates = defaultConsultants.map(consultant => ({
          ...consultant,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))

        const jobsInsert = await db.collection('jobs').insertMany(jobsWithDates)
        const consultantsInsert = await db.collection('consultants').insertMany(consultantsWithDates)

        results.jobs = { reset: true, inserted: jobsInsert.insertedCount }
        results.consultants = { reset: true, inserted: consultantsInsert.insertedCount }
        break

      case 'clear':
        // Clear specific collection
        const { collection } = body
        if (collection === 'jobs') {
          const deleted = await db.collection('jobs').deleteMany({})
          results.jobs = { cleared: true, deleted: deleted.deletedCount }
        } else if (collection === 'consultants') {
          const deleted = await db.collection('consultants').deleteMany({})
          results.consultants = { cleared: true, deleted: deleted.deletedCount }
        } else if (collection === 'messages') {
          const deleted = await db.collection('messages').deleteMany({})
          results.messages = { cleared: true, deleted: deleted.deletedCount }
        } else if (collection === 'all') {
          const jobsDel = await db.collection('jobs').deleteMany({})
          const consultantsDel = await db.collection('consultants').deleteMany({})
          const messagesDel = await db.collection('messages').deleteMany({})
          results.jobs = { cleared: true, deleted: jobsDel.deletedCount }
          results.consultants = { cleared: true, deleted: consultantsDel.deletedCount }
          results.messages = { cleared: true, deleted: messagesDel.deletedCount }
        }
        break

      case 'add-sample':
        // Add a single sample item
        const { type, data } = body
        if (type === 'job') {
          const result = await db.collection('jobs').insertOne({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          results.job = { inserted: true, id: result.insertedId.toString() }
        } else if (type === 'consultant') {
          const result = await db.collection('consultants').insertOne({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          results.consultant = { inserted: true, id: result.insertedId.toString() }
        }
        break

      default:
        return NextResponse.json({ error: 'Action non valide' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      action,
      results,
    })
  } catch (error) {
    console.error('Error managing demo data:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
