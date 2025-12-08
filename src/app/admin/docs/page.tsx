'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Code, Key, Webhook, Users, Shield, ChevronRight } from 'lucide-react'

const sections = [
  {
    id: 'api',
    icon: Code,
    title: 'API REST',
    description: 'Documentation complète de l\'API'
  },
  {
    id: 'auth',
    icon: Key,
    title: 'Authentification',
    description: 'Tokens et sécurité'
  },
  {
    id: 'webhooks',
    icon: Webhook,
    title: 'Webhooks',
    description: 'Intégrations Make.com et Boondmanager'
  },
  {
    id: 'users',
    icon: Users,
    title: 'Utilisateurs',
    description: 'Gestion des comptes'
  },
  {
    id: 'roles',
    icon: Shield,
    title: 'Rôles & Permissions',
    description: 'Contrôle d\'accès'
  },
]

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('api')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
        <p className="text-gray-600 mt-2">Guide complet de l&apos;API et des fonctionnalités</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
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

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-8"
          >
            {activeSection === 'api' && <ApiDocs />}
            {activeSection === 'auth' && <AuthDocs />}
            {activeSection === 'webhooks' && <WebhooksDocs />}
            {activeSection === 'users' && <UsersDocs />}
            {activeSection === 'roles' && <RolesDocs />}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function ApiDocs() {
  return (
    <div className="prose max-w-none">
      <h2 className="flex items-center gap-2">
        <Code className="w-6 h-6 text-blue-500" />
        API REST
      </h2>

      <h3>Base URL</h3>
      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg">
        https://ebmc.boris-henne.fr/api
      </pre>

      <h3>Endpoints disponibles</h3>

      <h4>Offres d&apos;emploi</h4>
      <table className="w-full">
        <thead>
          <tr>
            <th>Méthode</th>
            <th>Endpoint</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code className="bg-green-100 text-green-700 px-2 py-1 rounded">GET</code></td>
            <td><code>/api/jobs</code></td>
            <td>Liste des offres</td>
          </tr>
          <tr>
            <td><code className="bg-green-100 text-green-700 px-2 py-1 rounded">GET</code></td>
            <td><code>/api/jobs/:id</code></td>
            <td>Détail d&apos;une offre</td>
          </tr>
          <tr>
            <td><code className="bg-blue-100 text-blue-700 px-2 py-1 rounded">POST</code></td>
            <td><code>/api/admin/jobs</code></td>
            <td>Créer une offre (auth)</td>
          </tr>
          <tr>
            <td><code className="bg-amber-100 text-amber-700 px-2 py-1 rounded">PUT</code></td>
            <td><code>/api/admin/jobs/:id</code></td>
            <td>Modifier une offre (auth)</td>
          </tr>
          <tr>
            <td><code className="bg-red-100 text-red-700 px-2 py-1 rounded">DELETE</code></td>
            <td><code>/api/admin/jobs/:id</code></td>
            <td>Supprimer une offre (auth)</td>
          </tr>
        </tbody>
      </table>

      <h4>Consultants</h4>
      <table className="w-full">
        <thead>
          <tr>
            <th>Méthode</th>
            <th>Endpoint</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code className="bg-green-100 text-green-700 px-2 py-1 rounded">GET</code></td>
            <td><code>/api/consultants</code></td>
            <td>Liste des consultants</td>
          </tr>
          <tr>
            <td><code className="bg-blue-100 text-blue-700 px-2 py-1 rounded">POST</code></td>
            <td><code>/api/admin/consultants</code></td>
            <td>Créer un consultant (auth)</td>
          </tr>
        </tbody>
      </table>

      <h4>Contact</h4>
      <table className="w-full">
        <thead>
          <tr>
            <th>Méthode</th>
            <th>Endpoint</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code className="bg-blue-100 text-blue-700 px-2 py-1 rounded">POST</code></td>
            <td><code>/api/contact</code></td>
            <td>Envoyer un message</td>
          </tr>
        </tbody>
      </table>

      <h3>Exemple de requête</h3>
      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`curl -X GET https://ebmc.boris-henne.fr/api/jobs \\
  -H "Authorization: Bearer votre_token" \\
  -H "Content-Type: application/json"`}
      </pre>
    </div>
  )
}

function AuthDocs() {
  return (
    <div className="prose max-w-none">
      <h2 className="flex items-center gap-2">
        <Key className="w-6 h-6 text-amber-500" />
        Authentification
      </h2>

      <h3>Types d&apos;authentification</h3>

      <h4>1. Token Bearer (API)</h4>
      <p>Pour les intégrations externes, utilisez un token API Bearer :</p>
      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg">
{`Authorization: Bearer ebmc_xxxxxxxxxxxx`}
      </pre>
      <p>Créez vos tokens dans <strong>Tokens API</strong> du dashboard.</p>

      <h4>2. Session Cookie (Dashboard)</h4>
      <p>Le dashboard utilise des cookies de session JWT :</p>
      <ul>
        <li>Cookie <code>auth-token</code> créé à la connexion</li>
        <li>Validité : 7 jours</li>
        <li>Renouvelé automatiquement</li>
      </ul>

      <h3>Endpoints d&apos;authentification</h3>
      <table className="w-full">
        <thead>
          <tr>
            <th>Méthode</th>
            <th>Endpoint</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code className="bg-blue-100 text-blue-700 px-2 py-1 rounded">POST</code></td>
            <td><code>/api/auth/login</code></td>
            <td>Connexion</td>
          </tr>
          <tr>
            <td><code className="bg-blue-100 text-blue-700 px-2 py-1 rounded">POST</code></td>
            <td><code>/api/auth/logout</code></td>
            <td>Déconnexion</td>
          </tr>
          <tr>
            <td><code className="bg-green-100 text-green-700 px-2 py-1 rounded">GET</code></td>
            <td><code>/api/auth/me</code></td>
            <td>Utilisateur courant</td>
          </tr>
        </tbody>
      </table>

      <h3>Exemple de connexion</h3>
      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`curl -X POST https://ebmc.boris-henne.fr/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "admin@ebmcgroup.eu", "password": "votre_mdp"}'`}
      </pre>
    </div>
  )
}

