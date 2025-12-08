'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Webhook, Save, Loader2, TestTube, CheckCircle, XCircle } from 'lucide-react'

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

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
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
  }

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
        alert('Configuration sauvegardée')
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Webhooks</h1>
          <p className="text-gray-600 mt-2">Configurez les intégrations Make.com et Boondmanager</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Sauvegarder
        </button>
      </div>

      <div className="space-y-6">
        {/* Make.com */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Webhook className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Make.com</h2>
                <p className="text-sm text-gray-500">Webhooks pour automatisations</p>
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
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-600">Activer</span>
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(config.make.webhooks).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
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
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="https://hook.make.com/..."
                  />
                  <button
                    onClick={() => testWebhook(key)}
                    disabled={!value || testing === key}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
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

        {/* Boondmanager */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Webhook className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Boondmanager</h2>
                <p className="text-sm text-gray-500">Intégration ERP / CRM</p>
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
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-600">Activer</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.boondmanager.useSandbox}
                onChange={(e) => setConfig({
                  ...config,
                  boondmanager: { ...config.boondmanager, useSandbox: e.target.checked }
                })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-600">Utiliser l&apos;environnement Sandbox</span>
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Production */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Production</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL API</label>
                <input
                  type="url"
                  value={config.boondmanager.prodUrl}
                  onChange={(e) => setConfig({
                    ...config,
                    boondmanager: { ...config.boondmanager, prodUrl: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                <input
                  type="text"
                  value={config.boondmanager.prodClientId}
                  onChange={(e) => setConfig({
                    ...config,
                    boondmanager: { ...config.boondmanager, prodClientId: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={config.boondmanager.prodUsername}
                  onChange={(e) => setConfig({
                    ...config,
                    boondmanager: { ...config.boondmanager, prodUsername: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Token</label>
                <input
                  type="password"
                  value={config.boondmanager.prodToken}
                  onChange={(e) => setConfig({
                    ...config,
                    boondmanager: { ...config.boondmanager, prodToken: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Sandbox */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Sandbox</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL API</label>
                <input
                  type="url"
                  value={config.boondmanager.sandboxUrl}
                  onChange={(e) => setConfig({
                    ...config,
                    boondmanager: { ...config.boondmanager, sandboxUrl: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                <input
                  type="text"
                  value={config.boondmanager.sandboxClientId}
                  onChange={(e) => setConfig({
                    ...config,
                    boondmanager: { ...config.boondmanager, sandboxClientId: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={config.boondmanager.sandboxUsername}
                  onChange={(e) => setConfig({
                    ...config,
                    boondmanager: { ...config.boondmanager, sandboxUsername: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Token</label>
                <input
                  type="password"
                  value={config.boondmanager.sandboxToken}
                  onChange={(e) => setConfig({
                    ...config,
                    boondmanager: { ...config.boondmanager, sandboxToken: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
