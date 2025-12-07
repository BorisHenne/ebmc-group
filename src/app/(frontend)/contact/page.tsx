'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react'

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().optional(),
  company: z.string().optional(),
  type: z.enum(['general', 'project', 'partnership', 'careers']),
  subject: z.string().min(5, 'Le sujet doit contenir au moins 5 caractères'),
  message: z.string().min(20, 'Le message doit contenir au moins 20 caractères'),
})

type ContactFormData = z.infer<typeof contactSchema>

const contactTypes = [
  { value: 'project', label: 'Un projet' },
  { value: 'partnership', label: 'Partenariat' },
  { value: 'careers', label: 'Carrières' },
  { value: 'general', label: 'Autre' },
]

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      type: 'project',
    },
  })

  const selectedType = watch('type')

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setIsSuccess(true)
        reset()
        toast.success('Message envoyé avec succès !')
        setTimeout(() => setIsSuccess(false), 5000)
      } else {
        throw new Error('Failed to send')
      }
    } catch (error) {
      toast.error('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#2DB5B5]/10 rounded-full blur-[128px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Parlons de votre <span className="text-gradient">projet</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Une question, un projet, une opportunité de collaboration ? 
            Notre équipe vous répond sous 24h.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            {[
              { icon: Mail, label: 'Email', value: 'contact@ebmcgroup.eu', href: 'mailto:contact@ebmcgroup.eu' },
              { icon: Phone, label: 'Téléphone', value: '+352 XXX XXX XXX', href: 'tel:+352XXXXXXXX' },
              { icon: MapPin, label: 'Siège social', value: 'Bascharage, Luxembourg', href: null },
            ].map((info) => (
              <div key={info.label} className="p-6 rounded-xl border bg-card/50">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-[#2DB5B5]/10 text-[#2DB5B5]">
                    <info.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">{info.label}</div>
                    {info.href ? (
                      <a href={info.href} className="font-medium hover:text-[#2DB5B5] transition-colors">
                        {info.value}
                      </a>
                    ) : (
                      <div className="font-medium">{info.value}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Office Hours */}
            <div className="p-6 rounded-xl border bg-card/50">
              <h3 className="font-semibold mb-3">Horaires d'ouverture</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Lundi - Vendredi</span>
                  <span>9h00 - 18h00</span>
                </div>
                <div className="flex justify-between">
                  <span>Samedi - Dimanche</span>
                  <span>Fermé</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="p-8 rounded-xl border bg-card/50">
              {isSuccess ? (
                <div className="text-center py-12">
                  <div className="inline-flex p-4 rounded-full bg-green-500/10 text-green-500 mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Message envoyé !</h3>
                  <p className="text-muted-foreground">
                    Nous vous répondrons dans les plus brefs délais.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Contact Type */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Motif de contact</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {contactTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setValue('type', type.value as ContactFormData['type'])}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                            selectedType === type.value
                              ? 'border-[#2DB5B5] bg-[#2DB5B5]/10 text-[#2DB5B5]'
                              : 'border-border hover:border-[#2DB5B5]/50'
                          }`}
                        >
                          <span className="text-xs font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="text-sm font-medium mb-2 block">Nom complet *</label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Jean Dupont"
                        className={`w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-[#2DB5B5] focus:border-transparent transition-all ${
                          errors.name ? 'border-red-500' : 'border-input'
                        }`}
                        {...register('name')}
                      />
                      {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm font-medium mb-2 block">Email *</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="jean@entreprise.com"
                        className={`w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-[#2DB5B5] focus:border-transparent transition-all ${
                          errors.email ? 'border-red-500' : 'border-input'
                        }`}
                        {...register('email')}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    </div>
                  </div>

                  {/* Phone & Company */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="text-sm font-medium mb-2 block">Téléphone</label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="+33 6 12 34 56 78"
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-[#2DB5B5] focus:border-transparent transition-all"
                        {...register('phone')}
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="text-sm font-medium mb-2 block">Entreprise</label>
                      <input
                        id="company"
                        type="text"
                        placeholder="Nom de l'entreprise"
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-[#2DB5B5] focus:border-transparent transition-all"
                        {...register('company')}
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="text-sm font-medium mb-2 block">Sujet *</label>
                    <input
                      id="subject"
                      type="text"
                      placeholder="Comment pouvons-nous vous aider ?"
                      className={`w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-[#2DB5B5] focus:border-transparent transition-all ${
                        errors.subject ? 'border-red-500' : 'border-input'
                      }`}
                      {...register('subject')}
                    />
                    {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="text-sm font-medium mb-2 block">Message *</label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Décrivez votre projet ou votre demande..."
                      className={`w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-[#2DB5B5] focus:border-transparent transition-all resize-none ${
                        errors.message ? 'border-red-500' : 'border-input'
                      }`}
                      {...register('message')}
                    />
                    {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-[#2DB5B5] text-white font-medium hover:bg-[#249292] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Envoyer le message
                      </>
                    )}
                  </button>

                  <p className="text-xs text-muted-foreground text-center">
                    En soumettant ce formulaire, vous acceptez notre{' '}
                    <a href="/privacy" className="underline hover:text-[#2DB5B5]">
                      politique de confidentialité
                    </a>.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
