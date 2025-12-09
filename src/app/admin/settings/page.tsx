'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Save, Building2, Phone, Mail, Globe, MapPin, Shield, Bell,
  Loader2, Users, FileText, CreditCard, Link2, Settings2, CheckCircle
} from 'lucide-react'

interface SiteSettings {
  // Company Info
  companyName: string
  companyLegalName: string
  companyDescription: string
  companySlogan: string

  // Contact
  emailContact: string
  emailSupport: string
  emailRecruitment: string
  emailCommercial: string
  emailAdmin: string
  phoneMain: string
  phoneMobile: string
  fax: string

  // Address
  addressStreet: string
  addressStreet2: string
  addressCity: string
  addressPostalCode: string
  addressCountry: string
  addressRegion: string

  // Web & Social
  domain: string
  websiteUrl: string
  linkedinUrl: string
  twitterUrl: string
  facebookUrl: string
  instagramUrl: string
  githubUrl: string

  // Legal Info
  siret: string
  siren: string
  tvaNumber: string
  rcsNumber: string
  legalForm: string
  capitalSocial: string
  apeCode: string

  // Business Settings
  defaultCurrency: string
  defaultTimezone: string
  defaultLanguage: string
  fiscalYearStart: string

  // Notifications
  enableEmailNotifications: boolean
  enableSlackNotifications: boolean
  notificationEmail: string
  slackWebhookUrl: string

  // Integrations
  boondSubdomain: string
  googleAnalyticsId: string
  googleTagManagerId: string

  // SEO
  metaTitle: string
  metaDescription: string
  metaKeywords: string
}

