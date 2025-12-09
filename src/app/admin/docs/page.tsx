'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen, Users, Briefcase, Search, Target, Calendar, CheckCircle,
  ArrowRight, Kanban, TrendingUp, FileText, Clock, UserPlus, Building2,
  Code, Key, Webhook, Shield, Loader2
} from 'lucide-react'

type UserRole = 'admin' | 'sourceur' | 'commercial' | 'user' | 'freelance'

export default function DocsPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('intro')

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setUserRole(data.user?.role || 'user')
        }
      } catch {
        setUserRole('user')
      } finally {
        setLoading(false)
      }
    }
    fetchUserRole()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
      </div>
    )
  }

  // Admin sees technical documentation
  if (userRole === 'admin') {
    return <AdminDocumentation activeSection={activeSection} setActiveSection={setActiveSection} />
  }

  // Sourceur sees sourceur-specific docs
  if (userRole === 'sourceur') {
    return <SourceurDocumentation activeSection={activeSection} setActiveSection={setActiveSection} />
  }

  // Commercial sees commercial-specific docs
  if (userRole === 'commercial') {
    return <CommercialDocumentation activeSection={activeSection} setActiveSection={setActiveSection} />
  }

  // Default user documentation
  return <UserDocumentation activeSection={activeSection} setActiveSection={setActiveSection} />
}

// ==================== SOURCEUR DOCUMENTATION ====================
function SourceurDocumentation({
  activeSection,
  setActiveSection
}: {
  activeSection: string
  setActiveSection: (s: string) => void
}) {
  const sections = [
    { id: 'intro', icon: BookOpen, title: 'Bienvenue', description: 'Votre espace sourceur' },
    { id: 'dashboard', icon: Target, title: 'Dashboard', description: 'Tableau de bord' },
    { id: 'recrutement', icon: Kanban, title: 'Parcours recrutement', description: 'Gérer les étapes' },
    { id: 'candidats', icon: Users, title: 'Candidats', description: 'Gérer les profils' },
    { id: 'offres', icon: Briefcase, title: 'Offres', description: 'Gérer les postes' },
    { id: 'recherche', icon: Search, title: 'Recherche CV', description: 'Trouver des talents' },
  ]

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Guide du Sourceur</h1>
        </div>
        <p className="text-gray-600">Tout ce dont vous avez besoin pour recruter efficacement</p>
      </div>

      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  activeSection === section.id
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{section.title}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-8"
          >
            {activeSection === 'intro' && <SourceurIntro />}
            {activeSection === 'dashboard' && <SourceurDashboardDocs />}
            {activeSection === 'recrutement' && <RecrutementDocs />}
            {activeSection === 'candidats' && <CandidatsDocs />}
            {activeSection === 'offres' && <OffresDocs />}
            {activeSection === 'recherche' && <RechercheCVDocs />}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function SourceurIntro() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Target className="w-6 h-6 text-purple-500" />
        Bienvenue sur votre espace Sourceur
      </h2>

      <p className="text-gray-600 text-lg">
        En tant que sourceur, vous êtes le premier maillon de la chaîne de recrutement.
        Votre mission : identifier et qualifier les meilleurs talents pour nos clients.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
          <Users className="w-8 h-8 text-purple-500 mb-3" />
          <h3 className="font-semibold text-gray-900">Gérer vos candidats</h3>
          <p className="text-gray-600 text-sm mt-1">
            Suivez chaque candidat à travers le processus de recrutement
          </p>
        </div>
        <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100">
          <Kanban className="w-8 h-8 text-cyan-500 mb-3" />
          <h3 className="font-semibold text-gray-900">Parcours de recrutement</h3>
          <p className="text-gray-600 text-sm mt-1">
            Visualisez et déplacez vos candidats par étape
          </p>
        </div>
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <Briefcase className="w-8 h-8 text-blue-500 mb-3" />
          <h3 className="font-semibold text-gray-900">Offres d&apos;emploi</h3>
          <p className="text-gray-600 text-sm mt-1">
            Créez et gérez les postes à pourvoir
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
          <Search className="w-8 h-8 text-green-500 mb-3" />
          <h3 className="font-semibold text-gray-900">Recherche de CVs</h3>
          <p className="text-gray-600 text-sm mt-1">
            Utilisez notre outil de recherche multi-sources
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <h3 className="font-semibold text-amber-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Astuce du jour
        </h3>
        <p className="text-amber-700 text-sm mt-1">
          Utilisez le tableau Kanban pour avoir une vue d&apos;ensemble de tous vos candidats
          et déplacez-les facilement d&apos;une étape à l&apos;autre par glisser-déposer.
        </p>
      </div>
    </div>
  )
}

