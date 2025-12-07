'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  type: z.string(),
  subject: z.string().min(5),
  message: z.string().min(20),
})

export function ContactFormBlock({ title, description, showContactInfo = true, defaultType = 'general', successMessage }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: defaultType },
  })

  const onSubmit = async (data: any) => {
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
        toast.success('Message envoyé !')
      } else throw new Error()
    } catch {
      toast.error('Erreur lors de l\'envoi')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            {title && <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {showContactInfo && (
            <div className="space-y-6">
              {[
                { icon: Mail, label: 'Email', value: 'contact@ebmcgroup.eu' },
                { icon: Phone, label: 'Téléphone', value: '+352 XXX XXX' },
                { icon: MapPin, label: 'Siège', value: 'Bascharage, Luxembourg' },
              ].map((info, i) => (
                <div key={i} className="p-6 rounded-xl border bg-card/50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-[#2DB5B5]/10 text-[#2DB5B5]">
                      <info.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">{info.label}</div>
                      <div className="font-medium">{info.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={showContactInfo ? 'lg:col-span-2' : 'lg:col-span-3 max-w-2xl mx-auto'}>
            <div className="p-8 rounded-xl border bg-card/50">
              {isSuccess ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Message envoyé !</h3>
                  <p className="text-muted-foreground">{successMessage || 'Nous vous répondrons rapidement.'}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input {...register('name')} placeholder="Nom *" className="w-full px-4 py-3 rounded-lg border bg-background" />
                    <input {...register('email')} placeholder="Email *" className="w-full px-4 py-3 rounded-lg border bg-background" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input {...register('phone')} placeholder="Téléphone" className="w-full px-4 py-3 rounded-lg border bg-background" />
                    <input {...register('company')} placeholder="Entreprise" className="w-full px-4 py-3 rounded-lg border bg-background" />
                  </div>
                  <input {...register('subject')} placeholder="Sujet *" className="w-full px-4 py-3 rounded-lg border bg-background" />
                  <textarea {...register('message')} rows={5} placeholder="Message *" className="w-full px-4 py-3 rounded-lg border bg-background resize-none" />
                  <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-[#2DB5B5] text-white font-medium hover:bg-[#249292] disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {isSubmitting ? 'Envoi...' : 'Envoyer'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
