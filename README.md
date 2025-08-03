
```
mvx-platform
├─ ANALYTICS_ARCHITECTURE.md
├─ ANALYTICS_IMPLEMENTATION.md
├─ app
│  ├─ actions.ts
│  ├─ api
│  │  ├─ admin
│  │  │  └─ sync-domains
│  │  │     └─ route.ts
│  │  ├─ check-subdomain
│  │  │  └─ route.ts
│  │  ├─ communications
│  │  │  └─ send
│  │  │     └─ route.ts
│  │  ├─ debug
│  │  │  └─ organizations
│  │  │     └─ route.ts
│  │  ├─ domains
│  │  │  ├─ add
│  │  │  │  └─ route.ts
│  │  │  └─ verify
│  │  │     └─ route.ts
│  │  ├─ import
│  │  │  └─ players
│  │  │     └─ route.ts
│  │  ├─ invitations
│  │  │  └─ use
│  │  │     └─ route.ts
│  │  ├─ onboarding
│  │  │  └─ complete
│  │  │     └─ route.ts
│  │  ├─ sign-image
│  │  │  └─ route.ts
│  │  ├─ stripe
│  │  │  ├─ create-checkout
│  │  │  │  └─ route.ts
│  │  │  └─ webhook
│  │  │     └─ route.ts
│  │  └─ test-email
│  │     └─ route.ts
│  ├─ auth
│  │  ├─ actions.ts
│  │  ├─ callback
│  │  │  ├─ client-handler.tsx
│  │  │  └─ page.tsx
│  │  └─ setup-password
│  │     └─ page.tsx
│  ├─ components
│  │  ├─ auth
│  │  │  ├─ login-form.tsx
│  │  │  └─ signup-form.tsx
│  │  ├─ CloudinaryUpload.tsx
│  │  ├─ Container.tsx
│  │  ├─ ImageCarousel.tsx
│  │  ├─ modal.tsx
│  │  ├─ Navigation.tsx
│  │  ├─ onboarding
│  │  │  ├─ OnboardingWizard.tsx
│  │  │  └─ steps
│  │  │     ├─ OrganizationSetupStep.tsx
│  │  │     └─ VisualCustomizationStep.tsx
│  │  ├─ PlayerCard.tsx
│  │  ├─ PushNotificationManager.tsx
│  │  ├─ RichTextEditor.tsx
│  │  ├─ TeamCard.tsx
│  │  ├─ theme-style.tsx
│  │  ├─ ThemeListener.tsx
│  │  └─ toast-provider.tsx
│  ├─ dashboard
│  │  ├─ admin
│  │  │  ├─ README.md
│  │  │  ├─ teams
│  │  │  │  ├─ actions.ts
│  │  │  │  ├─ components
│  │  │  │  │  ├─ team-form.tsx
│  │  │  │  │  ├─ team-list.tsx
│  │  │  │  │  └─ team-manager.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ README.md
│  │  │  └─ users
│  │  │     ├─ actions.ts
│  │  │     ├─ components
│  │  │     │  ├─ edit-user-form.tsx
│  │  │     │  ├─ invite-user-form.tsx
│  │  │     │  └─ user-management-client.tsx
│  │  │     ├─ page.tsx
│  │  │     └─ README.md
│  │  ├─ analytics
│  │  │  ├─ components
│  │  │  │  └─ analytics-dashboard.tsx
│  │  │  └─ page.tsx
│  │  ├─ blog
│  │  │  ├─ components
│  │  │  │  ├─ BlogPostForm.tsx
│  │  │  │  └─ DeleteBlogPostButton.tsx
│  │  │  ├─ new
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ [id]
│  │  │     ├─ edit
│  │  │     │  └─ page.tsx
│  │  │     └─ preview
│  │  │        └─ page.tsx
│  │  ├─ communications
│  │  │  ├─ components
│  │  │  │  ├─ communication-manager.tsx
│  │  │  │  ├─ delivery-analytics.tsx
│  │  │  │  ├─ message-composer.tsx
│  │  │  │  ├─ message-history.tsx
│  │  │  │  └─ message-templates.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ README.md
│  │  ├─ components
│  │  │  ├─ logout-button.tsx
│  │  │  ├─ organization-switcher.tsx
│  │  │  └─ sidebar-nav.tsx
│  │  ├─ games
│  │  │  ├─ components
│  │  │  │  └─ game-manager.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ README.md
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ players
│  │  │  ├─ actions.ts
│  │  │  ├─ components
│  │  │  │  ├─ image-uploader.tsx
│  │  │  │  ├─ player-form.tsx
│  │  │  │  ├─ player-importer.tsx
│  │  │  │  ├─ player-list.tsx
│  │  │  │  └─ player-manager.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ README.md
│  │  ├─ README.md
│  │  └─ site-customizer
│  │     ├─ actions.ts
│  │     ├─ components
│  │     │  ├─ customizer-form.tsx
│  │     │  ├─ draggable-links.tsx
│  │     │  ├─ link-form.tsx
│  │     │  ├─ links-manager.tsx
│  │     │  └─ mini-preview.tsx
│  │     ├─ page.tsx
│  │     └─ README.md
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ invite
│  │  └─ [code]
│  │     └─ page.tsx
│  ├─ layout.tsx
│  ├─ login
│  │  └─ page.tsx
│  ├─ manifest.ts
│  ├─ marketing
│  │  ├─ about
│  │  │  └─ page.tsx
│  │  ├─ components
│  │  │  └─ MarketingHeader.tsx
│  │  ├─ contact
│  │  │  └─ page.tsx
│  │  ├─ demo
│  │  │  └─ page.tsx
│  │  ├─ features
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  └─ pricing
│  │     └─ page.tsx
│  ├─ onboarding
│  │  └─ page.tsx
│  ├─ signup
│  │  └─ page.tsx
│  ├─ sites
│  │  └─ [subdomain]
│  │     ├─ all-aboard
│  │     │  └─ page.tsx
│  │     ├─ alumni
│  │     │  └─ page.tsx
│  │     ├─ blog
│  │     │  ├─ page.tsx
│  │     │  └─ [slug]
│  │     │     └─ page.tsx
│  │     ├─ extended-team
│  │     │  └─ page.tsx
│  │     ├─ forms-and-links
│  │     │  └─ page.tsx
│  │     ├─ layout.tsx
│  │     ├─ live-scores
│  │     │  ├─ components
│  │     │  │  └─ live-scoreboard.tsx
│  │     │  └─ page.tsx
│  │     ├─ on-the-field
│  │     │  ├─ page.tsx
│  │     │  └─ [slug]
│  │     │     └─ page.tsx
│  │     ├─ page.tsx
│  │     ├─ teams
│  │     │  ├─ page.tsx
│  │     │  └─ [teamId]
│  │     │     ├─ components
│  │     │     │  ├─ CoachCard.tsx
│  │     │     │  ├─ PlayerCard.tsx
│  │     │     │  ├─ ScheduleTable.tsx
│  │     │     │  ├─ TeamHeader.tsx
│  │     │     │  └─ TeamImage.tsx
│  │     │     └─ page.tsx
│  │     └─ xpress-social
│  │        └─ page.tsx
│  ├─ test-email
│  │  └─ page.tsx
│  └─ types
│     └─ onboarding.ts
├─ BLOG_FEATURE_README.md
├─ components
│  ├─ analytics-tracker.tsx
│  ├─ features
│  │  └─ index.ts
│  └─ ui
│     └─ index.ts
├─ context
│  └─ OrganizationProvider.tsx
├─ DEVELOPER_GUIDE.md
├─ eslint.config.mjs
├─ hooks
│  └─ use-session.tsx
├─ lib
│  ├─ actions
│  │  ├─ blog.ts
│  │  ├─ index.ts
│  │  ├─ players.ts
│  │  └─ session.ts
│  ├─ analytics
│  │  ├─ server.ts
│  │  └─ tracker.ts
│  ├─ config
│  │  ├─ app.ts
│  │  ├─ domains.ts
│  │  └─ index.ts
│  ├─ database.types.ts
│  ├─ schemas
│  │  ├─ coach.ts
│  │  ├─ index.ts
│  │  ├─ player.ts
│  │  ├─ schedule.ts
│  │  └─ team.ts
│  ├─ services
│  │  ├─ database.ts
│  │  ├─ error-handling.ts
│  │  ├─ index.ts
│  │  └─ validation.ts
│  ├─ supabase
│  │  ├─ admin.ts
│  │  ├─ client.ts
│  │  └─ server.ts
│  ├─ types
│  │  ├─ auth.ts
│  │  ├─ database.ts
│  │  ├─ extended.ts
│  │  └─ index.ts
│  ├─ types-new.ts
│  ├─ types.ts
│  └─ utils
│     ├─ images.ts
│     └─ theme.ts
├─ middleware.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ PRODUCTION_CHECKLIST.md
├─ public
│  ├─ assets
│  │  ├─ blog
│  │  │  ├─ back-to-school-bash.png
│  │  │  ├─ diamond-in-the-rough.png
│  │  │  ├─ fall-championship-champs.jpg
│  │  │  ├─ fall-frenzy-runner-ups.jpg
│  │  │  ├─ kickoff-klassic-champions.jpg
│  │  │  ├─ monster-mash-tournament.jpg
│  │  │  ├─ mothers-day-class-2024.jpg
│  │  │  ├─ pinktoberfest.png
│  │  │  ├─ roses-for-mommas.jpg
│  │  │  ├─ spring-fling-3.png
│  │  │  ├─ tnt-lady-luck.jpg
│  │  │  ├─ tnt-spring-sweep.jpg
│  │  │  ├─ usssa-17th-annual-fastpitch-fireworks.jpg
│  │  │  └─ usssa-mothers-day-classic.jpg
│  │  ├─ logos
│  │  │  ├─ homefield-logo.jpg
│  │  │  ├─ mvsf-logo.jpg
│  │  │  ├─ mvxLogo1.png
│  │  │  ├─ mvxLogo2.png
│  │  │  ├─ nomadx-logo.webp
│  │  │  └─ wccs-logo.png
│  │  ├─ schools
│  │  │  ├─ ohio-wesleyan-university-logo.png
│  │  │  ├─ st-ursula-academy-logo.png
│  │  │  └─ stebbins-hs-logo.png
│  │  ├─ stock
│  │  │  └─ stock-img-1.jpg
│  │  └─ teams
│  │     ├─ 2007
│  │     │  └─ players
│  │     │     ├─ allie-sheen.jpg
│  │     │     ├─ ella-dersham.jpg
│  │     │     ├─ leila-kim.jpg
│  │     │     ├─ meredith-pieratt.jpg
│  │     │     ├─ natalie-russell.jpg
│  │     │     └─ sam-wolfe.jpg
│  │     ├─ alumni
│  │     │  └─ olivia-basil.png
│  │     └─ defaultpfp.jpg
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ home-carousel
│  │  ├─ Xpress-org.jpg
│  │  ├─ Xpress-team-pic.jpg
│  │  └─ Xpress.jpg
│  ├─ icons
│  │  ├─ android-chrome-192x192.png
│  │  ├─ android-chrome-512x512.png
│  │  ├─ apple-touch-icon.png
│  │  ├─ favicon-16x16.png
│  │  ├─ favicon-32x32.png
│  │  └─ favicon.ico
│  ├─ next.svg
│  ├─ vercel.svg
│  ├─ videos
│  │  └─ MVX-HomePage.mp4
│  └─ window.svg
├─ README.md
├─ REFACTORING_GUIDE.md
├─ scripts
│  ├─ migrate-alumni-data.js
│  ├─ migrate-blog-data.js
│  └─ test-multi-tenancy.mjs
├─ supabase
│  ├─ .temp
│  │  ├─ cli-latest
│  │  ├─ gotrue-version
│  │  ├─ pooler-url
│  │  ├─ postgres-version
│  │  ├─ project-ref
│  │  ├─ rest-version
│  │  └─ storage-version
│  └─ schema.sql
├─ tailwind.config.ts
└─ tsconfig.json

```