function SourceurDashboardDocs() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Target className="w-6 h-6 text-purple-500" />
        Votre Dashboard
      </h2>

      <p className="text-gray-600">
        Le dashboard vous offre une vue complète de votre activité de recrutement.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6">Indicateurs clés (KPIs)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-900">Candidats totaux</p>
          <p className="text-sm text-gray-500">Nombre de candidats dans votre pipeline</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-900">En cours de process</p>
          <p className="text-sm text-gray-500">Candidats actuellement suivis</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-900">Entretiens planifiés</p>
          <p className="text-sm text-gray-500">Candidats en entretien</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-900">Placements</p>
          <p className="text-sm text-gray-500">Candidats placés avec succès</p>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mt-6">Graphiques</h3>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
          <span><strong>Activité mensuelle</strong> : évolution de vos recrutements</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
          <span><strong>Répartition par statut</strong> : où en sont vos candidats</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
          <span><strong>Tunnel de recrutement</strong> : taux de conversion par étape</span>
        </li>
      </ul>
    </div>
  )
}

function RecrutementDocs() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Kanban className="w-6 h-6 text-indigo-500" />
        Parcours de recrutement
      </h2>

      <p className="text-gray-600">
        Le tableau Kanban vous permet de visualiser et gérer vos candidats à chaque étape du processus.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6">Les 6 étapes</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border-l-4 border-slate-400">
          <span className="font-medium">1. À qualifier</span>
          <span className="text-gray-500 text-sm">Nouveaux CVs à évaluer</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg border-l-4 border-cyan-400">
          <span className="font-medium">2. Qualifié</span>
          <span className="text-gray-500 text-sm">Profil validé, à contacter</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
          <span className="font-medium">3. En cours</span>
          <span className="text-gray-500 text-sm">Échanges en cours</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
          <span className="font-medium">4. Entretien</span>
          <span className="text-gray-500 text-sm">Entretien planifié/réalisé</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <span className="font-medium">5. Proposition</span>
          <span className="text-gray-500 text-sm">Offre en cours</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
          <span className="font-medium">6. Embauché</span>
          <span className="text-gray-500 text-sm">Placement confirmé !</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mt-6">Comment utiliser</h3>
      <ol className="space-y-3 text-gray-600">
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
          <span><strong>Glisser-déposer</strong> : Faites glisser un candidat vers une autre colonne pour changer son statut</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
          <span><strong>Cliquer sur une carte</strong> : Voir les détails du candidat (email, téléphone, source)</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
          <span><strong>Rechercher</strong> : Utilisez la barre de recherche pour filtrer par nom ou poste</span>
        </li>
      </ol>
    </div>
  )
}

function CandidatsDocs() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Users className="w-6 h-6 text-cyan-500" />
        Gérer les candidats
      </h2>

      <p className="text-gray-600">
        Chaque candidat dispose d&apos;une fiche complète avec ses informations et son historique.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6">Informations d&apos;un candidat</h3>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-gray-400" />
          Nom et prénom
        </li>
        <li className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-gray-400" />
          Email et téléphone
        </li>
        <li className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-gray-400" />
          Poste / Titre professionnel
        </li>
        <li className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-gray-400" />
          Source (LinkedIn, Indeed, etc.)
        </li>
        <li className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-gray-400" />
          Date d&apos;ajout et dernière activité
        </li>
        <li className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-gray-400" />
          Statut dans le processus
        </li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-900 mt-6">Bonnes pratiques</h3>
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <ul className="space-y-2 text-green-700">
          <li>✓ Renseignez toujours la source du candidat</li>
          <li>✓ Mettez à jour le statut après chaque interaction</li>
          <li>✓ Notez les points clés dans les commentaires</li>
          <li>✓ Relancez les candidats &quot;En cours&quot; sous 48h</li>
        </ul>
      </div>
    </div>
  )
}