const defaultSettings: SiteSettings = {
  // Company Info
  companyName: 'EBMC GROUP',
  companyLegalName: 'EBMC GROUP S.à r.l.',
  companyDescription: 'Expert en transformation digitale et ESN spécialisée dans le conseil IT',
  companySlogan: 'Your Digital Transformation Partner',

  // Contact
  emailContact: 'contact@ebmcgroup.eu',
  emailSupport: 'support@ebmcgroup.eu',
  emailRecruitment: 'recrutement@ebmcgroup.eu',
  emailCommercial: 'commercial@ebmcgroup.eu',
  emailAdmin: 'admin@ebmcgroup.eu',
  phoneMain: '+352 621 123 456',
  phoneMobile: '+352 621 789 012',
  fax: '',

  // Address
  addressStreet: '2 Rue du Fort Thüngen',
  addressStreet2: '',
  addressCity: 'Luxembourg',
  addressPostalCode: 'L-1499',
  addressCountry: 'Luxembourg',
  addressRegion: 'Luxembourg',

  // Web & Social
  domain: 'ebmcgroup.eu',
  websiteUrl: 'https://www.ebmcgroup.eu',
  linkedinUrl: 'https://www.linkedin.com/company/ebmc-group',
  twitterUrl: '',
  facebookUrl: '',
  instagramUrl: '',
  githubUrl: '',

  // Legal Info
  siret: '',
  siren: '',
  tvaNumber: 'LU12345678',
  rcsNumber: 'B123456',
  legalForm: 'S.à r.l.',
  capitalSocial: '12 500 €',
  apeCode: '6202A',

  // Business Settings
  defaultCurrency: 'EUR',
  defaultTimezone: 'Europe/Luxembourg',
  defaultLanguage: 'fr',
  fiscalYearStart: '01-01',

  // Notifications
  enableEmailNotifications: true,
  enableSlackNotifications: false,
  notificationEmail: 'notifications@ebmcgroup.eu',
  slackWebhookUrl: '',

  // Integrations
  boondSubdomain: '',
  googleAnalyticsId: '',
  googleTagManagerId: '',

  // SEO
  metaTitle: 'EBMC GROUP - Expert Transformation Digitale Luxembourg',
  metaDescription: 'EBMC GROUP, votre partenaire en transformation digitale au Luxembourg. Conseil IT, développement, cloud et data.',
  metaKeywords: 'ESN Luxembourg, transformation digitale, conseil IT, développement web, cloud, data',
}

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [activeSection, setActiveSection] = useState('company')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const data = await res.json()
          if (data.settings) {
            setSettings({ ...defaultSettings, ...data.settings })
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof SiteSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const sections = [
    { id: 'company', label: 'Entreprise', icon: Building2 },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'address', label: 'Adresse', icon: MapPin },
    { id: 'web', label: 'Web & Réseaux', icon: Globe },
    { id: 'legal', label: 'Informations légales', icon: FileText },
    { id: 'business', label: 'Paramètres métier', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Intégrations', icon: Link2 },
    { id: 'seo', label: 'SEO', icon: Settings2 },
  ]

  const InputField = ({
    label,
    field,
    type = 'text',
    placeholder = '',
    help = ''
  }: {
    label: string
    field: keyof SiteSettings
    type?: string
    placeholder?: string
    help?: string
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={settings[field] as string}
        onChange={(e) => updateSetting(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-ebmc-turquoise focus:border-transparent transition"
      />
      {help && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{help}</p>}
    </div>
  )

  const Toggle = ({
    label,
    field,
    description
  }: {
    label: string
    field: keyof SiteSettings
    description: string
  }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => updateSetting(field, !settings[field])}
        className={`relative w-12 h-6 rounded-full transition ${
          settings[field] ? 'bg-ebmc-turquoise' : 'bg-gray-300 dark:bg-slate-600'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${
            settings[field] ? 'translate-x-6' : ''
          }`}
        />
      </button>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Configuration du site et du backoffice</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-ebmc-turquoise text-white px-6 py-2.5 rounded-lg hover:bg-ebmc-turquoise/90 transition disabled:opacity-50 shadow-lg"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé !' : 'Sauvegarder'}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <nav className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-2 sticky top-24">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  activeSection === section.id
                    ? 'bg-ebmc-turquoise text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {/* Company Info */}
          {activeSection === 'company' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-ebmc-turquoise" />
                Informations de l&apos;entreprise
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Nom commercial" field="companyName" />
                <InputField label="Raison sociale" field="companyLegalName" />
                <div className="md:col-span-2">
                  <InputField label="Description" field="companyDescription" />
                </div>
                <div className="md:col-span-2">
                  <InputField label="Slogan" field="companySlogan" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Contact */}
          {activeSection === 'contact' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Mail className="w-5 h-5 text-ebmc-turquoise" />
                Coordonnées de contact
              </h2>

              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Emails</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <InputField label="Email principal" field="emailContact" type="email" />
                <InputField label="Email support" field="emailSupport" type="email" />
                <InputField label="Email recrutement" field="emailRecruitment" type="email" />
                <InputField label="Email commercial" field="emailCommercial" type="email" />
                <InputField label="Email administration" field="emailAdmin" type="email" />
              </div>

              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Téléphones</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="Téléphone principal" field="phoneMain" type="tel" placeholder="+352 621 123 456" />
                <InputField label="Téléphone mobile" field="phoneMobile" type="tel" />
                <InputField label="Fax" field="fax" type="tel" />
              </div>
            </motion.div>
          )}

          {/* Address */}
          {activeSection === 'address' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-ebmc-turquoise" />
                Adresse du siège social
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <InputField label="Adresse (ligne 1)" field="addressStreet" />
                </div>
                <div className="md:col-span-2">
                  <InputField label="Adresse (ligne 2)" field="addressStreet2" placeholder="Bâtiment, étage, etc." />
                </div>
                <InputField label="Code postal" field="addressPostalCode" />
                <InputField label="Ville" field="addressCity" />
                <InputField label="Région / État" field="addressRegion" />
                <InputField label="Pays" field="addressCountry" />
              </div>
            </motion.div>
          )}

          {/* Web & Social */}
          {activeSection === 'web' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-ebmc-turquoise" />
                Web & Réseaux sociaux
              </h2>

              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Site web</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <InputField label="Nom de domaine" field="domain" placeholder="exemple.com" />
                <InputField label="URL du site" field="websiteUrl" type="url" placeholder="https://www.exemple.com" />
              </div>

              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Réseaux sociaux</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="LinkedIn" field="linkedinUrl" type="url" placeholder="https://linkedin.com/company/..." />
                <InputField label="Twitter / X" field="twitterUrl" type="url" placeholder="https://twitter.com/..." />
                <InputField label="Facebook" field="facebookUrl" type="url" placeholder="https://facebook.com/..." />
                <InputField label="Instagram" field="instagramUrl" type="url" placeholder="https://instagram.com/..." />
                <InputField label="GitHub" field="githubUrl" type="url" placeholder="https://github.com/..." />
              </div>
            </motion.div>
          )}

          {/* Legal Info */}
          {activeSection === 'legal' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-ebmc-turquoise" />
                Informations légales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Forme juridique" field="legalForm" placeholder="S.à r.l., SA, SAS..." />
                <InputField label="Capital social" field="capitalSocial" placeholder="12 500 €" />
                <InputField label="N° SIRET" field="siret" help="14 chiffres (France)" />
                <InputField label="N° SIREN" field="siren" help="9 chiffres (France)" />
                <InputField label="N° TVA intracommunautaire" field="tvaNumber" placeholder="LU12345678" />
                <InputField label="N° RCS" field="rcsNumber" placeholder="B123456 Luxembourg" />
                <InputField label="Code APE / NAF" field="apeCode" placeholder="6202A" />
              </div>
            </motion.div>
          )}

          {/* Business Settings */}
          {activeSection === 'business' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-ebmc-turquoise" />
                Paramètres métier
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Devise par défaut</label>
                  <select
                    value={settings.defaultCurrency}
                    onChange={(e) => updateSetting('defaultCurrency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-ebmc-turquoise"
                  >
                    <option value="EUR">EUR - Euro (€)</option>
                    <option value="USD">USD - Dollar ($)</option>
                    <option value="GBP">GBP - Livre Sterling (£)</option>
                    <option value="CHF">CHF - Franc Suisse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fuseau horaire</label>
                  <select
                    value={settings.defaultTimezone}
                    onChange={(e) => updateSetting('defaultTimezone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-ebmc-turquoise"
                  >
                    <option value="Europe/Luxembourg">Europe/Luxembourg</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="Europe/Brussels">Europe/Brussels</option>
                    <option value="Europe/Berlin">Europe/Berlin</option>
                    <option value="Europe/London">Europe/London</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Langue par défaut</label>
                  <select
                    value={settings.defaultLanguage}
                    onChange={(e) => updateSetting('defaultLanguage', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-ebmc-turquoise"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="lu">Lëtzebuergesch</option>
                  </select>
                </div>
                <InputField
                  label="Début exercice fiscal"
                  field="fiscalYearStart"
                  placeholder="01-01"
                  help="Format: MM-JJ"
                />
              </div>
            </motion.div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-ebmc-turquoise" />
                Notifications
              </h2>

              <div className="space-y-4 mb-6">
                <Toggle
                  label="Notifications par email"
                  field="enableEmailNotifications"
                  description="Recevoir les notifications système par email"
                />
                <Toggle
                  label="Notifications Slack"
                  field="enableSlackNotifications"
                  description="Envoyer les notifications vers un canal Slack"
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <InputField
                  label="Email de notification"
                  field="notificationEmail"
                  type="email"
                  help="Adresse recevant les notifications système"
                />
                {settings.enableSlackNotifications && (
                  <InputField
                    label="Webhook Slack"
                    field="slackWebhookUrl"
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* Integrations */}
          {activeSection === 'integrations' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-ebmc-turquoise" />
                Intégrations
              </h2>

              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">BoondManager</h3>
              <div className="grid grid-cols-1 gap-6 mb-8">
                <InputField
                  label="Sous-domaine Boond"
                  field="boondSubdomain"
                  placeholder="votreentreprise"
                  help="Votre sous-domaine BoondManager (sans .boondmanager.com)"
                />
              </div>

              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Google Analytics ID"
                  field="googleAnalyticsId"
                  placeholder="G-XXXXXXXXXX"
                />
                <InputField
                  label="Google Tag Manager ID"
                  field="googleTagManagerId"
                  placeholder="GTM-XXXXXXX"
                />
              </div>
            </motion.div>
          )}

          {/* SEO */}
          {activeSection === 'seo' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-ebmc-turquoise" />
                SEO & Métadonnées
              </h2>
              <div className="space-y-6">
                <InputField
                  label="Titre SEO (meta title)"
                  field="metaTitle"
                  help="Recommandé: 50-60 caractères"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description SEO (meta description)
                  </label>
                  <textarea
                    value={settings.metaDescription}
                    onChange={(e) => updateSetting('metaDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-ebmc-turquoise resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Recommandé: 150-160 caractères</p>
                </div>
                <InputField
                  label="Mots-clés (meta keywords)"
                  field="metaKeywords"
                  help="Séparés par des virgules"
                />
              </div>
            </motion.div>
          )}

          {/* Security - Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-ebmc-turquoise" />
              Sécurité
            </h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Authentification à deux facteurs</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ajouter une couche de sécurité supplémentaire</p>
              </div>
              <span className="px-3 py-1 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                Bientôt disponible
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
