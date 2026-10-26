) High-Level Architecture
The capstone architecture re-platforms the existing Fitness Tracker application onto Google Cloud using a cost-conscious, secure, and operationally observable design.

Core Flow
User accesses the web app/API over HTTPS.
Requests are handled by Cloud Run (containerized Node.js/Express service).
Application reads/writes fitness data in Firestore.
Sensitive configuration is retrieved from Secret Manager.
Runtime logs/metrics are sent to Cloud Logging/Monitoring for observability and alerts.
2) Component Diagram (Text)
[ User Browser / Client ]
           |
           | HTTPS
           v
[ Cloud Run Service: fitness-tracker-api ]
           |
           | (Application CRUD operations)
           v
[ Firestore (Native Mode) ]

[ Cloud Run Service ] ----> [ Secret Manager ]
        |                         ^
        | reads runtime secrets   |
        +-------------------------+

[ Cloud Run / GCP Services ] ---> [ Cloud Logging ]
[ Cloud Run / GCP Services ] ---> [ Cloud Monitoring + Alerting ]
3) Component Responsibilities
A) User / Client
Sends authenticated and unauthenticated requests to app endpoints.
Interacts with workout logging, profile updates, progress tracking, and exercise browsing flows.
B) Cloud Run API
Hosts containerized backend service.
Handles routing, session/auth logic, input validation, and business rules.
Exposes CRUD endpoints and server-rendered views/API responses.
Scales automatically based on request load.
C) Firestore
Stores capstone-managed application data for selected/new CRUD workflows.
Supports scalable document-based access for user-centric data.
Used in initial migration path alongside documented legacy baseline.
D) Secret Manager
Stores sensitive values (session secret, API keys, future credentials).
Prevents hardcoded secrets in source code and environment files committed to Git.
Accessed by Cloud Run via IAM-authorized service account.
E) Cloud Logging & Monitoring
Centralized logs for request tracing and debugging.
Metrics and alert policies for uptime/error-rate monitoring.
Supports operational reporting and troubleshooting evidence for capstone.
4) Security Architecture Notes
Least-Privilege IAM
Use a dedicated Cloud Run runtime service account.
Grant only minimum required roles (for Firestore access, Secret Manager access, logging/monitoring write as needed).
Avoid broad roles (e.g., Owner/Editor) at service level.
No Secrets in Repository
Never commit secrets to GitHub (.env, keys, tokens, DB passwords).
Keep local .env out of version control.
Use Secret Manager for runtime secret injection/access.
HTTPS-Only Endpoint
Cloud Run endpoint is accessed over HTTPS.
No plaintext HTTP exposure for production traffic.
Use secure cookies/session settings appropriate for HTTPS environments.
5) Reliability & Operations Notes
Cloud Run provides managed runtime, health-aware scaling, and reduced ops overhead.
Observability baseline includes:
Request/error logs
Latency metrics
Alert policy (e.g., elevated 5xx error rate or failed request threshold)
Add runbook steps in docs/SETUP_GUIDE.md for common failures and recovery actions.
6) Cost Optimization Notes
Start with Smallest Reasonable Cloud Run Settings
Use low CPU/memory baseline suitable for early-stage traffic.
Tune settings only after observing real usage patterns.
Scale-to-Zero
Configure minimum instances to 0 initially to reduce idle cost.
Accept cold starts during low traffic as cost/performance tradeoff.
Budget Alerts
Configure monthly budget and alert thresholds (e.g., 50%, 80%, 100%).
Track service-level spend trends and optimization opportunities.
7) Future Enhancements (Post-MVP)
Add Cloud Functions for asynchronous processing (e.g., event-based notifications).
Add BigQuery pipeline for analytics and reporting.
Add frontend static hosting via Cloud Storage + CDN.
Evaluate advanced security hardening (WAF/Cloud Armor) based on risk profile.
8) Evidence for Capstone Submission
To demonstrate architecture implementation:

Terraform code and plan/apply outputs
Cloud Run deployment proof (URL + test results)
Firestore document model examples
Secret Manager configuration screenshots
Monitoring dashboard + alert policy screenshots
Budget alert configuration and cost summary
