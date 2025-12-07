'use client'

import { motion } from 'framer-motion'
import {
  Shield,
  Brain,
  Server,
  Code,
  Users,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  CheckCircle
} from 'lucide-react'

const services = [
  {
    icon: Server,
    title: 'SAP & ERP',
    description: 'Expertise complète sur les solutions SAP S/4HANA, implémentation et optimisation de vos processus métier.'
  },
  {
    icon: Shield,
    title: 'Cybersécurité',
    description: 'Protection de vos systèmes et données avec des solutions de sécurité avancées et conformité RGPD.'
  },
  {
    icon: Brain,
    title: 'Intelligence Artificielle',
    description: 'Intégration de solutions IA pour automatiser et optimiser vos opérations business.'
  },
  {
    icon: Code,
    title: 'Développement',
    description: 'Création d&apos;applications sur mesure avec les technologies modernes (React, Node.js, Cloud).'
  }
]

const stats = [
  { value: '15+', label: 'Années d&apos;expérience' },
  { value: '200+', label: 'Projets réalisés' },
  { value: '50+', label: 'Experts certifiés' },
  { value: '98%', label: 'Clients satisfaits' }
]

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="font-bold text-xl text-gray-900">EBMC GROUP</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-gray-600 hover:text-gray-900 transition">Services</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition">À propos</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition">Contact</a>
            </nav>
            <a
              href="#contact"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-bg pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Votre partenaire en
              <br />
              <span className="gradient-text">transformation digitale</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              EBMC GROUP accompagne les entreprises dans leur évolution numérique
              avec des solutions SAP, Cybersécurité et Intelligence Artificielle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#services"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                Découvrir nos services <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#contact"
                className="border border-white/30 text-white px-8 py-3 rounded-lg hover:bg-white/10 transition"
              >
                Prendre rendez-vous
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: stat.label }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nos expertises
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des solutions technologiques adaptées à vos enjeux métier
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-100"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: service.description }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Pourquoi choisir EBMC GROUP ?
              </h2>
              <p className="text-gray-600 mb-6">
                Depuis plus de 15 ans, nous accompagnons les entreprises de toutes tailles
                dans leur transformation digitale. Notre équipe d&apos;experts certifiés
                vous garantit des solutions sur mesure et un accompagnement personnalisé.
              </p>
              <ul className="space-y-4">
                {[
                  'Expertise reconnue en SAP et technologies cloud',
                  'Équipe d&apos;experts certifiés et passionnés',
                  'Accompagnement personnalisé de A à Z',
                  'Solutions innovantes et durables'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: item }} />
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <Users className="w-12 h-12 text-blue-600" />
                <div>
                  <div className="text-3xl font-bold text-gray-900">50+</div>
                  <div className="text-gray-600">Experts à votre service</div>
                </div>
              </div>
              <p className="text-gray-600">
                Notre équipe pluridisciplinaire combine expertise technique et
                connaissance métier pour vous offrir les meilleures solutions.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Contactez-nous
            </h2>
            <p className="text-xl text-gray-600">
              Parlons de votre projet
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.a
              href="mailto:contact@ebmcgroup.eu"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition text-center"
            >
              <Mail className="w-10 h-10 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">contact@ebmcgroup.eu</p>
            </motion.a>
            <motion.a
              href="tel:+33123456789"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition text-center"
            >
              <Phone className="w-10 h-10 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Téléphone</h3>
              <p className="text-gray-600">+33 1 23 45 67 89</p>
            </motion.a>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-lg text-center"
            >
              <MapPin className="w-10 h-10 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Adresse</h3>
              <p className="text-gray-600">Paris, France</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="gradient-bg py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="font-bold text-xl text-white">EBMC GROUP</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} EBMC GROUP. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