function WebhooksDocs() {
  return (
    <div className="prose max-w-none">
      <h2 className="flex items-center gap-2">
        <Webhook className="w-6 h-6 text-purple-500" />
        Webhooks
      </h2>

      <h3>Make.com</h3>
      <p>Configurez les webhooks Make.com pour automatiser vos workflows :</p>

      <h4>Webhooks disponibles</h4>
      <ul>
        <li><strong>New Candidate</strong> : Déclenché lors d&apos;une nouvelle candidature</li>
        <li><strong>New Offer</strong> : Déclenché lors de la création d&apos;une offre</li>
        <li><strong>Application</strong> : Déclenché lors d&apos;une postulation</li>
        <li><strong>Contact</strong> : Déclenché lors d&apos;un message contact</li>
        <li><strong>Sync</strong> : Synchronisation manuelle</li>
      </ul>

      <h4>Payload exemple</h4>
      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`{
  "event": "new_candidate",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "job_id": "123",
    "cv_url": "https://..."
  }
}`}
      </pre>

      <h3>Boondmanager</h3>
      <p>Intégration avec votre ERP Boondmanager :</p>

      <h4>Configuration</h4>
      <ol>
        <li>Récupérez vos identifiants API dans Boondmanager</li>
        <li>Configurez les credentials dans <strong>Webhooks</strong></li>
        <li>Activez le mode Sandbox pour les tests</li>
      </ol>

      <h4>Fonctionnalités</h4>
      <ul>
        <li>Synchronisation des consultants</li>
        <li>Import/export des missions</li>
        <li>Mise à jour des disponibilités</li>
      </ul>
    </div>
  )
}

function UsersDocs() {
  return (
    <div className="prose max-w-none">
      <h2 className="flex items-center gap-2">
        <Users className="w-6 h-6 text-blue-500" />
        Gestion des utilisateurs
      </h2>

      <h3>Création d&apos;utilisateurs</h3>
      <p>Les administrateurs peuvent créer des comptes utilisateurs avec différents rôles :</p>

      <ol>
        <li>Accédez à <strong>Utilisateurs</strong> dans le menu</li>
        <li>Cliquez sur <strong>Ajouter</strong></li>
        <li>Renseignez email, nom et mot de passe</li>
        <li>Sélectionnez le rôle approprié</li>
      </ol>

      <h3>Rôles par défaut</h3>
      <table className="w-full">
        <thead>
          <tr>
            <th>Rôle</th>
            <th>Permissions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>admin</code></td>
            <td>Toutes les permissions</td>
          </tr>
          <tr>
            <td><code>editor</code></td>
            <td>Lecture et écriture</td>
          </tr>
          <tr>
            <td><code>user</code></td>
            <td>Lecture seule</td>
          </tr>
        </tbody>
      </table>

      <h3>Sécurité</h3>
      <ul>
        <li>Mots de passe hashés avec bcrypt (12 rounds)</li>
        <li>Sessions JWT avec expiration</li>
        <li>Cookies HttpOnly et Secure</li>
      </ul>
    </div>
  )
}

function RolesDocs() {
  return (
    <div className="prose max-w-none">
      <h2 className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-green-500" />
        Rôles & Permissions
      </h2>

      <h3>Système de permissions</h3>
      <p>Le système utilise des permissions granulaires :</p>

      <h4>Permissions disponibles</h4>
      <table className="w-full">
        <thead>
          <tr>
            <th>Permission</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>*</code></td>
            <td>Toutes les permissions (super admin)</td>
          </tr>
          <tr>
            <td><code>read</code></td>
            <td>Lecture des données</td>
          </tr>
          <tr>
            <td><code>write</code></td>
            <td>Création et modification</td>
          </tr>
          <tr>
            <td><code>delete</code></td>
            <td>Suppression des données</td>
          </tr>
          <tr>
            <td><code>users:manage</code></td>
            <td>Gestion des utilisateurs</td>
          </tr>
          <tr>
            <td><code>roles:manage</code></td>
            <td>Gestion des rôles</td>
          </tr>
          <tr>
            <td><code>webhooks:manage</code></td>
            <td>Configuration webhooks</td>
          </tr>
          <tr>
            <td><code>api:manage</code></td>
            <td>Gestion tokens API</td>
          </tr>
        </tbody>
      </table>

      <h3>Création de rôles personnalisés</h3>
      <ol>
        <li>Accédez à <strong>Rôles</strong></li>
        <li>Cliquez sur <strong>Nouveau rôle</strong></li>
        <li>Définissez un identifiant unique</li>
        <li>Sélectionnez les permissions</li>
        <li>Enregistrez</li>
      </ol>

      <h3>Bonnes pratiques</h3>
      <ul>
        <li>Utilisez le principe du moindre privilège</li>
        <li>Créez des rôles spécifiques par fonction</li>
        <li>Auditez régulièrement les permissions</li>
      </ul>
    </div>
  )
}
