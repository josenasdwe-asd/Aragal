"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Image as ImageIcon,
  Loader2,
  Search,
  X,
  AlertCircle,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ADMIN_TOKEN_STORAGE_KEY } from "@/lib/admin-token";

/**
 * ImagePicker
 * -----------
 * Reusable image URL field with:
 *  - Editable text Input bound to `value`
 *  - 48×48 preview thumbnail
 *  - "Explorar" button → dialog with grid of all available images
 *    (originals from /assets/images/ + optimized uploads from /uploads/)
 *  - "Subir" button → file picker that uploads to /api/admin/upload,
 *    which auto-optimizes (resize + WebP) and returns the URL
 *  - "Quitar imagen" button → clears the value
 */

type ImageItem = { name: string; url: string };

type ImagePickerProps = {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
};

export function ImagePicker({ value, onChange, placeholder }: ImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<ImageItem[] | null>(null);
  const [uploads, setUploads] = useState<ImageItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "uploads">("all");

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    url: string;
    reduction: string;
    originalSize: number;
    optimizedSize: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
      : null;
  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both original images and uploads in parallel
      const [imgsRes, upRes] = await Promise.all([
        fetch("/api/admin/images", { cache: "no-store", headers: authHeaders }),
        fetch("/api/admin/upload", { cache: "no-store", headers: authHeaders }),
      ]);
      const imgsJson = (await imgsRes.json()) as {
        ok?: boolean;
        data?: ImageItem[];
        error?: string;
      };
      const upJson = (await upRes.json()) as {
        ok?: boolean;
        data?: ImageItem[];
      };
      if (!imgsRes.ok || !imgsJson.ok) {
        setError(imgsJson.error ?? `HTTP ${imgsRes.status}`);
        setImages([]);
      } else {
        setImages(imgsJson.data ?? []);
      }
      setUploads(upJson.ok ? upJson.data ?? [] : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de red");
      setImages([]);
      setUploads([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (open && images === null && !loading) {
      loadImages();
    }
  }, [open]);

  // Auto-dismiss the green success banner after 4 seconds so it doesn't
  // linger on the screen once the user has seen it.
  useEffect(() => {
    if (!uploadResult) return;
    const t = setTimeout(() => setUploadResult(null), 4000);
    return () => clearTimeout(t);
  }, [uploadResult]);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      setUploadProgress(0);
      setUploadResult(null);
      setError(null);
      try {
        const fd = new FormData();
        fd.append("file", file);

        // Use XHR so we can report upload progress to the user via an
        // overlay on the thumbnail — fetch() doesn't expose progress.
        const json = await new Promise<{
          ok?: boolean;
          url?: string;
          optimized?: {
            reduction: string;
            originalSize: number;
            optimizedSize: number;
          };
          error?: string;
        }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/admin/upload");
          if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          };
          xhr.onload = () => {
            try {
              const parsed = JSON.parse(xhr.responseText) as {
                ok?: boolean;
                url?: string;
                optimized?: {
                  reduction: string;
                  originalSize: number;
                  optimizedSize: number;
                };
                error?: string;
              };
              if (xhr.status >= 200 && xhr.status < 300 && parsed.ok && parsed.url) {
                resolve(parsed);
              } else {
                reject(new Error(parsed.error ?? `HTTP ${xhr.status}`));
              }
            } catch {
              reject(new Error("Respuesta inválida del servidor"));
            }
          };
          xhr.onerror = () => reject(new Error("Error de red al subir"));
          xhr.send(fd);
        });

        // Set the uploaded image as the value
        onChange(json.url!);
        setUploadResult({
          url: json.url!,
          reduction: json.optimized?.reduction ?? "?",
          originalSize: json.optimized?.originalSize ?? 0,
          optimizedSize: json.optimized?.optimizedSize ?? 0,
        });
        // Refresh the uploads list
        if (uploads !== null) {
          setUploads([
            { name: json.url!.split("/").pop() ?? "upload", url: json.url! },
            ...uploads,
          ]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al subir");
      } finally {
        setUploading(false);
        setUploadProgress(null);
      }
    },
    [token, uploads, onChange]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleUpload(f);
    // reset so the same file can be re-selected
    e.target.value = "";
  };

  // Delete an uploaded file from the server. Only works for /uploads/ files.
  const handleDeleteUpload = useCallback(
    async (filename: string) => {
      if (!confirm(`¿Eliminar la imagen «${filename}»? Esta acción no se puede deshacer.`)) {
        return;
      }
      try {
        const res = await fetch(`/api/admin/upload/${encodeURIComponent(filename)}`, {
          method: "DELETE",
          headers: authHeaders,
        });
        const json = await res.json();
        if (!res.ok || !json.ok) {
          setError(json.error ?? `HTTP ${res.status}`);
          return;
        }
        // Remove from the uploads list
        setUploads((prev) => prev?.filter((u) => u.name !== filename) ?? null);
        // If the deleted image was the currently selected value, clear it
        if (value === `/uploads/${filename}`) {
          onChange("");
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al eliminar");
      }
    },
    [token, value, onChange]
  );

  // Combine lists based on tab
  const allImages: ImageItem[] = [
    ...(uploads ?? []),
    ...(images ?? []),
  ];
  const list = tab === "uploads" ? (uploads ?? []) : allImages;
  const filtered = query
    ? list.filter((im) =>
        im.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : list;

  const fmtSize = (b: number) =>
    b > 1024 * 1024
      ? `${(b / 1024 / 1024).toFixed(1)}MB`
      : `${(b / 1024).toFixed(0)}KB`;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* 48×48 preview with optional upload progress overlay */}
        <div
          className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/30"
          style={{ borderColor: "var(--glass-border)" }}
        >
          {value ? (
            <img
              src={value}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = "none";
              }}
            />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          )}
          {uploading && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/65 backdrop-blur-[1px]"
              aria-live="polite"
            >
              {uploadProgress != null && uploadProgress > 0 ? (
                <span
                  className="text-[0.7rem] font-bold"
                  style={{ color: "var(--gold)" }}
                >
                  {uploadProgress}%
                </span>
              ) : (
                <Loader2
                  className="h-4 w-4 animate-spin"
                  style={{ color: "var(--gold)" }}
                />
              )}
              {uploadProgress != null && uploadProgress > 0 && (
                <div className="h-0.5 w-8 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full transition-[width] duration-150"
                    style={{
                      width: `${uploadProgress}%`,
                      background: "var(--gold)",
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Editable URL input */}
        <Input
          value={value}
          placeholder={placeholder ?? "/assets/images/… o sube una nueva"}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-[140px] flex-1"
        />

        <div className="flex flex-shrink-0 items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setOpen(true)}
          >
            <Search className="mr-1.5 h-3.5 w-3.5" />
            Explorar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ background: "var(--gold)", color: "#0a0a0a" }}
          >
            {uploading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="mr-1.5 h-3.5 w-3.5" />
            )}
            {uploading ? "Subiendo…" : "Subir"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onChange("")}
            disabled={!value}
            aria-label="Quitar imagen"
            title="Quitar imagen"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Hidden file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      {/* Upload success feedback */}
      {uploadResult && (
        <div
          className="flex items-start gap-2 rounded-md border p-2 text-xs"
          style={{
            borderColor: "color-mix(in srgb, #22c55e 40%, transparent)",
            background: "color-mix(in srgb, #22c55e 10%, transparent)",
            color: "#86efac",
          }}
        >
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>
            Imagen optimizada: {fmtSize(uploadResult.originalSize)} →{" "}
            {fmtSize(uploadResult.optimizedSize)} ({uploadResult.reduction}{" "}
            más pequeña, WebP)
          </span>
        </div>
      )}

      {error && (
        <div
          className="flex items-start gap-2 rounded-md border p-2 text-xs"
          style={{
            borderColor: "color-mix(in srgb, #ef4444 40%, transparent)",
            background: "color-mix(in srgb, #ef4444 10%, transparent)",
            color: "#fca5a5",
          }}
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {value && !uploadResult && (
        <p className="truncate text-[0.7rem] text-muted-foreground/80">{value}</p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[88vh] flex-col gap-4 sm:max-w-2xl md:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" style={{ color: "var(--gold)" }} />
              Explorar imágenes
            </DialogTitle>
            <DialogDescription>
              Selecciona una imagen existente o sube una nueva (se optimiza
              automáticamente a WebP).
            </DialogDescription>
          </DialogHeader>

          {/* Tabs: Todas / Subidas */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={tab === "all" ? "default" : "outline"}
              onClick={() => setTab("all")}
            >
              Todas ({allImages.length})
            </Button>
            <Button
              size="sm"
              variant={tab === "uploads" ? "default" : "outline"}
              onClick={() => setTab("uploads")}
            >
              Subidas ({uploads?.length ?? 0})
            </Button>
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{ background: "var(--gold)", color: "#0a0a0a" }}
              className="ml-auto"
            >
              {uploading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="mr-1.5 h-3.5 w-3.5" />
              )}
              Subir nueva
            </Button>
          </div>

          <Input
            placeholder="Buscar por nombre de archivo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <ScrollArea className="h-[50vh] pr-3">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando imágenes…
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                {list.length === 0
                  ? "No hay imágenes. Sube una nueva con el botón dorado."
                  : "Sin resultados para tu búsqueda."}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {filtered.map((im) => {
                  const selected = value === im.url;
                  const isUpload = im.url.startsWith("/uploads/");
                  return (
                    <div
                      key={im.url}
                      className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border transition-all hover:scale-[1.03]"
                      style={{
                        borderColor: selected
                          ? "var(--gold)"
                          : "var(--glass-border)",
                        boxShadow: selected ? "0 0 0 2px var(--gold)" : "none",
                      }}
                      title={im.name}
                      onClick={() => {
                        onChange(im.url);
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      <img
                        src={im.url}
                        alt={im.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute inset-x-0 bottom-0 truncate bg-black/65 px-1.5 py-1 text-left text-[0.6rem] text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {im.name}
                      </span>
                      {isUpload && (
                        <span className="absolute left-1 top-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wide text-[var(--gold)]">
                          ↑
                        </span>
                      )}
                      {selected && (
                        <span className="absolute right-1 top-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-[var(--gold)]">
                          ✓
                        </span>
                      )}
                      {/* Delete button — only for uploaded images */}
                      {isUpload && (
                        <button
                          type="button"
                          aria-label={`Eliminar ${im.name}`}
                          className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600/90 text-white opacity-0 transition-all hover:bg-red-600 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUpload(im.name);
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
