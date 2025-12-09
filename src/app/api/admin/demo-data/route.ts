import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { generateDemoCandidates } from '@/types/candidate'
import bcrypt from 'bcryptjs'

// ============================================================================
// DEMO USERS - All roles represented
// ============================================================================

const defaultUsers = [
  // Bureau roles
  {
    name: 'Admin Demo',
    email: 'admin@ebmc.fr',
    password: 'demo123',
    role: 'admin',
    active: true
  },
  {
    name: 'Sophie Martin',
    email: 'sophie.martin@ebmc.fr',
    password: 'demo123',
    role: 'commercial',
    active: true
  },
  {
    name: 'Lucas Bernard',
    email: 'lucas.bernard@ebmc.fr',
    password: 'demo123',
    role: 'commercial',
    active: true
  },
  {
    name: 'Emma Dubois',
    email: 'emma.dubois@ebmc.fr',
    password: 'demo123',
    role: 'sourceur',
    active: true
  },
  {
    name: 'Thomas Petit',
    email: 'thomas.petit@ebmc.fr',
    password: 'demo123',
    role: 'sourceur',
    active: true
  },
  {
    name: 'Marie Leroy',
    email: 'marie.leroy@ebmc.fr',
    password: 'demo123',
    role: 'rh',
    active: true
  },
  // Terrain roles
  {
    name: 'Alexandre Martin',
    email: 'alexandre.martin@consultant.ebmc.fr',
    password: 'demo123',
    role: 'consultant_cdi',
    active: true
  },
  {
    name: 'Julie Moreau',
    email: 'julie.moreau@consultant.ebmc.fr',
    password: 'demo123',
    role: 'consultant_cdi',
    active: true
  },
  {
    name: 'Nicolas Laurent',
    email: 'nicolas.laurent@freelance.ebmc.fr',
    password: 'demo123',
    role: 'freelance',
    active: true
  },
  {
    name: 'Camille Roux',
    email: 'camille.roux@freelance.ebmc.fr',
    password: 'demo123',
    role: 'freelance',
    active: true
  },
  {
    name: 'Pierre Dupont',
    email: 'pierre.dupont@candidat.ebmc.fr',
    password: 'demo123',
    role: 'candidat',
    active: true
  }
]

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

    // Total counts
    const jobsCount = await db.collection('jobs').countDocuments()
    const consultantsCount = await db.collection('consultants').countDocuments()
    const messagesCount = await db.collection('messages').countDocuments()
    const usersCount = await db.collection('users').countDocuments()
    const candidatesCount = await db.collection('candidates').countDocuments()

    // Demo counts
    const demoJobsCount = await db.collection('jobs').countDocuments({ isDemo: true })
    const demoConsultantsCount = await db.collection('consultants').countDocuments({ isDemo: true })
    const demoUsersCount = await db.collection('users').countDocuments({ isDemo: true })
    const demoCandidatesCount = await db.collection('candidates').countDocuments({ isDemo: true })

    // Get sample data
    const jobs = await db.collection('jobs').find({}).limit(5).toArray()
    const consultants = await db.collection('consultants').find({}).limit(5).toArray()
    const users = await db.collection('users').find({}).limit(10).toArray()
    const candidates = await db.collection('candidates').find({}).limit(5).toArray()

    // Count users by role
    const usersByRole = await db.collection('users').aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]).toArray()

    // Count candidates by status
    const candidatesByStatus = await db.collection('candidates').aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray()

    return NextResponse.json({
      status: 'ok',
      counts: {
        jobs: jobsCount,
        consultants: consultantsCount,
        messages: messagesCount,
        users: usersCount,
        candidates: candidatesCount,
      },
      demoCounts: {
        jobs: demoJobsCount,
        consultants: demoConsultantsCount,
        users: demoUsersCount,
        candidates: demoCandidatesCount,
      },
      realCounts: {
        jobs: jobsCount - demoJobsCount,
        consultants: consultantsCount - demoConsultantsCount,
        users: usersCount - demoUsersCount,
        candidates: candidatesCount - demoCandidatesCount,
      },
      samples: {
        jobs: jobs.map(j => ({ id: j._id.toString(), title: j.title, active: j.active, isDemo: j.isDemo || false })),
        consultants: consultants.map(c => ({ id: c._id.toString(), name: c.name, available: c.available, isDemo: c.isDemo || false })),
        users: users.map(u => ({ id: u._id.toString(), name: u.name, email: u.email, role: u.role, isDemo: u.isDemo || false })),
        candidates: candidates.map(c => ({ id: c.id, name: `${c.firstName} ${c.lastName}`, status: c.status, isDemo: c.isDemo || false })),
      },
      breakdowns: {
        usersByRole: usersByRole.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
        candidatesByStatus: candidatesByStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      },
      defaultDataAvailable: {
        jobs: defaultJobs.length,
        consultants: defaultConsultants.length,
        users: defaultUsers.length,
        candidates: '30 (généré dynamiquement)',
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
        // Only add if no demo data exists (check for isDemo flag)
        const existingDemoJobs = await db.collection('jobs').countDocuments({ isDemo: true })
        const existingDemoConsultants = await db.collection('consultants').countDocuments({ isDemo: true })
        const existingDemoUsers = await db.collection('users').countDocuments({ isDemo: true })
        const existingDemoCandidates = await db.collection('candidates').countDocuments({ isDemo: true })

        // Seed jobs with demo tag
        if (existingDemoJobs === 0) {
          const jobsWithDates = defaultJobs.map(job => ({
            ...job,
            isDemo: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
          const jobsResult = await db.collection('jobs').insertMany(jobsWithDates)
          results.jobs = { inserted: jobsResult.insertedCount }
        } else {
          results.jobs = { skipped: true, existing: existingDemoJobs }
        }

        // Seed consultants with demo tag
        if (existingDemoConsultants === 0) {
          const consultantsWithDates = defaultConsultants.map(consultant => ({
            ...consultant,
            isDemo: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
          const consultantsResult = await db.collection('consultants').insertMany(consultantsWithDates)
          results.consultants = { inserted: consultantsResult.insertedCount }
        } else {
          results.consultants = { skipped: true, existing: existingDemoConsultants }
        }

        // Seed users with demo tag
        if (existingDemoUsers === 0) {
          const usersWithHash = await Promise.all(defaultUsers.map(async user => ({
            name: user.name,
            email: user.email,
            password: await bcrypt.hash(user.password, 10),
            role: user.role,
            active: user.active,
            isDemo: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          })))
          const usersResult = await db.collection('users').insertMany(usersWithHash)
          results.users = { inserted: usersResult.insertedCount }
        } else {
          results.users = { skipped: true, existing: existingDemoUsers }
        }

        // Seed candidates with demo tag
        if (existingDemoCandidates === 0) {
          const demoCandidates = generateDemoCandidates(30, 42).map(c => ({
            ...c,
            isDemo: true,
          }))
          const candidatesResult = await db.collection('candidates').insertMany(demoCandidates)
          results.candidates = { inserted: candidatesResult.insertedCount }
        } else {
          results.candidates = { skipped: true, existing: existingDemoCandidates }
        }
        break

      case 'reset':
        // Delete only demo data and re-insert
        await db.collection('jobs').deleteMany({ isDemo: true })
        await db.collection('consultants').deleteMany({ isDemo: true })
        await db.collection('users').deleteMany({ isDemo: true })
        await db.collection('candidates').deleteMany({ isDemo: true })

        // Insert jobs with demo tag
        const jobsWithDates = defaultJobs.map(job => ({
          ...job,
          isDemo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
        const jobsInsert = await db.collection('jobs').insertMany(jobsWithDates)

        // Insert consultants with demo tag
        const consultantsWithDates = defaultConsultants.map(consultant => ({
          ...consultant,
          isDemo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
        const consultantsInsert = await db.collection('consultants').insertMany(consultantsWithDates)

        // Insert users with hashed passwords and demo tag
        const usersWithHash = await Promise.all(defaultUsers.map(async user => ({
          name: user.name,
          email: user.email,
          password: await bcrypt.hash(user.password, 10),
          role: user.role,
          active: user.active,
          isDemo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })))
        const usersInsert = await db.collection('users').insertMany(usersWithHash)

        // Insert generated candidates with demo tag
        const demoCandidates = generateDemoCandidates(30, 42).map(c => ({
          ...c,
          isDemo: true,
        }))
        const candidatesInsert = await db.collection('candidates').insertMany(demoCandidates)

        results.jobs = { reset: true, inserted: jobsInsert.insertedCount }
        results.consultants = { reset: true, inserted: consultantsInsert.insertedCount }
        results.users = { reset: true, inserted: usersInsert.insertedCount }
        results.candidates = { reset: true, inserted: candidatesInsert.insertedCount }
        break

      case 'clear-demo':
        // Clear only demo data (preserves real data)
        const demoJobsDel = await db.collection('jobs').deleteMany({ isDemo: true })
        const demoConsultantsDel = await db.collection('consultants').deleteMany({ isDemo: true })
        const demoUsersDel = await db.collection('users').deleteMany({ isDemo: true })
        const demoCandidatesDel = await db.collection('candidates').deleteMany({ isDemo: true })

        results.jobs = { cleared: true, deleted: demoJobsDel.deletedCount, demoOnly: true }
        results.consultants = { cleared: true, deleted: demoConsultantsDel.deletedCount, demoOnly: true }
        results.users = { cleared: true, deleted: demoUsersDel.deletedCount, demoOnly: true }
        results.candidates = { cleared: true, deleted: demoCandidatesDel.deletedCount, demoOnly: true }
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
        } else if (collection === 'users') {
          const deleted = await db.collection('users').deleteMany({})
          results.users = { cleared: true, deleted: deleted.deletedCount }
        } else if (collection === 'candidates') {
          const deleted = await db.collection('candidates').deleteMany({})
          results.candidates = { cleared: true, deleted: deleted.deletedCount }
        } else if (collection === 'all') {
          const jobsDel = await db.collection('jobs').deleteMany({})
          const consultantsDel = await db.collection('consultants').deleteMany({})
          const messagesDel = await db.collection('messages').deleteMany({})
          const usersDel = await db.collection('users').deleteMany({})
          const candidatesDel = await db.collection('candidates').deleteMany({})
          results.jobs = { cleared: true, deleted: jobsDel.deletedCount }
          results.consultants = { cleared: true, deleted: consultantsDel.deletedCount }
          results.messages = { cleared: true, deleted: messagesDel.deletedCount }
          results.users = { cleared: true, deleted: usersDel.deletedCount }
          results.candidates = { cleared: true, deleted: candidatesDel.deletedCount }
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
