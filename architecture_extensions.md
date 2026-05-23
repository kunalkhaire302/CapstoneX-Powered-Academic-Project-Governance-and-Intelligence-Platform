# Architecture Extensions: Monitoring, Analytics, & Compliance

This document outlines the scaffolding and integration strategy for third-party services tracked in the CapstoneX backlog. These services require live API keys, external cloud accounts, or specialized infrastructure, but their foundation has been theoretically paved.

---

## 1. Observability: Grafana & Prometheus
To gain insights into API performance, query times, and error rates, we deploy Prometheus and Grafana.

### Setup Strategy
1. **Prometheus Export**: 
   Install `express-prometheus-bundle` in the backend. 
   ```bash
   npm install express-prometheus-bundle prom-client
   ```
   Add it to `backend/src/app.js`:
   ```javascript
   const promBundle = require("express-prometheus-bundle");
   app.use(promBundle({ includeMethod: true, includePath: true }));
   ```
2. **Docker Compose**:
   Create a `docker-compose.monitoring.yml` to spin up Grafana.
   ```yaml
   version: '3.8'
   services:
     prometheus:
       image: prom/prometheus:latest
       volumes:
         - ./prometheus.yml:/etc/prometheus/prometheus.yml
       ports:
         - "9090:9090"
     grafana:
       image: grafana/grafana:latest
       ports:
         - "3001:3000"
   ```

---

## 2. Analytics & Crashlytics: Firebase
Firebase provides robust frontend event tracking and crash reporting. 

### Integration Strategy (Next.js)
1. **Install SDK**: `npm install firebase` in `/frontend`.
2. **Initialization**: Create `frontend/lib/firebase.ts`.
   ```typescript
   import { initializeApp } from 'firebase/app';
   import { getAnalytics, isSupported } from 'firebase/analytics';
   
   const firebaseConfig = {
     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
     // ...other config
   };
   
   const app = initializeApp(firebaseConfig);
   export const analytics = typeof window !== 'undefined' ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;
   ```
3. **Usage**: Import `analytics` in critical user flows (e.g., Logbook submission) to log custom events `logEvent(analytics, 'logbook_submitted')`.

---

## 3. Global Accessibility (WCAG 2.1 AA) Audit Strategy
To ensure the academic platform is accessible to all students and staff.

### Automation & Tooling
1. **Linting**: Install `eslint-plugin-jsx-a11y` in the frontend to catch contrast, aria-label, and semantic HTML errors during the CI/CD pipeline.
2. **Lighthouse**: Run Google Chrome Lighthouse CI (`@lhci/cli`) on the Next.js production build to generate accessibility scores automatically on every Pull Request.
3. **Manual Focus Testing**: The UI components currently use `focus:ring` Tailwind classes to ensure keyboard navigation is visible.

---

## 4. Internationalization (i18n)
To support diverse university campuses, CapstoneX can be localized.

### Implementation with `next-intl`
1. Next.js App Router natively supports i18n routing.
2. Store translations in `messages/en.json`, `messages/hi.json`, etc.
3. Wrap the root layout in `<NextIntlClientProvider>` and use the `useTranslations()` hook inside components to render language-specific text dynamically.
