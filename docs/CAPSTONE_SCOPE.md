Capstone Scope – Fitness Tracker (GCP Re-Architecture)
Objective
Transform the existing Fitness Tracker into a cloud-native deployment on Google Cloud that demonstrates:

Infrastructure as Code
Secure cloud architecture
Scalable app deployment
Operations/monitoring
Cost-awareness and optimization
Baseline (Pre-Capstone)
This capstone builds on an existing team project:

Node.js + Express + EJS application
Session-based authentication
Workout/profile/progress CRUD workflows
MySQL-backed data model
Existing deployment on Render + AWS RDS
Capstone-Added Scope (Solo Work)
MVP (Must Have)
Infrastructure as Code (Terraform)

Provision core GCP resources using Terraform:
Cloud Run service
Artifact Registry
Firestore (native mode)
Service account + IAM bindings
Required API enablement
Application Deployment on Cloud Run

Containerize app and deploy via Cloud Run
Configure environment variables and runtime settings
Validate app availability and core route functionality
Data Layer Migration (Initial)

Add Firestore-backed data access for selected CRUD flows
Keep legacy MySQL path documented as baseline
Document migration approach and tradeoffs
Security Controls

Store sensitive values in Secret Manager
Apply least-privilege IAM roles for runtime/service accounts
Ensure no hardcoded secrets in repository
Operations & Reliability

Enable Cloud Logging and Monitoring
Create at least one dashboard and one alert policy
Add basic troubleshooting/runbook notes
Cost Optimization

Configure low-cost defaults (scale-to-zero where applicable)
Produce cost estimate and monthly projection
Add budget alert threshold(s)
Success Criteria
Capstone is successful when:

Terraform can provision core infrastructure from scratch
App is running on Cloud Run with working key flows
Security, monitoring, and cost controls are demonstrably configured
Documentation and demo clearly distinguish baseline vs new capstone work
Evidence to Collect
Git commits and pull requests in capstone branch
Terraform plans/applies and screenshots
Cloud Run deployment URL and test outputs
Monitoring dashboard and alert screenshots
Cost report and budget alert evidence
Final video walkthrough and portfolio write-up