function OffresDocs() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Briefcase className="w-6 h-6 text-blue-500" />
        Gérer les offres d&apos;emploi
      </h2>

      <p className="text-gray-600">
        Créez et gérez les postes à pourvoir pour faciliter le matching avec vos candidats.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6">Créer une offre</h3>
      <ol className="space-y-3 text-gray-600">
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
          <span>Accédez à <strong>Offres d&apos;emploi</strong> dans le menu</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
          <span>Cliquez sur <strong>Nouvelle offre</strong></span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
          <span>Renseignez le titre, la description, les compétences requises</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">4</span>
          <span>Définissez le type de contrat et la localisation</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">5</span>
          <span>Publiez ou enregistrez en brouillon</span>
        </li>
      </ol>

      <h3 className="text-lg font-semibold text-gray-900 mt-6">Statuts d&apos;une offre</h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <span className="text-gray-600 font-medium">Brouillon</span>
        </div>
        <div className="p-3 bg-green-50 rounded-lg text-center">
          <span className="text-green-600 font-medium">Publiée</span>
        </div>
        <div className="p-3 bg-red-50 rounded-lg text-center">
          <span className="text-red-600 font-medium">Fermée</span>
        </div>
      </div>
    </div>
  )
}

function RechercheCVDocs() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Search className="w-6 h-6 text-green-500" />
        Recherche de CVs
      </h2>

      <p className="text-gray-600">
        Notre outil de recherche vous permet de trouver des profils sur plusieurs plateformes.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6">Comment rechercher</h3>
      <ol className="space-y-3 text-gray-600">
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
          <span>Accédez à <strong>Recherche CVs</strong> dans le menu</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
          <span>Entrez vos mots-clés (ex: &quot;Développeur Java Paris&quot;)</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
          <span>Utilisez les filtres pour affiner (localisation, expérience)</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">4</span>
          <span>Consultez les résultats et ajoutez les profils intéressants</span>
        </li>
      </ol>

      <h3 className="text-lg font-semibold text-gray-900 mt-6">Astuces de recherche</h3>
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <ul className="space-y-2 text-yellow-800 text-sm">
          <li>💡 Utilisez des guillemets pour une recherche exacte : &quot;chef de projet&quot;</li>
          <li>💡 Combinez plusieurs compétences : Java AND Spring AND AWS</li>
          <li>💡 Excluez des termes : Développeur -junior</li>
          <li>💡 Recherchez par localisation : &quot;Data Scientist&quot; Luxembourg</li>
        </ul>
      </div>
    </div>
  )
}

// ==================== COMMERCIAL DOCUMENTATION ====================
function CommercialDocumentation({
  activeSection,
  setActiveSection
}: {
  activeSection: string
  setActiveSection: (s: string) => void
}) {
  const sections = [
    { id: 'intro', icon: BookOpen, title: 'Bienvenue', description: 'Votre espace commercial' },
    { id: 'dashboard', icon: TrendingUp, title: 'Dashboard', description: 'Tableau de bord' },
    { id: 'opportunites', icon: Briefcase, title: 'Opportunités', description: 'Gérer les missions' },
    { id: 'consultants', icon: Users, title: 'Consultants', description: 'Vos ressources' },
    { id: 'recrutement', icon: Kanban, title: 'Parcours recrutement', description: 'Suivi des candidats' },
  ]

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Guide du Commercial</h1>
        </div>
        <p className="text-gray-600">Développez votre activité et suivez vos performances</p>
      </div>

      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{section.title}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-8"
          >
            {activeSection === 'intro' && <CommercialIntro />}
            {activeSection === 'dashboard' && <CommercialDashboardDocs />}
            {activeSection === 'opportunites' && <OpportunitesDocs />}
            {activeSection === 'consultants' && <ConsultantsDocs />}
            {activeSection === 'recrutement' && <RecrutementDocs />}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function CommercialIntro() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-blue-500" />
        Bienvenue sur votre espace Commercial
      </h2>

      <p className="text-gray-600 text-lg">
        En tant que commercial, vous développez le portefeuille clients et gérez les opportunités.
        Suivez vos performances et vos consultants en un coup d&apos;œil.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <Briefcase className="w-8 h-8 text-blue-500 mb-3" />
          <h3 className="font-semibold text-gray-900">Opportunités</h3>
          <p className="text-gray-600 text-sm mt-1">
            Suivez vos missions et leur taux de conversion
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
          <Users className="w-8 h-8 text-green-500 mb-3" />
          <h3 className="font-semibold text-gray-900">Consultants</h3>
          <p className="text-gray-600 text-sm mt-1">
            Gérez vos ressources et leurs disponibilités
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
          <Kanban className="w-8 h-8 text-purple-500 mb-3" />
          <h3 className="font-semibold text-gray-900">Parcours recrutement</h3>
          <p className="text-gray-600 text-sm mt-1">
            Suivez les candidats en cours de process
          </p>
        </div>
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
          <TrendingUp className="w-8 h-8 text-amber-500 mb-3" />
          <h3 className="font-semibold text-gray-900">Performance</h3>
          <p className="text-gray-600 text-sm mt-1">
            Analysez vos KPIs et votre CA
          </p>
        </div>
      </div>
    </div>
  )
}

