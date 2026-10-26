"use server";

import { requireAdmin } from "@/lib/auth";
import {
  deleteContent,
  saveContent,
  type FormState,
} from "@/lib/content-admin";
import {
  articleCollection,
  serviceCollection,
  videoCollection,
} from "@/lib/content-collections";

export type { FormState };

export async function createService(_state: FormState, formData: FormData) {
  await requireAdmin();
  return saveContent(serviceCollection, null, formData);
}

export async function updateService(id: string, _state: FormState, formData: FormData) {
  await requireAdmin();
  return saveContent(serviceCollection, id, formData);
}

export async function deleteService(id: string): Promise<FormState> {
  await requireAdmin();
  return deleteContent(serviceCollection, id);
}

export async function createArticle(_state: FormState, formData: FormData) {
  await requireAdmin();
  return saveContent(articleCollection, null, formData);
}

export async function updateArticle(id: string, _state: FormState, formData: FormData) {
  await requireAdmin();
  return saveContent(articleCollection, id, formData);
}

export async function deleteArticle(id: string): Promise<FormState> {
  await requireAdmin();
  return deleteContent(articleCollection, id);
}

export async function createVideo(_state: FormState, formData: FormData) {
  await requireAdmin();
  return saveContent(videoCollection, null, formData);
}

export async function deleteVideo(id: string): Promise<FormState> {
  await requireAdmin();
  return deleteContent(videoCollection, id);
}
