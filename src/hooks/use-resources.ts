"use client";

import { useCallback, useEffect, useState } from "react";
import type { ResourceCategory, ResourceItem, ResourceType } from "@/types";
import { defaultResourceCategories, defaultResources } from "@/data/resources-seed";
import { saveFileBlob, deleteFileBlob } from "@/lib/file-storage";
import { logUserActivity } from "@/hooks/use-activity";
import { useAuth } from "@/context/auth-context";
import {
  syncResourcesToCloud,
  fetchResourcesFromCloud,
  uploadResourceFileToStorage,
  deleteResourceFromCloud,
  recordPendingDeletion,
  removePendingDeletion,
  flushPendingDeletionsToCloud,
} from "@/lib/supabase/sync-engine";

const STORAGE_KEY = "backend-interview-resources";

interface ResourcesStoreData {
  categories: ResourceCategory[];
  items: ResourceItem[];
  _version?: number;
}

function readStore(): ResourcesStoreData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { categories: defaultResourceCategories, items: defaultResources, _version: 1 };
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.categories) && Array.isArray(parsed.items)) {
      return parsed;
    }
    return { categories: defaultResourceCategories, items: defaultResources, _version: 1 };
  } catch {
    return { categories: defaultResourceCategories, items: defaultResources, _version: 1 };
  }
}

function persistStore(data: ResourcesStoreData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save resources to localStorage:", e);
  }
}

function detectResourceType(file: File): ResourceType {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  if (mime.includes("pdf") || name.endsWith(".pdf")) return "PDF";
  if (mime.includes("image") || name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".svg") || name.endsWith(".webp")) return "Image";
  if (mime.includes("word") || name.endsWith(".doc") || name.endsWith(".docx") || name.endsWith(".txt") || name.endsWith(".md")) return "Document";
  if (mime.includes("sheet") || mime.includes("excel") || name.endsWith(".xls") || name.endsWith(".xlsx") || name.endsWith(".csv")) return "Spreadsheet";
  if (mime.includes("presentation") || mime.includes("powerpoint") || name.endsWith(".ppt") || name.endsWith(".pptx")) return "Presentation";
  return "Other";
}

