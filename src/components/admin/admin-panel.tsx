"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Lock,
  LogOut,
  Loader2,
  ArrowLeft,
  User,
  BarChart3,
  CalendarDays,
  Music,
  Users,
  Image as ImageIcon,
  Newspaper,
  Video,
  Award,
  Mail,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_TOKEN_STORAGE_KEY } from "@/lib/admin-token";
import { EntityEditor } from "./entity-editor";
import { MessagesViewer, SubscribersViewer } from "./messages-viewer";

/**
 * Inline admin panel.
 *
 * Renders a floating button bottom-left (Lock icon when logged out, Pencil
 * when logged in). On mount it pokes `/api/admin/session` to know whether
 * the user is already authenticated.
 *
 * - Click when logged out → Dialog with a password Input → POSTs to
 *   `/api/admin/login`. On success: `setIsAdmin(true)` + toast
 *   "Modo edición activado" + opens the Sheet.
 * - Click when logged in → opens a Sheet (side=left) listing the 8 editable
 *   entities as a grid of cards. Clicking a card swaps the dashboard for the
 *   `<EntityEditor>` for that entity (with a "Volver" back button). The Sheet
 *   footer hosts the "Cerrar sesión" button (POST `/api/admin/logout`).
 *
 * A small "Edit mode" pill is shown near the button when admin is active.
 *
 * The admin is also reachable via the secret triple-click gesture on the
 * quill logo in the navbar — see `aragal:open-admin` CustomEvent below.
 */

type EntityId =
  | "bio"
  | "stats"
  | "timeline"
  | "tracks"
  | "collaborations"
  | "gallery"
  | "news"
  | "videos"
  | "press"
  | "messages"
  | "subscribers";

const ENTITIES: {
  id: EntityId;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    id: "bio",
    label: "Bio",
    description: "Introducción, manifiesto, cita y foto del artista",
    icon: User,
  },
  {
    id: "stats",
    label: "Stats",
    description: "Métricas clave (años, canciones, países)",
    icon: BarChart3,
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "Hitos cronológicos por año",
    icon: CalendarDays,
  },
  {
    id: "tracks",
    label: "Tracks",
    description: "Canciones con embed de Spotify",
    icon: Music,
  },
  {
    id: "collaborations",
    label: "Collaborations",
    description: "Artistas colaboradores y sus obras",
    icon: Users,
  },
  {
    id: "gallery",
    label: "Gallery",
    description: "Imágenes de colaboraciones con leyendas",
    icon: ImageIcon,
  },
  {
    id: "news",
    label: "News",
    description: "Actualidad, prensa y enlaces",
    icon: Newspaper,
  },
  {
    id: "videos",
    label: "Videos",
    description: "Videos de YouTube embebidos",
    icon: Video,
  },
  {
    id: "press",
    label: "Prensa",
    description: "Prensa, plataformas y reconocimientos",
    icon: Award,
  },
  {
    id: "messages",
    label: "Mensajes",
    description: "Mensajes del formulario de contacto",
    icon: Mail,
  },
  {
    id: "subscribers",
    label: "Suscriptores",
    description: "Emails del newsletter",
    icon: Users,
  },
];

