# EBMC GROUP - Instructions Claude Code

## Projet
Site vitrine EBMC GROUP avec Payload CMS 3.0, Next.js 15, React 19, MongoDB.

## Stack technique
- Next.js 15 (App Router)
- React 19
- Payload CMS 3.0
- MongoDB 7
- TypeScript 5.6
- Tailwind CSS 3.4
- Framer Motion 11

## Commandes importantes
```bash
# Dev local
npm run dev

# Build
npm run build

# Lint (avec fix auto)
npm run lint:fix

# Type check
npm run typecheck

# Déployer (push sur main déclenche GitHub Actions)
git add . && git commit -m "message" && git push
```

## Règles de code

### TypeScript
- Toujours utiliser `.toString()` pour les IDs Payload (peuvent être string | number)
- Utiliser `as Type` pour caster les résultats Payload
- Éviter `any`, utiliser `Record<string, unknown>` ou types précis

### React / Next.js
- Utiliser `<Link>` de next/link pour les liens internes (jamais `<a href="/...">`)
- Utiliser `&apos;` au lieu de `'` dans le JSX
- Imports inutilisés = erreur, les supprimer

### Payload CMS
- Les blocks sont dans `src/blocks/`
- Les collections sont dans `src/collections/`
- Les types générés sont dans `src/payload-types.ts`

## Structure des dossiers
```
src/
├── app/
│   ├── (frontend)/     # Pages publiques
│   ├── (payload)/      # Admin Payload
│   └── api/            # Routes API
├── blocks/             # Définitions blocks Payload
├── collections/        # Collections Payload
├── components/
│   ├── blocks/         # Renderers de blocks
│   ├── careers/        # Composants carrières
│   ├── layout/         # Header, Footer
│   └── ui/             # Composants UI réutilisables
├── globals/            # Globals Payload
└── lib/                # Utilitaires
```

## Workflow de correction d'erreurs

1. Lancer `npm run lint:fix` pour corriger automatiquement
2. Lancer `npm run typecheck` pour voir les erreurs TypeScript
3. Corriger les erreurs manuellement
4. Commit et push pour déployer

## Port de développement
Le projet tourne sur le port **8889** (pas 3000)

## Déploiement
- Push sur `main` → Déploie automatiquement sur le NAS via GitHub Actions
- Le NAS est à l'IP configurée dans les secrets GitHub