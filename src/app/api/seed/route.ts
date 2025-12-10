import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

// Default demo users for each role
const defaultUsers = [
  {
    email: 'admin@ebmc-group.com',
    password: 'admin123',
    name: 'Administrateur',
    role: 'admin',
  },
  {
    email: 'sourceur@ebmc-group.com',
    password: 'sourceur123',
    name: 'Jean Sourceur',
    role: 'sourceur',
  },
  {
    email: 'commercial@ebmc-group.com',
    password: 'commercial123',
    name: 'Marie Commercial',
    role: 'commercial',
  },
  {
    email: 'freelance@ebmc-group.com',
    password: 'freelance123',
    name: 'Pierre Freelance',
    role: 'freelance',
  },
  {
    email: 'consultant@ebmc-group.com',
    password: 'consultant123',
    name: 'Sophie Consultant',
    role: 'consultant',
  },
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
      '5+ années d\'expérience en consulting SAP',
      'Excellentes compétences en communication',
    ],
    requirementsEn: [
      'SAP S/4HANA certification',
      '5+ years of SAP consulting experience',
      'Excellent communication skills',
    ],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
      'Contribuer à l\'amélioration continue',
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
      '5+ ans d\'expérience en gestion de projet IT',
      'Excellentes capacités de communication',
    ],
    requirementsEn: [
      'PMP certification or equivalent',
      '5+ years of IT project management experience',
      'Excellent communication skills',
    ],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// Seed endpoint - initialize database with default data
export async function POST(request: Request) {
  try {
    // Check for admin authorization
    const authHeader = request.headers.get('authorization')
    const seedKey = process.env.SEED_KEY || 'ebmc-seed-key-2024'

    if (authHeader !== `Bearer ${seedKey}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const db = await connectToDatabase()

    // Check if data already exists
    const existingJobs = await db.collection('jobs').countDocuments()
    const existingConsultants = await db.collection('consultants').countDocuments()
    const existingUsers = await db.collection('users').countDocuments()

    const results: {
      jobs: { inserted: number; existing: number }
      consultants: { inserted: number; existing: number }
      users: { inserted: number; existing: number; demo: string[] }
    } = {
      jobs: { inserted: 0, existing: existingJobs },
      consultants: { inserted: 0, existing: existingConsultants },
      users: { inserted: 0, existing: existingUsers, demo: [] },
    }

    // Only seed if collections are empty
    if (existingJobs === 0) {
      const jobsResult = await db.collection('jobs').insertMany(defaultJobs)
      results.jobs.inserted = jobsResult.insertedCount
    }

    if (existingConsultants === 0) {
      const consultantsResult = await db.collection('consultants').insertMany(defaultConsultants)
      results.consultants.inserted = consultantsResult.insertedCount
    }

    // Create demo users if they don't exist
    const usersCollection = db.collection('users')
    for (const user of defaultUsers) {
      const existing = await usersCollection.findOne({ email: user.email })
      if (!existing) {
        const hashedPassword = await bcrypt.hash(user.password, 12)
        await usersCollection.insertOne({
          email: user.email,
          password: hashedPassword,
          name: user.name,
          role: user.role,
          createdAt: new Date(),
        })
        results.users.inserted++
        results.users.demo.push(`${user.email} (${user.role})`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      results,
      demoCredentials: defaultUsers.map(u => ({
        email: u.email,
        password: u.password,
        role: u.role,
      })),
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// GET endpoint to check seed status
export async function GET() {
  try {
    const db = await connectToDatabase()

    const jobsCount = await db.collection('jobs').countDocuments()
    const consultantsCount = await db.collection('consultants').countDocuments()
    const usersCount = await db.collection('users').countDocuments()

    return NextResponse.json({
      status: 'ok',
      counts: {
        jobs: jobsCount,
        consultants: consultantsCount,
        users: usersCount,
      },
      needsSeed: jobsCount === 0 || consultantsCount === 0 || usersCount === 0,
      demoCredentials: defaultUsers.map(u => ({
        email: u.email,
        password: u.password,
        role: u.role,
        description: u.role === 'admin' ? 'Accès complet' :
                     u.role === 'sourceur' ? 'Accès consultants et messages' :
                     u.role === 'commercial' ? 'Accès offres et consultants assignés' :
                     u.role === 'freelance' ? 'Portail freelance uniquement' :
                     'Accès de base'
      })),
    })
  } catch (error) {
    console.error('Error checking seed status:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
