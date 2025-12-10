'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Webhook, Save, Loader2, TestTube, CheckCircle, XCircle, Shield, ShieldOff,
  ArrowRight, Database, RefreshCw, Clock, AlertCircle, Info, Eye, EyeOff,
  Settings, Zap, Server, Globe, Lock
} from 'lucide-react'

interface WebhookConfig {
  make: {
    enabled: boolean
    webhooks: {
      newCandidate: string
      newOffer: string
      application: string
      contact: string
      sync: string
    }
  }
  boondmanager: {
    enabled: boolean
    prodUrl: string
    prodClientId: string
    prodUsername: string
    prodToken: string
    sandboxUrl: string
    sandboxClientId: string
    sandboxUsername: string
    sandboxToken: string
    useSandbox: boolean
  }
}

interface ConnectionStatus {
  production: { connected: boolean; error?: string; lastCheck?: string }
  sandbox: { connected: boolean; error?: string; lastCheck?: string }
}

interface SyncLog {
  completedAt: string
  success: boolean
  step: string
  results?: Array<{ step: string; success: boolean; message: string }>
}

const defaultConfig: WebhookConfig = {
  make: {
    enabled: false,
    webhooks: {
      newCandidate: '',
      newOffer: '',
      application: '',
      contact: '',
      sync: '',
    }
  },
  boondmanager: {
    enabled: false,
    prodUrl: 'https://ui.boondmanager.com/api',
    prodClientId: '',
    prodUsername: '',
    prodToken: '',
    sandboxUrl: 'https://sandbox.boondmanager.com/api',
    sandboxClientId: '',
    sandboxUsername: '',
    sandboxToken: '',
    useSandbox: true,
  }
}

