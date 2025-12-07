import Link from 'next/link'
import { 
  Linkedin, Twitter, Mail, Phone, MapPin, 
  ExternalLink, ChevronRight 
} from 'lucide-react'

const expertiseLinks = [
  { name: 'SAP', href: '/sap' },
  { name: 'ICT', href: '/ict' },
  { name: 'Cybersécurité', href: '/cybersecurity' },
  { name: 'IA Générative', href: '/ai' },
]

const companyLinks = [
  { name: 'Pourquoi EBMC', href: '/why-ebmc' },
  { name: 'Carrières', href: '/careers' },
  { name: 'Contact', href: '/contact' },
]

const legalLinks = [
  { name: 'Mentions légales', href: '/legal' },
  { name: 'Politique de confidentialité', href: '/privacy' },
  { name: 'Cookies', href: '/cookies' },
]

const offices = [
  { 
    name: 'Luxembourg', 
    role: 'Siège social', 
    address: 'Bascharage',
    flag: '🇱🇺',
  },
  { 
    name: 'Barcelone', 
    role: 'Innovation Hub', 
    address: 'Espagne',
    flag: '🇪🇸',
  },
]

export function Footer() {
  return (
    <footer className="relative border-t bg-card/50">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-30 -z-10" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2DB5B5] to-[#249292] flex items-center justify-center text-white font-bold text-lg">
                  E
                </div>
                <span className="font-bold text-xl">
                  EBMC <span className="text-[#2DB5B5]">GROUP</span>
                </span>
              </Link>
              <p className="text-sm text-muted-foreground mb-4">
                L'union européenne de l'expertise digitale. SAP Silver Partner depuis 2006.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-2">
                <a
                  href="https://linkedin.com/company/ebmcgroup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com/ebmcgroup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Expertises */}
            <div>
              <h3 className="font-semibold mb-4">Expertises</h3>
              <ul className="space-y-3">
                {expertiseLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-[#2DB5B5] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Entreprise */}
            <div>
              <h3 className="font-semibold mb-4">Entreprise</h3>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-[#2DB5B5] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">Légal</h3>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-[#2DB5B5] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:contact@ebmcgroup.eu"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#2DB5B5] transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    contact@ebmcgroup.eu
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+352000000000"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#2DB5B5] transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    +352 XXX XXX XXX
                  </a>
                </li>
                {offices.map((office) => (
                  <li key={office.name} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span>{office.flag}</span>
                        <span className="font-medium text-foreground">{office.name}</span>
                      </div>
                      <div className="text-xs">{office.role}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} EBMC GROUP. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Tous nos systèmes sont opérationnels
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
