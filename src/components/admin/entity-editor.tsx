"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Save,
  Trash2,
  Loader2,
  AlertCircle,
  Eraser,
  Pencil,
  Image as ImageIcon,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { TRACK_GENRES } from "@/lib/site";
import { ADMIN_TOKEN_STORAGE_KEY } from "@/lib/admin-token";
import { cn } from "@/lib/utils";
import { ImagePicker } from "./image-picker";

/* ------------------------------------------------------------------ */
/* Field & entity schemas                                              */
/* ------------------------------------------------------------------ */

/**
 * Field kinds:
 *  - text          → Input (single line)
 *  - textarea      → Textarea (multi-line, controlled rows) — full width
 *  - number        → Input type=number, value stored as number | null
 *  - select        → shadcn Select with explicit options
 *  - list          → comma-separated Input, value stored as string[] on save
 *  - nullable-url  → Input + "vaciar" button (clears to "")
 *  - image         → ImagePicker (text input + Explorar dialog + preview)
 *
 * The server-side `sanitiseBody` converts empty strings to `null` for
 * columns listed in `nullableColumns`, so we just send "" and let it handle
 * the null-conversion. The `image` kind therefore keeps nullable behaviour
 * for free (the ImagePicker's "Quitar imagen" button sets value to "").
 */
type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "list"
  | "nullable-url"
  | "image";

type FieldSpec = {
  key: string;
  label: string;
  kind: FieldKind;
  rows?: number;
  placeholder?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  /** Only valid for `tracks.id` — shown only when creating a new item. */
  createOnly?: boolean;
};

type EntitySchema = {
  label: string;
  description?: string;
  /** If true, the entity is a single row keyed by id=1 (no list/create/delete). */
  singleton?: boolean;
  fields: FieldSpec[];
  /** Label for the "Add new" button on list entities. */
  addLabel?: string;
  /** If true, prompt the user for an id (slug) when creating a new item. */
  promptForId?: boolean;
  /** Field key used as the title in the collapsible card summary. */
  titleKey?: string;
  /** Field key used as the subtitle in the collapsible card summary. */
  subtitleKey?: string;
  /** Field key (kind: image) used as the thumbnail in the card summary. */
  imageKey?: string;
};

