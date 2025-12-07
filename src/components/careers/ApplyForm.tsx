'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Upload, X } from 'lucide-react'

const applySchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  coverLetter: z.string().optional(),
  gdprConsent: z.boolean().refine((v) => v === true, {
    message: 'Vous devez accepter la politique de confidentialité',
  }),
})

type ApplyFormData = z.infer<typeof applySchema>

type ApplyFormProps = {
  offerId: string
  offerTitle: string
}

export function ApplyForm({ offerId, offerTitle }: ApplyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
  })

  const onSubmit = async (data: ApplyFormData) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, String(value))
      })
      formData.append('offerId', offerId)
      if (cvFile) formData.append('cv', cvFile)

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        toast.success('Candidature envoyée avec succès !')
        reset()
        setCvFile(null)
      } else {
        throw new Error('Failed to submit')
      }
    } catch (error) {
      toast.error('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Le fichier ne doit pas dépasser 10 Mo')
        return
      }
      setCvFile(file)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name Fields */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="text-sm font-medium mb-2 block">
            Prénom *
          </label>
          <input
            id="firstName"
            type="text"
            placeholder="Jean"
            className={`w-full px-4 py-3 rounded-lg border bg-background ${
              errors.firstName ? 'border-red-500' : 'border-input'
            }`}
            {...register('firstName')}
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="lastName" className="text-sm font-medium mb-2 block">
            Nom *
          </label>
          <input
            id="lastName"
            type="text"
            placeholder="Dupont"
            className={`w-full px-4 py-3 rounded-lg border bg-background ${
              errors.lastName ? 'border-red-500' : 'border-input'
            }`}
            {...register('lastName')}
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Contact Fields */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium mb-2 block">
            Email *
          </label>
          <input
            id="email"
            type="email"
            placeholder="jean@email.com"
            className={`w-full px-4 py-3 rounded-lg border bg-background ${
              errors.email ? 'border-red-500' : 'border-input'
            }`}
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium mb-2 block">
            Téléphone
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+33 6 12 34 56 78"
            className="w-full px-4 py-3 rounded-lg border border-input bg-background"
            {...register('phone')}
          />
        </div>
      </div>

      {/* LinkedIn */}
      <div>
        <label htmlFor="linkedinUrl" className="text-sm font-medium mb-2 block">
          Profil LinkedIn
        </label>
        <input
          id="linkedinUrl"
          type="url"
          placeholder="https://linkedin.com/in/votre-profil"
          className="w-full px-4 py-3 rounded-lg border border-input bg-background"
          {...register('linkedinUrl')}
        />
      </div>

      {/* CV Upload */}
      <div>
        <label className="text-sm font-medium mb-2 block">CV *</label>
        {cvFile ? (
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-[#2DB5B5]/10">
            <div className="flex-1 truncate">
              <div className="font-medium">{cvFile.name}</div>
              <div className="text-sm text-muted-foreground">
                {(cvFile.size / 1024 / 1024).toFixed(2)} Mo
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCvFile(null)}
              className="p-2 rounded-lg hover:bg-background transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed hover:border-[#2DB5B5] cursor-pointer transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Cliquez pour télécharger votre CV
            </span>
            <span className="text-xs text-muted-foreground">
              PDF, DOC, DOCX (max 10 Mo)
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Cover Letter */}
      <div>
        <label htmlFor="coverLetter" className="text-sm font-medium mb-2 block">
          Lettre de motivation
        </label>
        <textarea
          id="coverLetter"
          rows={5}
          placeholder="Présentez-vous et expliquez votre motivation..."
          className="w-full px-4 py-3 rounded-lg border border-input bg-background resize-none"
          {...register('coverLetter')}
        />
      </div>

      {/* GDPR Consent */}
      <div className="flex items-start gap-3">
        <input
          id="gdprConsent"
          type="checkbox"
          className="mt-1"
          {...register('gdprConsent')}
        />
        <label htmlFor="gdprConsent" className="text-sm text-muted-foreground">
          J'accepte que mes données soient traitées conformément à la{' '}
          <a href="/privacy" className="text-[#2DB5B5] hover:underline">
            politique de confidentialité
          </a>{' '}
          d'EBMC GROUP. *
        </label>
      </div>
      {errors.gdprConsent && (
        <p className="text-xs text-red-500">{errors.gdprConsent.message}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !cvFile}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-[#2DB5B5] text-white font-medium hover:bg-[#249292] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          'Envoyer ma candidature'
        )}
      </button>
    </form>
  )
}
