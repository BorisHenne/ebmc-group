'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Trash2, Loader2, Eye, X } from 'lucide-react'

interface Message {
  _id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  createdAt: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages')
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return

    try {
      await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
      fetchMessages()
      setSelectedMessage(null)
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      })
      fetchMessages()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">Messages reçus via le formulaire de contact</p>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            Aucun message reçu
          </div>
        ) : (
          <div className="divide-y">
            {messages.map((message) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-6 hover:bg-gray-50 cursor-pointer ${!message.read ? 'bg-blue-50' : ''}`}
                onClick={() => {
                  setSelectedMessage(message)
                  if (!message.read) markAsRead(message._id)
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{message.name}</span>
                      {!message.read && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{message.email}</p>
                    <p className="text-gray-700 mt-2 font-medium">{message.subject}</p>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{message.message}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">
                      {new Date(message.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedMessage(message) }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(message._id) }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">{selectedMessage.subject}</h2>
              <button onClick={() => setSelectedMessage(null)}>
                <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="mb-4">
                <p className="text-gray-500 text-sm">De</p>
                <p className="font-medium">{selectedMessage.name}</p>
                <p className="text-blue-600">{selectedMessage.email}</p>
              </div>
              <div className="mb-4">
                <p className="text-gray-500 text-sm">Date</p>
                <p>{new Date(selectedMessage.createdAt).toLocaleString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-2">Message</p>
                <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Répondre
              </a>
              <button
                onClick={() => handleDelete(selectedMessage._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Supprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
