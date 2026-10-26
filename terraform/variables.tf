variable "project_id" {
  type        = string
  description = "GCP project ID"
}

variable "region" {
  type        = string
  description = "Primary GCP region"
  default     = "us-central1"
}

variable "artifact_repo_name" {
  type    = string
  default = "fitness-tracker-repo"
}
