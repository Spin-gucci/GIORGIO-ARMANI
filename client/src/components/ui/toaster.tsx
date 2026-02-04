import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-md w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "bg-background border rounded-lg shadow-lg p-4 pr-8 relative",
            toast.variant === "destructive" && "border-destructive bg-destructive text-destructive-foreground"
          )}
        >
          <button
            onClick={() => dismiss(toast.id)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          {toast.title && <div className="font-semibold">{toast.title}</div>}
          {toast.description && <div className="text-sm text-muted-foreground">{toast.description}</div>}
          {toast.action}
        </div>
      ))}
    </div>
  );
}