const SCHEMAS: Record<string, EntitySchema> = {
  bio: {
    label: "Biografía",
    description:
      "Texto introductorio, manifiesto, cita y foto. Una línea del manifiesto por renglón.",
    singleton: true,
    fields: [
      { key: "intro", label: "Intro", kind: "textarea", rows: 3 },
      { key: "body1", label: "Párrafo 1", kind: "textarea", rows: 3 },
      { key: "body2", label: "Párrafo 2", kind: "textarea", rows: 3 },
      { key: "body3", label: "Párrafo 3", kind: "textarea", rows: 3 },
      { key: "body4", label: "Párrafo 4", kind: "textarea", rows: 3 },
      {
        key: "manifesto",
        label: "Manifiesto",
        kind: "textarea",
        rows: 4,
        hint: "Una línea por frase (separadas con salto de línea).",
      },
      { key: "quote", label: "Cita destacada (pull-quote)", kind: "textarea", rows: 2 },
      {
        key: "image_url",
        label: "Imagen",
        kind: "image",
        hint: "Ruta local (/assets/...) o URL completa.",
      },
    ],
  },
  stats: {
    label: "Estadísticas",
    description: "Números destacados que aparecen en la franja bajo el hero.",
    addLabel: "Añadir estadística",
    titleKey: "number",
    subtitleKey: "label",
    fields: [
      { key: "number", label: "Número (ej. «24+»)", kind: "text" },
      { key: "label", label: "Etiqueta", kind: "text" },
      { key: "sort_order", label: "Orden", kind: "number" },
    ],
  },
  timeline: {
    label: "Línea de tiempo",
    description: "Hitos por año, mostrados bajo la biografía.",
    addLabel: "Añadir hito",
    titleKey: "year",
    subtitleKey: "text",
    fields: [
      { key: "year", label: "Año (ej. «1980s»)", kind: "text" },
      { key: "text", label: "Texto", kind: "text" },
      { key: "sort_order", label: "Orden", kind: "number" },
    ],
  },
  tracks: {
    label: "Música",
    description:
      "Tracks con embed de Spotify. El ID (slug) se pide al crear; después es fijo.",
    addLabel: "Añadir track",
    promptForId: true,
    titleKey: "title",
    subtitleKey: "category",
    imageKey: "cover_url",
    fields: [
      {
        key: "id",
        label: "ID (slug)",
        kind: "text",
        createOnly: true,
        placeholder: "olivia",
      },
      { key: "title", label: "Título", kind: "text" },
      {
        key: "category",
        label: "Categoría",
        kind: "text",
        placeholder: "Son Cubano",
      },
      {
        key: "genre",
        label: "Género (filtro)",
        kind: "select",
        options: TRACK_GENRES.map((g) => ({ value: g.value, label: g.label })),
      },
      {
        key: "badge",
        label: "Badge (opcional)",
        kind: "text",
        placeholder: "Último Lanzamiento",
      },
      { key: "cover_url", label: "Portada", kind: "image" },
      {
        key: "spotify_url",
        label: "URL del embed de Spotify",
        kind: "textarea",
        rows: 2,
        placeholder: "https://open.spotify.com/embed/track/...",
      },
    ],
  },
  collaborations: {
    label: "Colaboraciones",
    description:
      "Artistas colaboradores. Las «obras» se separan por comas.",
    addLabel: "Añadir colaboración",
    titleKey: "name",
    subtitleKey: "role",
    imageKey: "image_url",
    fields: [
      { key: "role", label: "Rol", kind: "text", placeholder: "Arreglista / Director" },
      { key: "name", label: "Nombre", kind: "text" },
      { key: "subtitle", label: "Subtítulo", kind: "text" },
      {
        key: "image_url",
        label: "Imagen (opcional)",
        kind: "image",
        hint: "Opcional. Pulsa «Quitar imagen» para vaciar.",
      },
      {
        key: "works",
        label: "Obras",
        kind: "list",
        hint: "Separadas por comas.",
        placeholder: "Tema A, Tema B, Tema C",
      },
      { key: "impact", label: "Impacto", kind: "textarea", rows: 2 },
      { key: "sort_order", label: "Orden", kind: "number" },
    ],
  },
  gallery: {
    label: "Galería",
    description: "Imágenes con caption. Las imágenes se muestran en el lightbox.",
    addLabel: "Añadir imagen",
    titleKey: "caption",
    imageKey: "src",
    fields: [
      { key: "src", label: "Imagen", kind: "image" },
      { key: "caption", label: "Caption", kind: "text" },
      { key: "alt", label: "Texto alternativo (alt)", kind: "text" },
      { key: "sort_order", label: "Orden", kind: "number" },
    ],
  },
  news: {
    label: "Noticias",
    description:
      "Actualidad. El «date» puede ser una fecha o una etiqueta (ej. «YouTube»).",
    addLabel: "Añadir noticia",
    titleKey: "title",
    subtitleKey: "date",
    fields: [
      {
        key: "date",
        label: "Fecha / etiqueta",
        kind: "text",
        placeholder: "Enero 2024",
      },
      { key: "title", label: "Título", kind: "text" },
      { key: "description", label: "Descripción", kind: "textarea", rows: 2 },
      { key: "url", label: "URL (opcional)", kind: "nullable-url" },
      {
        key: "url_label",
        label: "Texto del enlace (opcional)",
        kind: "text",
        placeholder: "Ver en YouTube",
      },
      { key: "sort_order", label: "Orden", kind: "number" },
    ],
  },
  videos: {
    label: "Videos",
    description:
      "Embeds de YouTube. Pega solo el ID del video (ej. «QuTVjHxtTqs»).",
    addLabel: "Añadir video",
    titleKey: "title",
    fields: [
      { key: "title", label: "Título", kind: "text" },
      {
        key: "youtube_id",
        label: "ID de YouTube",
        kind: "text",
        placeholder: "QuTVjHxtTqs",
      },
      { key: "sort_order", label: "Orden", kind: "number" },
    ],
  },
  press: {
    label: "Prensa",
    description:
      "Prensa, plataformas y reconocimientos. Tipo: media, platform o recognition.",
    addLabel: "Añadir entrada",
    titleKey: "title",
    subtitleKey: "source",
    fields: [
      {
        key: "type",
        label: "Tipo",
        kind: "text",
        placeholder: "media / platform / recognition",
      },
      { key: "source", label: "Fuente", kind: "text" },
      { key: "title", label: "Título", kind: "text" },
      { key: "quote", label: "Cita (opcional)", kind: "textarea", rows: 2 },
      { key: "url", label: "URL (opcional)", kind: "nullable-url" },
      { key: "date", label: "Fecha", kind: "text", placeholder: "2024" },
      { key: "sort_order", label: "Orden", kind: "number" },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Row = { id: string | number; [k: string]: unknown };

type EntityEditorProps = {
  entity: string;
};

/* ------------------------------------------------------------------ */
/* Public component                                                    */
/* ------------------------------------------------------------------ */

export function EntityEditor({ entity }: EntityEditorProps) {
  const schema = SCHEMAS[entity];
  if (!schema) {
    return <ErrorRow message={`Entidad desconocida: ${entity}`} />;
  }
  if (schema.singleton) {
    return <SingletonEditor entity={entity} schema={schema} />;
  }
  return <ListEditor entity={entity} schema={schema} />;
}

/* ------------------------------------------------------------------ */
/* API helper                                                          */
/* ------------------------------------------------------------------ */

async function apiFetch<T>(
  url: string,
  init?: RequestInit
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    // Read the admin token from localStorage and send it as a Bearer header
    // so auth works through the Caddy preview proxy (cross-domain cookies
    // are unreliable there).
    let authHeaders: Record<string, string> = {};
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
      if (token) {
        authHeaders.Authorization = `Bearer ${token}`;
      }
    }
    const res = await fetch(url, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...(init?.headers || {}),
      },
    });
    const json = (await res.json()) as { ok?: boolean; data?: T; error?: string };
    if (!res.ok || !json.ok) {
      return { ok: false, error: json.error ?? `HTTP ${res.status}` };
    }
    return { ok: true, data: json.data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

/**
 * Build the JSON payload to PUT/POST from a row, applying field-specific
 * serialisation:
 *  - `list` fields are split by comma into a string[] (server stores arrays).
 *  - `createOnly` fields (e.g. tracks.id) are never sent on PUT.
 *  - everything else (including `image`) is passed through as-is.
 */
function serialisePayload(schema: EntitySchema, row: Row): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of schema.fields) {
    if (f.createOnly) continue; // never resend id on PUT
    let v = row[f.key];
    if (f.kind === "list") {
      if (Array.isArray(v)) {
        v = v
          .map((x) => (typeof x === "string" ? x.trim() : String(x)))
          .filter(Boolean);
      } else if (typeof v === "string") {
        v = v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        v = [];
      }
    }
    out[f.key] = v;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* SingletonEditor (bio)                                               */
/* ------------------------------------------------------------------ */

function SingletonEditor({
  entity,
  schema,
}: {
  entity: string;
  schema: EntitySchema;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [row, setRow] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await apiFetch<Row>(`/api/admin/${entity}`);
      if (cancelled) return;
      if (!r.ok || !r.data) {
        setError(r.error ?? "No se pudo cargar");
      } else {
        setRow(r.data);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [entity]);

  const handleSave = useCallback(async () => {
    if (!row) return;
    setSaving(true);
    const payload = serialisePayload(schema, row);
    const r = await apiFetch<Row>(`/api/admin/${entity}/${row.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!r.ok) {
      toast({
        title: "Error al guardar",
        description: r.error,
        variant: "destructive",
      });
      return;
    }
    toast({ title: `${schema.label} guardada` });
    if (r.data) {
      setRow(r.data);
    }
    // Show a brief green-check success state on the button.
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
    router.refresh();
  }, [entity, row, schema, toast, router]);

  if (loading) return <LoadingRow />;
  if (error) return <ErrorRow message={error} />;
  if (!row) return null;

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4">
        <SectionHeader title={schema.label} description={schema.description} />

        {/* "Contenido principal" badge — singletons have no list/cards */}
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em]"
            style={{
              borderColor: "color-mix(in srgb, var(--gold) 40%, transparent)",
              background: "color-mix(in srgb, var(--gold) 8%, transparent)",
              color: "var(--gold)",
            }}
          >
            Contenido principal
          </span>
          <span className="text-[0.7rem] text-muted-foreground">
            Una sola entrada editada en bloque.
          </span>
        </div>

        {schema.fields.map((f) => (
          <FieldRenderer
            key={f.key}
            field={f}
            value={row[f.key]}
            onChange={(v) => setRow({ ...row, [f.key]: v })}
          />
        ))}

        <SaveButton
          saving={saving}
          justSaved={justSaved}
          label={`Guardar ${schema.label.toLowerCase()}`}
          onClick={handleSave}
        />
      </div>
    </ScrollArea>
  );
}

/* ------------------------------------------------------------------ */
/* ListEditor (non-singleton) — collapsible cards                      */
/* ------------------------------------------------------------------ */

function ListEditor({
  entity,
  schema,
}: {
  entity: string;
  schema: EntitySchema;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | number | null>(null);
  const [successId, setSuccessId] = useState<string | number | null>(null);
  const [creating, setCreating] = useState(false);
  // id of the item whose form is currently expanded (null = all collapsed).
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await apiFetch<Row[]>(`/api/admin/${entity}`);
      if (cancelled) return;
      if (!r.ok || !Array.isArray(r.data)) {
        setError(r.error ?? "No se pudo cargar");
        setItems(null);
      } else {
        setItems(r.data);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [entity]);

  const updateItem = useCallback((id: Row["id"], patch: Partial<Row>) => {
    setItems((cur) =>
      cur ? cur.map((it) => (it.id === id ? { ...it, ...patch } : it)) : cur
    );
  }, []);

  const saveItem = useCallback(
    async (id: Row["id"]) => {
      const cur = items?.find((it) => it.id === id);
      if (!cur) return;
      const payload = serialisePayload(schema, cur);
      setSavingId(id);
      const r = await apiFetch<Row>(`/api/admin/${entity}/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setSavingId(null);
      if (!r.ok) {
        toast({
          title: "Error al guardar",
          description: r.error,
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Guardado" });
      if (r.data) {
        setItems((cur) =>
          cur ? cur.map((it) => (it.id === id ? r.data! : it)) : cur
        );
      }
      // Show a brief green-check success state on the button before
      // collapsing back to the summary.
      setSuccessId(id);
      setTimeout(() => {
        setSuccessId(null);
        setExpandedId(null);
      }, 900);
      router.refresh();
    },
    [entity, items, schema, toast, router]
  );

  const deleteItem = useCallback(
    async (id: Row["id"]) => {
      const r = await apiFetch<unknown>(`/api/admin/${entity}/${id}`, {
        method: "DELETE",
      });
      if (!r.ok) {
        toast({
          title: "Error al eliminar",
          description: r.error,
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Eliminado" });
      setItems((cur) => (cur ? cur.filter((it) => it.id !== id) : cur));
      if (expandedId === id) setExpandedId(null);
      router.refresh();
    },
    [entity, toast, router, expandedId]
  );

  const createItem = useCallback(async () => {
    const initial: Record<string, unknown> = {};
    // If the schema has a createOnly field (e.g. tracks.id), prompt for it.
    if (schema.promptForId) {
      const idField = schema.fields.find((f) => f.createOnly);
      if (idField) {
        const id = window.prompt(
          `${idField.label} (único, sin espacios, ej. «olivia»):`
        );
        if (!id) return; // user cancelled
        initial.id = id.trim().toLowerCase();
      }
    }
    setCreating(true);
    const r = await apiFetch<Row>(`/api/admin/${entity}`, {
      method: "POST",
      body: JSON.stringify(initial),
    });
    setCreating(false);
    if (!r.ok || !r.data) {
      toast({
        title: "Error al crear",
        description: r.error,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Creado" });
    const newItem = r.data;
    setItems((cur) => (cur ? [...cur, newItem] : [newItem]));
    // Auto-expand the newly created item so the user can fill in its fields.
    setExpandedId(newItem.id);
    router.refresh();
  }, [entity, schema, toast, router]);

  if (loading) return <LoadingRow />;
  if (error) return <ErrorRow message={error} />;
  if (!items) return null;

  return (
    <div className="flex h-full flex-col">
      {/* Sticky header: title + prominent "Add new" button */}
      <div className="space-y-3 border-b p-4" style={{ borderColor: "var(--glass-border)" }}>
        <SectionHeader title={schema.label} description={schema.description} />
        <Button
          onClick={createItem}
          disabled={creating}
          className="w-full"
          style={{
            background:
              "linear-gradient(135deg, var(--gold), color-mix(in srgb, var(--gold) 70%, #b8860b))",
            color: "#0a0a0a",
          }}
        >
          {creating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {schema.addLabel ?? "Añadir nuevo"}
        </Button>
      </div>

      {/* Scrollable list of collapsible cards */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 p-4">
          {items.length === 0 && (
            <div
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--gold) 30%, transparent)",
              }}
            >
              <div
                className="mb-3 flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  background:
                    "color-mix(in srgb, var(--gold) 10%, transparent)",
                  color: "var(--gold)",
                }}
              >
                <Plus className="h-7 w-7" />
              </div>
              <p className="mb-1 text-sm font-medium text-foreground">
                Sin elementos todavía
              </p>
              <p className="mb-4 max-w-xs text-xs text-muted-foreground">
                Crea el primer elemento de{" "}
                {schema.label.toLowerCase()} para empezar a editarlo.
              </p>
              <Button
                onClick={createItem}
                disabled={creating}
                size="sm"
                className="border-2"
                style={{
                  background: "var(--gold)",
                  color: "#0a0a0a",
                  borderColor: "var(--gold)",
                }}
              >
                {creating ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                )}
                Añadir el primer elemento
              </Button>
            </div>
          )}

          {items.map((item, i) => (
            <ItemCard
              key={String(item.id)}
              schema={schema}
              item={item}
              index={i}
              expanded={expandedId === item.id}
              onExpand={() => setExpandedId(item.id)}
              onCollapse={() => setExpandedId(null)}
              onChange={(patch) => updateItem(item.id, patch)}
              onSave={() => saveItem(item.id)}
              onDelete={() => deleteItem(item.id)}
              saving={savingId === item.id}
              justSaved={successId === item.id}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ItemCard — collapsible summary + inline form                        */
/* ------------------------------------------------------------------ */

function ItemCard({
  schema,
  item,
  index,
  expanded,
  onExpand,
  onCollapse,
  onChange,
  onSave,
  onDelete,
  saving,
  justSaved,
}: {
  schema: EntitySchema;
  item: Row;
  index: number;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onChange: (patch: Partial<Row>) => void;
  onSave: () => void;
  onDelete: () => void;
  saving: boolean;
  justSaved: boolean;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const titleRaw = schema.titleKey ? item[schema.titleKey] : null;
  const title =
    typeof titleRaw === "string" && titleRaw.trim()
      ? titleRaw
      : `#${index + 1}`;
  const subtitle = schema.subtitleKey
    ? String(item[schema.subtitleKey] ?? "").trim()
    : "";
  const imageUrl = schema.imageKey
    ? String(item[schema.imageKey] ?? "").trim()
    : "";

  const editableFields = schema.fields.filter((f) => !f.createOnly);

  return (
    <Collapsible
      open={expanded}
      onOpenChange={(o) => (o ? onExpand() : onCollapse())}
      className="rounded-lg border-2 transition-colors"
      style={{
        borderColor: expanded ? "var(--gold)" : "var(--glass-border)",
        background: expanded
          ? "color-mix(in srgb, var(--gold) 4%, transparent)"
          : undefined,
      }}
    >
      {/* Summary row — always visible */}
      <div className="flex items-center gap-3 p-3">
        {/* Thumbnail or index badge — 40×40 */}
        <div
          className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/30 text-xs font-semibold text-muted-foreground"
          style={{ borderColor: "var(--glass-border)" }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = "none";
              }}
            />
          ) : schema.imageKey ? (
            <ImageIcon className="h-4 w-4 text-muted-foreground/60" />
          ) : (
            <span>{index + 1}</span>
          )}
        </div>

        {/* Title + subtitle */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {title}
            {schema.promptForId && (
              <span className="ml-2 text-[0.65rem] font-normal uppercase tracking-wide text-muted-foreground">
                {String(item.id)}
              </span>
            )}
          </p>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Edit / Delete */}
        <div className="flex flex-shrink-0 items-center gap-1">
          <CollapsibleTrigger asChild>
            <Button
              size="sm"
              variant={expanded ? "secondary" : "ghost"}
              onClick={expanded ? onCollapse : onExpand}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              {expanded ? "Cerrar" : "Editar"}
            </Button>
          </CollapsibleTrigger>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                aria-label="Eliminar"
                title="Eliminar"
                className="text-muted-foreground hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar este elemento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Estás a punto de eliminar «{title}» de{" "}
                  {schema.label.toLowerCase()}. Esta acción no se puede
                  deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600/30"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Eliminar definitivamente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Expanded form */}
      <CollapsibleContent>
        <div
          className="border-t p-3"
          style={{ borderColor: "var(--glass-border)" }}
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {editableFields.map((f) => (
              <FieldRenderer
                key={f.key}
                field={f}
                value={item[f.key]}
                onChange={(v) => onChange({ [f.key]: v } as Partial<Row>)}
              />
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <SaveButton
              size="sm"
              saving={saving}
              justSaved={justSaved}
              label="Guardar"
              onClick={onSave}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={onCollapse}
              className="border-2"
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Cancelar
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ------------------------------------------------------------------ */
/* Field renderer                                                      */
/* ------------------------------------------------------------------ */

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FieldSpec;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  let control: React.ReactNode;

  switch (field.kind) {
    case "textarea":
      control = (
        <Textarea
          rows={field.rows ?? 3}
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;

    case "number":
      control = (
        <Input
          type="number"
          value={value == null ? "" : String(value)}
          onChange={(e) =>
            onChange(e.target.value === "" ? null : Number(e.target.value))
          }
        />
      );
      break;

    case "select":
      control = (
        <Select
          value={String(value ?? "")}
          onValueChange={(v) => onChange(v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona…" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
      break;

    case "list": {
      // value is string[] from server — display as comma-joined string.
      // We keep the raw string in row state while the user types, and only
      // split it into an array at save time (see serialisePayload).
      const arrVal = Array.isArray(value)
        ? (value as string[]).join(", ")
        : String(value ?? "");
      control = (
        <Input
          value={arrVal}
          placeholder={field.placeholder ?? "elemento1, elemento2, …"}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    }

    case "image":
      control = (
        <ImagePicker
          value={String(value ?? "")}
          onChange={(v) => onChange(v)}
          placeholder={field.placeholder}
        />
      );
      break;

    case "nullable-url":
      control = (
        <div className="flex gap-2">
          <Input
            value={String(value ?? "")}
            placeholder={field.placeholder ?? "https://…"}
            onChange={(e) => onChange(e.target.value)}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-label="Vaciar"
            title="Vaciar"
            onClick={() => onChange("")}
            disabled={!value}
            className="flex-shrink-0"
          >
            <Eraser className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
      break;

    case "text":
    default:
      control = (
        <Input
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }

  // Full-width fields span both columns on desktop.
  const fullWidth = field.kind === "textarea" || field.kind === "image";

  return (
    <div className={`space-y-1.5 ${fullWidth ? "md:col-span-2" : ""}`}>
      <Label className="text-xs">{field.label}</Label>
      {control}
      {field.hint && (
        <p className="text-[0.7rem] text-muted-foreground/70">{field.hint}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                          */
/* ------------------------------------------------------------------ */

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-1">
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

function LoadingRow() {
  return (
    <div className="flex items-center justify-center py-12 text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Cargando…
    </div>
  );
}

function ErrorRow({ message }: { message: string }) {
  return (
    <div
      className="m-4 flex items-start gap-2 rounded-md border p-3 text-sm"
      style={{
        borderColor: "color-mix(in srgb, #ef4444 40%, transparent)",
        background: "color-mix(in srgb, #ef4444 10%, transparent)",
        color: "#fca5a5",
      }}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function SaveButton({
  saving,
  justSaved,
  label,
  onClick,
  size,
}: {
  saving: boolean;
  justSaved?: boolean;
  label: string;
  onClick: () => void;
  size?: "sm" | "default";
}) {
  return (
    <Button
      onClick={onClick}
      disabled={saving}
      size={size}
      variant="outline"
      className={cn(
        "border-2 font-medium transition-all duration-200",
        size === "sm" ? "" : "w-full"
      )}
      style={
        justSaved
          ? {
              background: "#22c55e",
              color: "#ffffff",
              borderColor: "#22c55e",
            }
          : {
              background: "var(--gold)",
              color: "#0a0a0a",
              borderColor: "var(--gold)",
            }
      }
    >
      {saving ? (
        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
      ) : justSaved ? (
        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
      ) : (
        <Save className="mr-1.5 h-3.5 w-3.5" />
      )}
      {saving ? "Guardando…" : justSaved ? "¡Guardado!" : label}
    </Button>
  );
}
