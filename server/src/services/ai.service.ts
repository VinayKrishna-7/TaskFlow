export interface IGeneratedSubtask {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedHours: number;
}

export class AIService {
  static async generateTaskBreakdown(prompt: string): Promise<IGeneratedSubtask[]> {
    const apiKey = process.env.AI_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Break down the following goal or project into 5 to 7 concrete, actionable tasks. Return ONLY a valid JSON array of objects with keys: title (string), description (string), priority ('LOW'|'MEDIUM'|'HIGH'|'URGENT'), estimatedHours (number).\n\nGoal: ${prompt}`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const json: any = await response.json();
          const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const match = rawText.match(/\[[\s\S]*\]/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed.map((item: any) => ({
                title: String(item.title || 'Untitled Task'),
                description: String(item.description || ''),
                priority: (['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(item.priority) ? item.priority : 'MEDIUM') as any,
                estimatedHours: typeof item.estimatedHours === 'number' && item.estimatedHours > 0 ? item.estimatedHours : 4,
              }));
            }
          }
        }
      } catch (err) {
        console.warn('AI API call failed or timed out. Falling back to specialized domain engine.');
      }
    }

    const lower = prompt.toLowerCase();
    
    // 1. E-Commerce / Store / Shopping / Stripe
    if (lower.includes('e-commerce') || lower.includes('store') || lower.includes('shop') || lower.includes('cart') || lower.includes('checkout')) {
      return [
        { title: 'Project Setup & Monorepo Architecture', description: 'Initialize repository, configure Tailwind, setup Express API and MongoDB schema models', priority: 'HIGH', estimatedHours: 4 },
        { title: 'Database & Product Schema Design', description: 'Design models for Products, Categories, Orders, and Customers with indexes', priority: 'HIGH', estimatedHours: 5 },
        { title: 'Authentication & Customer Portal', description: 'JWT authentication, customer registration, session persistence, and user profile management', priority: 'MEDIUM', estimatedHours: 6 },
        { title: 'Product Catalog & Search Filter API', description: 'Endpoints for catalog listing, pagination, faceted categories, and keyword search', priority: 'HIGH', estimatedHours: 8 },
        { title: 'Shopping Cart State & Persistence', description: 'Client-side cart store with server synchronization and stock availability checks', priority: 'HIGH', estimatedHours: 6 },
        { title: 'Stripe Payment Gateway Integration', description: 'Implement Stripe Checkout workflow, payment intents, and order confirmation webhooks', priority: 'URGENT', estimatedHours: 8 },
        { title: 'Admin Order & Inventory Dashboard', description: 'Management panel to view incoming orders, update fulfillment status, and track inventory', priority: 'MEDIUM', estimatedHours: 7 },
        { title: 'End-to-End Testing & Deployment', description: 'Run automated integration tests, configure Docker containers, and deploy to cloud', priority: 'MEDIUM', estimatedHours: 5 },
      ];
    }

    // 2. Authentication / Security / 2FA / OAuth
    if (lower.includes('auth') || lower.includes('login') || lower.includes('2fa') || lower.includes('oauth') || lower.includes('security') || lower.includes('password')) {
      return [
        { title: 'Security Architecture & User Schema', description: 'Design User model, password hashing with BCrypt/Argon2, and salt configuration', priority: 'HIGH', estimatedHours: 4 },
        { title: 'JWT Access & Refresh Token Lifecycle', description: 'Implement secure cryptographic refresh token rotation and cookie/header transport', priority: 'URGENT', estimatedHours: 6 },
        { title: 'Registration, Email Verification & Password Reset', description: 'Build forgot password token generator, verification email triggers, and reset forms', priority: 'HIGH', estimatedHours: 6 },
        { title: 'Two-Factor Authentication (2FA / TOTP)', description: 'Implement QR code secret generation, authenticator verification, and backup recovery codes', priority: 'HIGH', estimatedHours: 7 },
        { title: 'Role-Based Access Control (RBAC) Middleware', description: 'Enforce granular route permissions and API guards for Admin, Manager, and Member roles', priority: 'MEDIUM', estimatedHours: 5 },
        { title: 'Frontend Auth State, Login UI & Route Guards', description: 'Responsive login/register forms with form validation, error states, and automatic redirect', priority: 'HIGH', estimatedHours: 6 },
        { title: 'Security Hardening & Rate Limiting', description: 'Configure Helmet headers, CORS policies, brute-force IP rate limiting, and audit logging', priority: 'MEDIUM', estimatedHours: 4 },
      ];
    }

    // 3. UI / UX / Frontend / Redesign / Landing Page
    if (lower.includes('redesign') || lower.includes('landing') || lower.includes('ui') || lower.includes('ux') || lower.includes('frontend') || lower.includes('website')) {
      return [
        { title: 'Design System Tokens & Color Palette', description: 'Establish typography scale, brand color tokens, dark/light surface variants, and component specs', priority: 'HIGH', estimatedHours: 5 },
        { title: 'Responsive Navigation & Sticky Header', description: 'Build desktop navbar, mobile hamburger drawer, search input, and user profile trigger', priority: 'MEDIUM', estimatedHours: 4 },
        { title: 'Hero Section with Interactive Visuals', description: 'Develop captivating hero banner with call-to-action buttons and interactive product preview', priority: 'HIGH', estimatedHours: 6 },
        { title: 'Feature Highlights & Product Showcase Grid', description: 'Create responsive Bento grid showcasing core product features, animations, and tooltips', priority: 'HIGH', estimatedHours: 7 },
        { title: 'Dark / Light Mode Contrast Polish', description: 'Audit all UI components in both themes to ensure zero color clash and WCAG AAA contrast', priority: 'MEDIUM', estimatedHours: 4 },
        { title: 'Performance Optimization & Lighthouse Audit', description: 'Optimize asset loading, reduce bundle size, implement lazy loading, and score 95+ on Lighthouse', priority: 'MEDIUM', estimatedHours: 5 },
      ];
    }

    // 4. Mobile App / iOS / Android / React Native / Flutter
    if (lower.includes('mobile') || lower.includes('ios') || lower.includes('android') || lower.includes('react native') || lower.includes('flutter')) {
      return [
        { title: 'Mobile Project Scaffolding & Navigation', description: 'Initialize cross-platform project, configure tab bars, stack navigation, and safe area insets', priority: 'HIGH', estimatedHours: 5 },
        { title: 'Authentication & Biometric Login', description: 'Implement FaceID/TouchID biometrics, secure storage keychain, and session persistence', priority: 'HIGH', estimatedHours: 6 },
        { title: 'Offline-First State Management & Cache', description: 'Configure local SQLite or MMKV storage to cache task data for seamless offline usage', priority: 'URGENT', estimatedHours: 8 },
        { title: 'Native Push Notifications Integration', description: 'Setup Firebase Cloud Messaging (FCM) and Apple APNS for real-time task notifications', priority: 'HIGH', estimatedHours: 7 },
        { title: 'Touch Gestures & Haptic Feedback Polish', description: 'Implement swipe-to-complete, pull-to-refresh, and fluid micro-animations', priority: 'MEDIUM', estimatedHours: 5 },
        { title: 'App Store & Play Store Packaging', description: 'Configure release signing keys, build standalone binaries, and prepare store metadata', priority: 'MEDIUM', estimatedHours: 6 },
      ];
    }

    // 5. DevOps / Docker / CI/CD / Cloud / Deployment
    if (lower.includes('docker') || lower.includes('ci/cd') || lower.includes('deploy') || lower.includes('cloud') || lower.includes('kubernetes') || lower.includes('pipeline')) {
      return [
        { title: 'Multi-Stage Dockerfile Containerization', description: 'Create lightweight multi-stage Dockerfiles for frontend (Nginx) and backend (Node alpine)', priority: 'HIGH', estimatedHours: 4 },
        { title: 'Docker Compose Local & Staging Config', description: 'Configure docker-compose with persistent volumes, network bridges, and health checks', priority: 'HIGH', estimatedHours: 4 },
        { title: 'GitHub Actions Automated CI Pipeline', description: 'Setup workflow for automated linting, type-checking, and unit/integration test runs on PR', priority: 'URGENT', estimatedHours: 6 },
        { title: 'Production Nginx Reverse Proxy & SSL', description: 'Configure SSL certificates, HTTP/2, gzip compression, and secure security headers', priority: 'HIGH', estimatedHours: 5 },
        { title: 'Database Backup & Disaster Recovery Script', description: 'Automate daily database snapshots with S3 archival and recovery verification', priority: 'MEDIUM', estimatedHours: 4 },
        { title: 'Cloud Infrastructure Provisioning & Metrics', description: 'Deploy containers to cloud provider with uptime monitoring, Prometheus metrics, and alerts', priority: 'MEDIUM', estimatedHours: 6 },
      ];
    }

    // 6. Dynamic Context-Aware Breakdown for any other prompt
    const goalTitle = prompt.length > 38 ? prompt.substring(0, 35) + '...' : prompt;
    return [
      { 
        title: `Requirement Analysis & Scoping: "${goalTitle}"`, 
        description: `Define project milestones, functional deliverables, technical prerequisites, and success criteria for ${goalTitle}.`, 
        priority: 'HIGH', 
        estimatedHours: 4 
      },
      { 
        title: `System Architecture & Data Schema Design`, 
        description: `Design relational data structures, API interface contracts, and validation rules to support ${goalTitle}.`, 
        priority: 'HIGH', 
        estimatedHours: 6 
      },
      { 
        title: `Core Feature Implementation & Business Logic`, 
        description: `Develop the primary backend controllers, services, and operational handlers for ${goalTitle}.`, 
        priority: 'URGENT', 
        estimatedHours: 10 
      },
      { 
        title: `User Interface & Interactive Workflow Integration`, 
        description: `Construct responsive client components, form controls, and state management hooks for the user flow.`, 
        priority: 'HIGH', 
        estimatedHours: 8 
      },
      { 
        title: `Validation, Error Handling & Security Audit`, 
        description: `Incorporate robust schema validation, defensive edge-case handling, and permission guards.`, 
        priority: 'MEDIUM', 
        estimatedHours: 5 
      },
      { 
        title: `End-to-End Quality Assurance & Deployment`, 
        description: `Execute comprehensive integration tests, verify cross-device layout, and deploy to production.`, 
        priority: 'MEDIUM', 
        estimatedHours: 6 
      },
    ];
  }
}