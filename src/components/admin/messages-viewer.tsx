"use client";

import { useEffect, useState } from "react";
import { Trash2, Loader2, Mail, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_TOKEN_STORAGE_KEY } from "@/lib/admin-token";

/**
 * MessagesViewer — muestra los mensajes de contacto y permite eliminarlos.
 */
export function MessagesViewer({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const token = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    const res = await fetch("/api/admin/messages", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    setMessages(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => load());
    return () => cancelAnimationFrame(raf);
  }, []);

  const deleteAll = async () => {
    if (!confirm("¿Eliminar mensajes anteriores a 30 días?")) return;
    const token = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    const res = await fetch("/api/admin/messages", {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (data.ok) {
      toast({ title: "Mensajes limpiados" });
      load();
    }
  };

  const deleteOne = async (id: number) => {
    const token = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    await fetch(`/api/admin/messages`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    setMessages(messages.filter(m => m.id !== id));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b p-3" style={{ borderColor: "var(--glass-border)" }}>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">Mensajes de Contacto</h2>
        <span className="text-xs text-muted-foreground">({messages.length})</span>
        <Button variant="outline" size="sm" onClick={deleteAll} className="ml-auto" disabled={messages.length === 0}>
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Limpiar +30 días
        </Button>
      </div>
      <ScrollArea className="flex-1 p-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--gold)" }} />
          </div>
        ) : messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No hay mensajes</p>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="rounded-lg border p-4" style={{ borderColor: "var(--glass-border)" }}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-foreground">{m.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{m.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[0.65rem] text-muted-foreground">
                      {new Date(m.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => deleteOne(m.id)}>
                      <Trash2 className="h-3.5 w-3.5" style={{ color: "#f87171" }} />
                    </Button>
                  </div>
                </div>
                {m.subject && <p className="mb-1 text-xs font-medium" style={{ color: "var(--gold)" }}>{m.subject}</p>}
                <p className="text-sm text-muted-foreground">{m.message}</p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

/**
 * SubscribersViewer — muestra los suscriptores del newsletter y permite exportar/eliminar.
 */
export function SubscribersViewer({ onBack }: { onBack: () => void }) {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const token = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    const res = await fetch("/api/admin/subscribers", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    setSubscribers(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => load());
    return () => cancelAnimationFrame(raf);
  }, []);

  const deleteAll = async () => {
    if (!confirm("¿Eliminar TODOS los suscriptores?")) return;
    const token = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    const res = await fetch("/api/admin/subscribers", {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (data.ok) {
      toast({ title: "Suscriptores eliminados" });
      setSubscribers([]);
    }
  };

  const exportCSV = () => {
    const csv = "email,fecha\n" + subscribers.map(s => `${s.email},${new Date(s.created_at).toISOString()}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "suscriptores-aragal.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b p-3" style={{ borderColor: "var(--glass-border)" }}>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">Suscriptores</h2>
        <span className="text-xs text-muted-foreground">({subscribers.length})</span>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={subscribers.length === 0}>
            Exportar CSV
          </Button>
          <Button variant="outline" size="sm" onClick={deleteAll} disabled={subscribers.length === 0}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Eliminar todos
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 p-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--gold)" }} />
          </div>
        ) : subscribers.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No hay suscriptores</p>
        ) : (
          <div className="space-y-2">
            {subscribers.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: "var(--glass-border)" }}>
                <span className="text-sm text-foreground">{s.email}</span>
                <span className="text-[0.65rem] text-muted-foreground">
                  {new Date(s.created_at).toLocaleDateString("es-CL")}
                </span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
