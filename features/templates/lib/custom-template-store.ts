"use client";

import type { Template, TemplateCategory } from "../data/templates";

const STORAGE_KEY = "nightos.custom-templates";

export interface CustomTemplate extends Template {
  /** ISO timestamp of when the cast last edited this template. */
  updatedAt: string;
  /** Marker so we can distinguish saved-by-cast vs default templates. */
  isCustom: true;
}

function key(castId: string): string {
  return `${STORAGE_KEY}.${castId}`;
}

export function loadCustomTemplates(castId: string): CustomTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(castId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CustomTemplate[];
  } catch {
    return [];
  }
}

export function saveCustomTemplate(
  castId: string,
  template: Omit<CustomTemplate, "updatedAt" | "isCustom">,
): CustomTemplate {
  const existing = loadCustomTemplates(castId);
  const idx = existing.findIndex((t) => t.id === template.id);
  const next: CustomTemplate = {
    ...template,
    updatedAt: new Date().toISOString(),
    isCustom: true,
  };
  if (idx >= 0) {
    existing[idx] = next;
  } else {
    existing.push(next);
  }
  window.localStorage.setItem(key(castId), JSON.stringify(existing));
  return next;
}

export function deleteCustomTemplate(castId: string, id: string) {
  const existing = loadCustomTemplates(castId);
  const filtered = existing.filter((t) => t.id !== id);
  window.localStorage.setItem(key(castId), JSON.stringify(filtered));
}

export function newCustomId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// ═══════════════ Default template overrides ═══════════════
// Casts can edit the built-in (定型) templates. We keep the originals in the
// code and store per-cast edits separately, keyed by the default template id,
// so edits survive and the original can always be restored.

const OVERRIDE_KEY = "nightos.template-overrides";

export interface TemplateOverride {
  label: string;
  body: string;
  description: string;
  /** ISO timestamp of when the cast last edited this template. */
  updatedAt: string;
}

function overrideKey(castId: string): string {
  return `${OVERRIDE_KEY}.${castId}`;
}

export function loadTemplateOverrides(
  castId: string,
): Record<string, TemplateOverride> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(overrideKey(castId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as Record<string, TemplateOverride>;
  } catch {
    return {};
  }
}

export function saveTemplateOverride(
  castId: string,
  templateId: string,
  override: Omit<TemplateOverride, "updatedAt">,
): void {
  if (typeof window === "undefined") return;
  const all = loadTemplateOverrides(castId);
  all[templateId] = { ...override, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(overrideKey(castId), JSON.stringify(all));
}

export function resetTemplateOverride(castId: string, templateId: string): void {
  if (typeof window === "undefined") return;
  const all = loadTemplateOverrides(castId);
  if (!(templateId in all)) return;
  delete all[templateId];
  window.localStorage.setItem(overrideKey(castId), JSON.stringify(all));
}

/** Returns a template with any saved cast edit applied on top. */
export function applyOverride(
  template: Template,
  overrides: Record<string, TemplateOverride>,
): Template {
  const o = overrides[template.id];
  if (!o) return template;
  return {
    ...template,
    label: o.label,
    body: o.body,
    description: o.description,
  };
}

export function isCustomTemplate(t: Template): t is CustomTemplate {
  return (t as Partial<CustomTemplate>).isCustom === true;
}

export type { Template, TemplateCategory };