export function useResources() {
  const { user } = useAuth();
  const [data, setData] = useState<ResourcesStoreData>({ categories: [], items: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const initial = readStore();
    setData(initial);
    setLoaded(true);

    if (user?.id) {
      fetchResourcesFromCloud(user.id).then((cloud) => {
        if (cloud && (cloud.categories.length > 0 || cloud.items.length > 0)) {
          const merged: ResourcesStoreData = {
            categories: cloud.categories.length > 0 ? cloud.categories : initial.categories,
            items: cloud.items.length > 0 ? cloud.items : initial.items,
            _version: 1,
          };
          setData(merged);
          persistStore(merged);
        }
      });
    }
  }, [user?.id]);

  const addCategory = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const id = `${slug}-${Date.now()}`;
    setData((curr) => {
      const next = {
        ...curr,
        categories: [...curr.categories, { id, name: trimmed, order: curr.categories.length + 1 }],
      };
      persistStore(next);
      if (user?.id) syncResourcesToCloud(user.id, next.categories, next.items);
      return next;
    });
  }, [user?.id]);

  const renameCategory = useCallback((id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setData((curr) => {
      const next = {
        ...curr,
        categories: curr.categories.map((c) => (c.id === id ? { ...c, name: trimmed } : c)),
      };
      persistStore(next);
      if (user?.id) syncResourcesToCloud(user.id, next.categories, next.items);
      return next;
    });
  }, [user?.id]);

  const deleteCategory = useCallback((id: string) => {
    setData((curr) => {
      const next = {
        ...curr,
        categories: curr.categories.filter((c) => c.id !== id),
        items: curr.items.map((item) => (item.categoryId === id ? { ...item, categoryId: "other" } : item)),
      };
      persistStore(next);
      if (user?.id) syncResourcesToCloud(user.id, next.categories, next.items);
      return next;
    });
  }, [user?.id]);

  const addUrlResource = useCallback((resource: Omit<ResourceItem, "id" | "createdAt" | "updatedAt">) => {
    const id = `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newItem: ResourceItem = {
      ...resource,
      id,
      createdAt: now,
      updatedAt: now,
    };
    setData((curr) => {
      const next = {
        ...curr,
        items: [newItem, ...curr.items],
      };
      persistStore(next);
      if (user?.id) syncResourcesToCloud(user.id, next.categories, next.items);
      logUserActivity({
        type: "resource",
        title: newItem.title,
        subtitle: `Saved Link resource`,
        href: "/resources",
      });
      return next;
    });
    return newItem;
  }, [user?.id]);

  const addFileResource = useCallback(
    async (
      file: File,
      metadata: Omit<ResourceItem, "id" | "createdAt" | "updatedAt" | "storedFileId" | "fileName" | "mimeType" | "fileSize" | "type"> & { type?: ResourceType }
    ) => {
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const resourceId = `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      await saveFileBlob(fileId, file, file.name, file.type);

      const detectedType = metadata.type ?? detectResourceType(file);

      const newItem: ResourceItem = {
        ...metadata,
        id: resourceId,
        type: detectedType,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        storedFileId: fileId,
        createdAt: now,
        updatedAt: now,
      };

      if (user?.id) {
        uploadResourceFileToStorage(user.id, resourceId, file, file.name);
      }

      setData((curr) => {
        const next = {
          ...curr,
          items: [newItem, ...curr.items],
        };
        persistStore(next);
        if (user?.id) syncResourcesToCloud(user.id, next.categories, next.items);
        logUserActivity({
          type: "resource",
          title: newItem.title,
          subtitle: `Uploaded ${detectedType} file`,
          href: "/resources",
        });
        return next;
      });

      return newItem;
    },
    [user?.id]
  );

  const updateResource = useCallback((id: string, updates: Partial<ResourceItem>) => {
    const now = new Date().toISOString();
    setData((curr) => {
      const next = {
        ...curr,
        items: curr.items.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: now } : item)),
      };
      persistStore(next);
      if (user?.id) syncResourcesToCloud(user.id, next.categories, next.items);
      return next;
    });
  }, [user?.id]);

  const deleteResource = useCallback(async (id: string) => {
    let fileToDelete: string | undefined;
    recordPendingDeletion("resource", id);

    setData((curr) => {
      const target = curr.items.find((item) => item.id === id);
      if (target?.storedFileId) {
        fileToDelete = target.storedFileId;
      }
      const next = {
        ...curr,
        items: curr.items.filter((item) => item.id !== id),
      };
      persistStore(next);
      if (user?.id) {
        deleteResourceFromCloud(user.id, id).then((success) => {
          if (success) removePendingDeletion("resource", id);
        });
      }
      return next;
    });

    if (fileToDelete) {
      await deleteFileBlob(fileToDelete);
    }
  }, [user?.id]);

  const toggleFavorite = useCallback((id: string) => {
    const now = new Date().toISOString();
    setData((curr) => {
      const next = {
        ...curr,
        items: curr.items.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite, updatedAt: now } : item)),
      };
      persistStore(next);
      if (user?.id) syncResourcesToCloud(user.id, next.categories, next.items);
      return next;
    });
  }, [user?.id]);

  const resetToDefault = useCallback(() => {
    const resetData = { categories: defaultResourceCategories, items: defaultResources, _version: 1 };
    setData(resetData);
    persistStore(resetData);
  }, []);

  return {
    loaded,
    categories: data.categories,
    resources: data.items,
    addCategory,
    renameCategory,
    deleteCategory,
    addUrlResource,
    addFileResource,
    updateResource,
    deleteResource,
    toggleFavorite,
    resetToDefault,
  };
}