function CommercialDashboardDocs() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-blue-500" />
        Votre Dashboard
      </h2>

      <p className="text-gray-600">
        Le dashboard commercial vous donne une vue complète de votre activité business.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6">Indicateurs clés (KPIs)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-900">Opportunités totales</p>
          <p className="text-sm text-gray-500">Nombre de missions en cours</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-900">Taux de conversion</p>
          <p className="text-sm text-gray-500">% d&apos;opportunités gagnées</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-900">Consultants actifs</p>
          <p className="text-sm text-gray-500">Ressources en mission</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-900">TJM moyen</p>
          <p className="text-sm text-gray-500">Taux journalier moyen</p>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mt-6">Graphiques</h3>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
          <span><strong>Évolution du CA</strong> : tendance de votre chiffre d&apos;affaires</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
          <span><strong>Répartition opportunités</strong> : par statut (en cours, gagnée, perdue)</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
          <span><strong>Disponibilité consultants</strong> : qui est disponible bientôt</span>
        </li>
      </ul>
    </div>
  )
}

function OpportunitesDocs() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Briefcase className="w-6 h-6 text-blue-500" />
        Gérer les opportunités
      </h2>

      <p className="text-gray-600">
        Les opportunités représentent vos missions clients en cours de négociation ou gagnées.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6">Statuts d&apos;une opportunité</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <span className="font-medium">En cours</span>
          <span className="text-gray-500 text-sm">Négociation en cours</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
          <span className="font-medium">Gagnée</span>
          <span className="text-gray-500 text-sm">Mission confirmée</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
          <span className="font-medium">Perdue</span>
          <span className="text-gray-500 text-sm">Non retenue</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
          <span className="font-medium">Abandonnée</span>
          <span className="text-gray-500 text-sm">Annulée</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mt-6">Informations clés</h3>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-gray-400" />
          Référence et titre de la mission
        </li>
        <li className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-gray-400" />
          Client et contact
        </li>
        <li className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-gray-400" />
          TJM (Taux Journalier Moyen)
        </li>
        <li className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-gray-400" />
          Date de démarrage prévue
        </li>
        <li className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-gray-400" />
          Durée estimée
        </li>
      </ul>
    </div>
  )
}

function ConsultantsDocs() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Users className="w-6 h-6 text-green-500" />
        Gérer les consultants
      </h2>

      <p className="text-gray-600">
        Suivez vos consultants, leur disponibilité et leurs missions en cours.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6">Statuts d&apos;un consultant</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-green-50 rounded-lg text-center">
          <span className="text-green-600 font-medium">Disponible</span>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg text-center">
          <span className="text-blue-600 font-medium">En mission</span>
        </div>
        <div className="p-3 bg-amber-50 rounded-lg text-center">
          <span className="text-amber-600 font-medium">Intercontrat</span>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <span className="text-gray-600 font-medium">Indisponible</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mt-6">Actions rapides</h3>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
          <span>Voir le profil complet et les compétences</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
          <span>Consulter l&apos;historique des missions</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
          <span>Affecter à une opportunité</span>
        </li>
      </ul>
    </div>
  )
}