export default function WebhooksPage() {
  const [config, setConfig] = useState<WebhookConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{ webhook: string; success: boolean } | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    production: { connected: false },
    sandbox: { connected: false },
  })
  const [testingConnection, setTestingConnection] = useState<'production' | 'sandbox' | null>(null)
  const [lastSync, setLastSync] = useState<SyncLog | null>(null)
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({})

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/webhooks', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setConfig(data.config || defaultConfig)
      }
    } catch (error) {
      console.error('Error fetching config:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSyncStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/site/workflow', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.status?.lastSync) {
          setLastSync(data.status.lastSync)
        }
      }
    } catch (error) {
      console.error('Error fetching sync status:', error)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
    fetchSyncStatus()
  }, [fetchConfig, fetchSyncStatus])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/webhooks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config)
      })
      if (res.ok) {
        alert('Configuration sauvegardee')
      }
    } catch (error) {
      console.error('Error saving config:', error)
    } finally {
      setSaving(false)
    }
  }

  const testWebhook = async (webhookName: string) => {
    setTesting(webhookName)
    setTestResult(null)
    try {
      const res = await fetch('/api/admin/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'make', webhookName })
      })
      const data = await res.json()
      setTestResult({ webhook: webhookName, success: data.success })
    } catch {
      setTestResult({ webhook: webhookName, success: false })
    } finally {
      setTesting(null)
    }
  }

  const testConnection = async (env: 'production' | 'sandbox') => {
    setTestingConnection(env)
    try {
      const res = await fetch(`/api/boondmanager/v2?env=${env}&type=stats`, { credentials: 'include' })
      const data = await res.json()

      setConnectionStatus(prev => ({
        ...prev,
        [env]: {
          connected: data.success || res.ok,
          error: data.error,
          lastCheck: new Date().toISOString(),
        }
      }))
    } catch (err) {
      setConnectionStatus(prev => ({
        ...prev,
        [env]: {
          connected: false,
          error: err instanceof Error ? err.message : 'Connection failed',
          lastCheck: new Date().toISOString(),
        }
      }))
    } finally {
      setTestingConnection(null)
    }
  }

  const toggleShowToken = (key: string) => {
    setShowTokens(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-ebmc-turquoise" />
            Integrations & Webhooks
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Configuration du pipeline BoondManager et des automatisations Make.com
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-ebmc-turquoise text-white rounded-lg hover:bg-ebmc-turquoise/90 transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Sauvegarder
        </button>
      </div>

      {/* Workflow Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Workflow de synchronisation
        </h2>

        <div className="flex items-center justify-center gap-4 py-6 overflow-x-auto">
          {/* Production */}
          <div className="text-center flex-shrink-0">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-2 border-2 transition ${
              connectionStatus.production.connected
                ? 'bg-green-100 dark:bg-green-900/30 border-green-500'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
            }`}>
              <Shield className={`w-10 h-10 ${connectionStatus.production.connected ? 'text-green-600' : 'text-slate-400'}`} />
            </div>
            <p className="font-semibold text-slate-800 dark:text-white text-sm">BoondManager</p>
            <p className="text-xs text-green-600 font-medium">Production</p>
            <button
              onClick={() => testConnection('production')}
              disabled={testingConnection === 'production'}
              className="mt-2 text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-green-800/50 transition"
            >
              {testingConnection === 'production' ? <Loader2 className="w-3 h-3 animate-spin inline" /> : 'Tester'}
            </button>
          </div>

          <ArrowRight className="w-6 h-6 text-cyan-500 flex-shrink-0" />

          {/* MongoDB */}
          <div className="text-center flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-2 border-2 border-emerald-500">
              <Database className="w-10 h-10 text-emerald-600" />
            </div>
            <p className="font-semibold text-slate-800 dark:text-white text-sm">MongoDB</p>
            <p className="text-xs text-emerald-600 font-medium">Site EBMC</p>
            <Link
              href="/admin/database"
              className="mt-2 inline-block text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition"
            >
              Explorer
            </Link>
          </div>

          <ArrowRight className="w-6 h-6 text-cyan-500 flex-shrink-0" />

          {/* Sandbox */}
          <div className="text-center flex-shrink-0">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-2 border-2 transition ${
              connectionStatus.sandbox.connected
                ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-500'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
            }`}>
              <ShieldOff className={`w-10 h-10 ${connectionStatus.sandbox.connected ? 'text-amber-600' : 'text-slate-400'}`} />
            </div>
            <p className="font-semibold text-slate-800 dark:text-white text-sm">BoondManager</p>
            <p className="text-xs text-amber-600 font-medium">Sandbox</p>
            <button
              onClick={() => testConnection('sandbox')}
              disabled={testingConnection === 'sandbox'}
              className="mt-2 text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800/50 transition"
            >
              {testingConnection === 'sandbox' ? <Loader2 className="w-3 h-3 animate-spin inline" /> : 'Tester'}
            </button>
          </div>
        </div>

        {/* Last Sync Status */}
        {lastSync && (
          <div className={`mt-4 p-3 rounded-lg ${lastSync.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            <div className="flex items-center gap-2 text-sm">
              {lastSync.success ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className={lastSync.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                Derniere sync: {new Date(lastSync.completedAt).toLocaleString('fr-FR')}
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-center">
          <Link
            href="/admin/boondmanager-v2?tab=sync"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
            Acceder au workflow complet
          </Link>
        </div>
      </motion.div>

      {/* BoondManager Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-slate-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">BoondManager API</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Configuration des environnements</p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.boondmanager.enabled}
              onChange={(e) => setConfig({
                ...config,
                boondmanager: { ...config.boondmanager, enabled: e.target.checked }
              })}
              className="w-5 h-5 text-ebmc-turquoise rounded focus:ring-ebmc-turquoise"
            />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Activer</span>
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Production */}
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800 dark:text-green-200">Production</h3>
              <span className="text-xs px-2 py-0.5 bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300 rounded-full">
                Lecture seule
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> URL API
                </label>
                <input
                  type="url"
                  value={config.boondmanager.prodUrl}
                  onChange={(e) => setConfig({
                    ...config,
                    boondmanager: { ...config.boondmanager, prodUrl: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-green-200 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-1">Client ID</label>
                <input
                  type="text"
                  value={config.boondmanager.prodClientId}
                  onChange={(e) => setConfig({
                    ...config,
                    boondmanager: { ...config.boondmanager, prodClientId: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-green-200 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-1">Username</label>
                <input
                  type="text"
                  value={config.boondmanager.prodUsername}
                  onChange={(e) => setConfig({
                    ...config,
                    boondmanager: { ...config.boondmanager, prodUsername: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-green-200 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Token
                </label>
                <div className="relative">
                  <input
                    type={showTokens.prod ? 'text' : 'password'}
                    value={config.boondmanager.prodToken}
                    onChange={(e) => setConfig({
                      ...config,
                      boondmanager: { ...config.boondmanager, prodToken: e.target.value }
                    })}
                    className="w-full px-3 py-2 pr-10 bg-white dark:bg-slate-900 border border-green-200 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowToken('prod')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-green-600 hover:text-green-800"
                  >
                    {showTokens.prod ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sandbox */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-4">
              <ShieldOff className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">Sandbox</h3>
              <span className="text-xs px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 rounded-full">
                Lecture/Ecriture
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> URL API
                </label>
                <input
                  type="url"
                  value={config.boondmanager.sandboxUrl}
                  onChange={(e) => setConfig({
                    ...config,
                    boondmanager: { ...config.boondmanager, sandboxUrl: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">Client ID</label>
                <input
                  type="text"
                  value={config.boondmanager.sandboxClientId}
                  onChange={(e) => setConfig({
                    ...config,
                    boondmanager: { ...config.boondmanager, sandboxClientId: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">Username</label>
                <input
                  type="text"
                  value={config.boondmanager.sandboxUsername}
                  onChange={(e) => setConfig({
                    ...config,
                    boondmanager: { ...config.boondmanager, sandboxUsername: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Token
                </label>
                <div className="relative">
                  <input
                    type={showTokens.sandbox ? 'text' : 'password'}
                    value={config.boondmanager.sandboxToken}
                    onChange={(e) => setConfig({
                      ...config,
                      boondmanager: { ...config.boondmanager, sandboxToken: e.target.value }
                    })}
                    className="w-full px-3 py-2 pr-10 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowToken('sandbox')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-amber-600 hover:text-amber-800"
                  >
                    {showTokens.sandbox ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Workflow:</strong> Les donnees sont importees depuis <span className="font-semibold">Production</span> (lecture seule),
            stockees dans MongoDB pour traitement, puis exportees vers <span className="font-semibold">Sandbox</span> pour tests.
          </p>
        </div>
      </motion.div>

      {/* Make.com */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-slate-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
              <Webhook className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Make.com</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Webhooks pour automatisations</p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.make.enabled}
              onChange={(e) => setConfig({
                ...config,
                make: { ...config.make, enabled: e.target.checked }
              })}
              className="w-5 h-5 text-ebmc-turquoise rounded focus:ring-ebmc-turquoise"
            />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Activer</span>
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(config.make.webhooks).map(([key, value]) => (
            <div key={key} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={value}
                  onChange={(e) => setConfig({
                    ...config,
                    make: {
                      ...config.make,
                      webhooks: { ...config.make.webhooks, [key]: e.target.value }
                    }
                  })}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="https://hook.make.com/..."
                />
                <button
                  onClick={() => testWebhook(key)}
                  disabled={!value || testing === key}
                  className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-300 rounded-lg transition disabled:opacity-50"
                >
                  {testing === key ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : testResult?.webhook === key ? (
                    testResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