export function AdminPanel() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<EntityId | null>(null);

  // Keep a ref of isAdmin so the event listener (registered once on mount)
  // can read the latest value without re-registering.
  const isAdminRef = useRef<boolean | null>(null);
  useEffect(() => {
    isAdminRef.current = isAdmin;
  }, [isAdmin]);

  // Check session on mount — send the token from localStorage as a Bearer
  // header so it works through the Caddy preview proxy (cross-domain cookies
  // are unreliable there).
  useEffect(() => {
    let cancelled = false;
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
        : null;
    fetch("/api/admin/session", {
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((d: { isAdmin?: boolean }) => {
        if (!cancelled) setIsAdmin(Boolean(d.isAdmin));
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Listen for the secret triple-click on the quill logo to open admin.
  // Registered once on mount; reads the latest isAdmin via ref.
  useEffect(() => {
    const onOpenAdmin = () => {
      if (isAdminRef.current) {
        setSheetOpen(true);
      } else {
        setLoginOpen(true);
      }
    };
    window.addEventListener("aragal:open-admin", onOpenAdmin);
    return () => window.removeEventListener("aragal:open-admin", onOpenAdmin);
  }, []);

  const handleButtonClick = useCallback(() => {
    if (isAdmin === null) return; // still checking
    if (isAdmin) {
      setSheetOpen(true);
    } else {
      setLoginOpen(true);
    }
  }, [isAdmin]);

  const handleLogin = useCallback(async () => {
    if (!password) return;
    setLoginBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast({
          title: "Error",
          description: data.error ?? "No se pudo iniciar sesión",
          variant: "destructive",
        });
        return;
      }
      // Store the token in localStorage so subsequent admin requests can
      // send it as a Bearer header (works through the Caddy preview proxy
      // where cross-domain cookies don't).
      if (data.token && typeof window !== "undefined") {
        window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, data.token);
      }
      setIsAdmin(true);
      setLoginOpen(false);
      setPassword("");
      setSheetOpen(true);
      toast({ title: "Modo edición activado" });
    } catch {
      toast({
        title: "Error de red",
        description: "No se pudo contactar con el servidor",
        variant: "destructive",
      });
    } finally {
      setLoginBusy(false);
    }
  }, [password, toast]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    } catch {
      // swallow — we clear local state either way
    }
    // Clear the token from localStorage
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    }
    setIsAdmin(false);
    setSheetOpen(false);
    setSelectedEntity(null);
    setPassword("");
    router.refresh();
    toast({ title: "Sesión cerrada" });
  }, [router, toast]);

  const handleSheetOpenChange = useCallback((open: boolean) => {
    setSheetOpen(open);
    if (!open) setSelectedEntity(null);
  }, []);

  // We no longer early-return on isAdmin === null — the login dialog must
  // always be mountable so the triple-click gesture can open it even before
  // the session check finishes. The floating button is conditionally shown
  // only when isAdmin === true.

  const selectedLabel = selectedEntity
    ? ENTITIES.find((e) => e.id === selectedEntity)?.label ?? selectedEntity
    : null;

  return (
    <>
      {/* Floating admin button — only visible when already logged in, so the
          user can re-open the panel after closing it. When logged out, there
          is NO visible button: the admin is opened by triple-clicking the
          quill logo in the navbar (secret gesture). */}
      {isAdmin && (
        <div className="fixed bottom-6 left-6 z-[60] flex flex-col items-start gap-2">
          <span
            className="pointer-events-none rounded-full border px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] backdrop-blur-md"
            style={{
              borderColor: "color-mix(in srgb, var(--gold) 40%, transparent)",
              background: "rgba(10,10,10,0.7)",
              color: "var(--gold)",
            }}
          >
            Edit mode
          </span>
          <button
            type="button"
            onClick={handleButtonClick}
            aria-label="Abrir panel de edición"
            className="focus-gold flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-110"
            style={{
              borderColor: "color-mix(in srgb, var(--gold) 45%, transparent)",
              background: "rgba(10,10,10,0.7)",
              color: "var(--gold)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            <Pencil className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Login dialog */}
      <Dialog
        open={loginOpen}
        onOpenChange={(o) => {
          setLoginOpen(o);
          if (!o) setPassword("");
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4" style={{ color: "var(--gold)" }} />
              Acceso de administrador
            </DialogTitle>
            <DialogDescription>
              Introduce la contraseña para editar el contenido del sitio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Contraseña</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin();
                }}
                autoFocus
                disabled={loginBusy}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setLoginOpen(false);
                setPassword("");
              }}
              disabled={loginBusy}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleLogin}
              disabled={loginBusy || !password}
            >
              {loginBusy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando…
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin sheet — slides from the left.
          - Mobile: full screen (w-full + h-full).
          - Desktop: wide sheet (md:max-w-4xl lg:max-w-6xl) so the editor
            has room to breathe.
          Body is a flex column: header (back button when an entity is
          selected) + flex-1 area that hosts either the dashboard grid
          (ScrollArea) or the EntityEditor (which manages its own scroll). */}
      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side="left"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-full md:max-w-4xl lg:max-w-6xl"
        >
          <SheetHeader className="border-b p-4 pr-12" style={{ borderColor: "var(--glass-border)" }}>
            <SheetTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4" style={{ color: "var(--gold)" }} />
              {selectedLabel ? `Editar · ${selectedLabel}` : "Panel de edición"}
            </SheetTitle>
            <SheetDescription>
              {selectedEntity
                ? "Edita los campos y pulsa Guardar. Los cambios se reflejan al instante en el sitio público."
                : "Selecciona qué quieres editar."}
            </SheetDescription>
          </SheetHeader>

          {/* Body: dashboard grid or selected entity editor */}
          <div className="min-h-0 flex-1 overflow-hidden">
            {selectedEntity ? (
              <div className="flex h-full flex-col">
                <div
                  className="border-b p-3"
                  style={{ borderColor: "var(--glass-border)" }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => setSelectedEntity(null)}
                  >
                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                    Volver al panel
                  </Button>
                </div>
                <div className="min-h-0 flex-1">
                  {selectedEntity === "messages" ? (
                    <MessagesViewer onBack={() => setSelectedEntity(null)} />
                  ) : selectedEntity === "subscribers" ? (
                    <SubscribersViewer onBack={() => setSelectedEntity(null)} />
                  ) : (
                    <EntityEditor entity={selectedEntity} />
                  )}
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-4">
                  <div className="mb-5">
                    <h2 className="text-lg font-semibold text-foreground">
                      Panel de edición
                    </h2>
                    <div
                      className="mt-1.5 h-[2px] w-14 rounded-full"
                      style={{
                        background:
                          "linear-gradient(to right, var(--gold), color-mix(in srgb, var(--gold) 0%, transparent))",
                      }}
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Selecciona qué quieres editar
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {ENTITIES.map((e) => {
                      const Icon = e.icon;
                      const isActive = selectedEntity === e.id;
                      const borderCls = isActive
                        ? "border-[var(--gold)]"
                        : "border-[var(--glass-border)] hover:border-[var(--gold)]";
                      const bgCls = isActive
                        ? "bg-[color-mix(in_srgb,var(--gold)_6%,transparent)]"
                        : "hover:bg-[color-mix(in_srgb,var(--gold)_8%,transparent)]";
                      return (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => setSelectedEntity(e.id)}
                          className={`group relative flex items-start gap-3 overflow-hidden rounded-lg border-2 p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_10px_28px_-8px_rgba(0,0,0,0.35)] ${borderCls} ${bgCls}`}
                          aria-pressed={isActive}
                        >
                          {/* Subtle gold sweep on hover */}
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            style={{
                              background:
                                "linear-gradient(135deg, color-mix(in srgb, var(--gold) 8%, transparent) 0%, transparent 55%)",
                            }}
                          />
                          <div
                            className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-[var(--glass-border)] transition-colors group-hover:border-[color-mix(in_srgb,var(--gold)_60%,transparent)]"
                            style={{
                              color: "var(--gold)",
                              background:
                                "color-mix(in srgb, var(--gold) 8%, transparent)",
                            }}
                          >
                            <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                          </div>
                          <div className="relative min-w-0 flex-1">
                            <p className="font-medium text-foreground">
                              {e.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {e.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Footer: logout — prominent gold-outlined button */}
          <SheetFooter
            className="border-t p-3"
            style={{ borderColor: "var(--glass-border)" }}
          >
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordDialog(true)}
                className="border-2 transition-all hover:scale-[1.01]"
                style={{
                  borderColor: "var(--glass-border)",
                  color: "var(--muted-foreground)",
                }}
              >
                <Lock className="mr-1.5 h-3.5 w-3.5" />
                Contraseña
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-2 font-semibold transition-all hover:scale-[1.01]"
                onClick={handleLogout}
                style={{
                  borderColor: "color-mix(in srgb, var(--gold) 55%, transparent)",
                  color: "var(--gold)",
                  background: "color-mix(in srgb, var(--gold) 8%, transparent)",
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Change password dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4" style={{ color: "var(--gold)" }} />
              Cambiar contraseña
            </DialogTitle>
            <DialogDescription>
              Actualiza la contraseña de administrador. Mínimo 8 caracteres.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Contraseña actual</Label>
              <Input
                type="password"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
                placeholder="••••••••"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Nueva contraseña</Label>
              <Input
                type="password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setPwCurrent("");
                setPwNew("");
              }}
            >
              Cancelar
            </Button>
            <Button
              disabled={pwBusy || !pwCurrent || !pwNew || pwNew.length < 8}
              onClick={async () => {
                setPwBusy(true);
                try {
                  const token = window.localStorage.getItem("aragal_admin_token");
                  const res = await fetch("/api/admin/change-password", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                      currentPassword: pwCurrent,
                      newPassword: pwNew,
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok || !data.ok) {
                    toast({
                      title: "Error",
                      description: data.error ?? "No se pudo cambiar",
                      variant: "destructive",
                    });
                    return;
                  }
                  toast({
                    title: "Contraseña actualizada",
                    description: "Para producción, actualízala también en Vercel Dashboard.",
                  });
                  setShowPasswordDialog(false);
                  setPwCurrent("");
                  setPwNew("");
                } catch {
                  toast({
                    title: "Error de red",
                    variant: "destructive",
                  });
                } finally {
                  setPwBusy(false);
                }
              }}
              style={{ background: "var(--gold)", color: "#0a0a0a" }}
            >
              {pwBusy ? "Actualizando..." : "Cambiar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
