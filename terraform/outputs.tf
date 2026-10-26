output "cloud_run_service_account_email" {
  value = google_service_account.cloud_run_sa.email
}

output "artifact_registry_repo" {
  value = google_artifact_registry_repository.docker_repo.id
}