// ==================== ADMIN DOCUMENTATION (Technical) ====================
function AdminDocumentation({
  activeSection,
  setActiveSection
}: {
  activeSection: string
  setActiveSection: (s: string) => void
}) {
  const sections = [
    { id: 'api', icon: Code, title: 'API REST', description: 'Documentation complète' },
    { id: 'auth', icon: Key, title: 'Authentification', description: 'Tokens et sécurité' },
    { id: 'boondmanager', icon: Building2, title: 'BoondManager', description: 'Connexion SSO' },
    { id: 'webhooks', icon: Webhook, title: 'Webhooks', description: 'Intégrations' },
    { id: 'users', icon: Users, title: 'Utilisateurs', description: 'Gestion des comptes' },
    { id: 'roles', icon: Shield, title: 'Rôles & Permissions', description: 'Contrôle d\'accès' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Documentation technique</h1>
        <p className="text-gray-600 mt-2">Guide complet de l&apos;API et des fonctionnalités</p>
      </div>

      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium">{section.title}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-8"
          >
            {activeSection === 'api' && <ApiDocs />}
            {activeSection === 'auth' && <AuthDocs />}
            {activeSection === 'boondmanager' && <BoondManagerDocs />}
            {activeSection === 'webhooks' && <WebhooksDocs />}
            {activeSection === 'users' && <UsersDocs />}
            {activeSection === 'roles' && <RolesDocs />}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// ==================== USER DOCUMENTATION (Default) ====================
function UserDocumentation({
  activeSection,
  setActiveSection
}: {
  activeSection: string
  setActiveSection: (s: string) => void
}) {
  const sections = [
    { id: 'intro', icon: BookOpen, title: 'Bienvenue', description: 'Présentation' },
    { id: 'navigation', icon: Target, title: 'Navigation', description: 'Se repérer' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Guide utilisateur</h1>
        <p className="text-gray-600 mt-2">Découvrez comment utiliser la plateforme</p>
      </div>

      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium">{section.title}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-8"
          >
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Bienvenue sur EBMC GROUP</h2>
              <p className="text-gray-600">
                Cette plateforme vous permet de consulter les offres d&apos;emploi et les informations de l&apos;entreprise.
              </p>
              <p className="text-gray-600">
                Pour plus d&apos;informations, contactez votre administrateur.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Technical documentation components (unchanged for admin)
function ApiDocs() {
  return (
    <div className="prose max-w-none">
      <h2 className="flex items-center gap-2"><Code className="w-6 h-6 text-blue-500" />API REST</h2>
      <h3>Base URL</h3>
      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg">https://ebmc.boris-henne.fr/api</pre>
      <h3>Endpoints principaux</h3>
      <table className="w-full">
        <thead><tr><th>Méthode</th><th>Endpoint</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code className="bg-green-100 text-green-700 px-2 py-1 rounded">GET</code></td><td><code>/api/jobs</code></td><td>Liste des offres</td></tr>
          <tr><td><code className="bg-green-100 text-green-700 px-2 py-1 rounded">GET</code></td><td><code>/api/consultants</code></td><td>Liste des consultants</td></tr>
          <tr><td><code className="bg-blue-100 text-blue-700 px-2 py-1 rounded">POST</code></td><td><code>/api/contact</code></td><td>Envoyer un message</td></tr>
        </tbody>
      </table>
    </div>
  )
}

function AuthDocs() {
  return (
    <div className="prose max-w-none">
      <h2 className="flex items-center gap-2"><Key className="w-6 h-6 text-amber-500" />Authentification</h2>
      <h3>Types d&apos;authentification</h3>
      <ul>
        <li><strong>Token Bearer</strong> : Pour les intégrations API externes</li>
        <li><strong>Session Cookie</strong> : Pour le dashboard (JWT)</li>
        <li><strong>BoondManager SSO</strong> : Connexion via identifiants Boond</li>
      </ul>
    </div>
  )
}

function BoondManagerDocs() {
  return (
    <div className="prose max-w-none">
      <h2 className="flex items-center gap-2"><Building2 className="w-6 h-6 text-blue-500" />Integration BoondManager</h2>
      <p>Gerez vos donnees BoondManager directement depuis le backoffice.</p>

      <h3>Connexion SSO</h3>
      <ol>
        <li>Activez l&apos;API REST dans votre profil BoondManager (Profil &gt; Configuration &gt; Securite)</li>
        <li>Sur la page de connexion, selectionnez l&apos;onglet <strong>BoondManager</strong></li>
        <li>Entrez votre sous-domaine (ex: <code>votre-entreprise</code>)</li>
        <li>Connectez-vous avec votre email et mot de passe BoondManager</li>
      </ol>

      <h3>Gestion CRUD</h3>
      <p>Accedez a la page <strong>BoondManager &gt; Gestion BDD</strong> pour gerer :</p>

      <h4>Candidats</h4>
      <ul>
        <li>Lister et rechercher des candidats</li>
        <li>Creer de nouveaux candidats</li>
        <li>Modifier les informations (nom, email, titre, statut)</li>
        <li>Supprimer des candidats</li>
      </ul>

      <h4>Ressources (Consultants)</h4>
      <ul>
        <li>Gerer les consultants/ressources internes</li>
        <li>Suivre leur statut (Disponible, En mission, Intercontrat)</li>
        <li>Modifier leurs informations de contact</li>
      </ul>

      <h4>Opportunites</h4>
      <ul>
        <li>Gerer les missions/opportunites commerciales</li>
        <li>Definir le TJM et les dates</li>
        <li>Suivre le statut (En cours, Gagnee, Perdue)</li>
      </ul>

      <h3>Statuts des candidats</h3>
      <div className="not-prose grid grid-cols-2 gap-2 my-4">
        <div className="px-3 py-2 bg-slate-100 rounded text-sm">1. A qualifier</div>
        <div className="px-3 py-2 bg-cyan-100 rounded text-sm">2. Qualifie</div>
        <div className="px-3 py-2 bg-purple-100 rounded text-sm">3. En cours</div>
        <div className="px-3 py-2 bg-amber-100 rounded text-sm">4. Entretien</div>
        <div className="px-3 py-2 bg-blue-100 rounded text-sm">5. Proposition</div>
        <div className="px-3 py-2 bg-green-100 rounded text-sm">6. Embauche</div>
        <div className="px-3 py-2 bg-red-100 rounded text-sm">7. Refuse</div>
        <div className="px-3 py-2 bg-gray-100 rounded text-sm">8. Archive</div>
      </div>

      <h3>API Endpoints</h3>
      <table className="w-full text-sm">
        <thead><tr><th>Methode</th><th>Endpoint</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code className="bg-green-100 text-green-700 px-1 rounded">GET</code></td><td><code>/api/boondmanager/candidates</code></td><td>Lister candidats</td></tr>
          <tr><td><code className="bg-blue-100 text-blue-700 px-1 rounded">POST</code></td><td><code>/api/boondmanager/candidates</code></td><td>Creer candidat</td></tr>
          <tr><td><code className="bg-amber-100 text-amber-700 px-1 rounded">PATCH</code></td><td><code>/api/boondmanager/candidates</code></td><td>Modifier candidat</td></tr>
          <tr><td><code className="bg-red-100 text-red-700 px-1 rounded">DELETE</code></td><td><code>/api/boondmanager/candidates</code></td><td>Supprimer candidat</td></tr>
        </tbody>
      </table>
    </div>
  )
}

function WebhooksDocs() {
  return (
    <div className="prose max-w-none">
      <h2 className="flex items-center gap-2"><Webhook className="w-6 h-6 text-purple-500" />Webhooks</h2>
      <h3>Make.com</h3>
      <p>Configurez les webhooks Make.com pour automatiser vos workflows.</p>
      <h3>Événements disponibles</h3>
      <ul>
        <li>Nouvelle candidature</li>
        <li>Nouvelle offre</li>
        <li>Message contact</li>
      </ul>
    </div>
  )
}

function UsersDocs() {
  return (
    <div className="prose max-w-none">
      <h2 className="flex items-center gap-2"><Users className="w-6 h-6 text-blue-500" />Gestion des utilisateurs</h2>
      <p>Les administrateurs peuvent créer des comptes avec différents rôles.</p>
      <h3>Rôles disponibles</h3>
      <ul>
        <li><strong>Admin</strong> : Toutes les permissions</li>
        <li><strong>Sourceur</strong> : Recrutement et recherche</li>
        <li><strong>Commercial</strong> : Opportunités et consultants</li>
        <li><strong>Freelance</strong> : Portail freelance</li>
      </ul>
    </div>
  )
}

function RolesDocs() {
  return (
    <div className="prose max-w-none">
      <h2 className="flex items-center gap-2"><Shield className="w-6 h-6 text-green-500" />Rôles & Permissions</h2>
      <p>Le système utilise des permissions granulaires par rôle.</p>
      <h3>Principe du moindre privilège</h3>
      <p>Chaque rôle n&apos;a accès qu&apos;aux fonctionnalités dont il a besoin.</p>
    </div>
  )
}
