import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { X, Clapperboard, Image, Music2, FolderOpen, Search, type LucideIcon } from "lucide-react";
export const ErrorContext = React.createContext("");
export function cn(...values: ClassValue[]) {
  return twMerge(clsx(values));
}
const button = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
export function Button({
  className,
  variant,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>) {
  return (
    <button
      title={size === "icon" ? props["aria-label"] : undefined}
      className={cn("ui-button", button({ variant, size }), className)}
      {...props}
    />
  );
}
export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 min-w-0 w-full rounded-xl border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 min-w-0 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}
export function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-10 min-w-0 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}) {
  const error = React.useContext(ErrorContext);
  const returnFocus = React.useRef<HTMLElement | null>(null);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-50 bg-black/25 backdrop-blur-sm" />
        <DialogPrimitive.Content
          onOpenAutoFocus={() => {
            returnFocus.current = document.activeElement instanceof HTMLElement
              ? document.activeElement : null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const target = returnFocus.current;
            const nextDialog = document.querySelector('[role="dialog"][data-state="open"]');
            if (target?.isConnected && target.getClientRects().length && (!nextDialog || nextDialog.contains(target)))
              target.focus({ preventScroll: true });
          }}
          className={cn(
            "dialog-content fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl border bg-background p-6 shadow-2xl outline-none",
            wide ? "max-w-4xl" : "max-w-lg",
            className,
          )}
        >
          <DialogPrimitive.Title className={cn("dialog-title shrink-0 pr-8 text-lg font-semibold", !description && "mb-5")}>
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className={cn("dialog-description shrink-0", description ? "mb-5 mt-1 text-sm text-muted-foreground" : "sr-only")}>
            {description || title}
          </DialogPrimitive.Description>
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          {children}
          <DialogPrimitive.Close
            className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-lg bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            aria-label="关闭"
          >
            <X size={16} />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Placeholder({
  kind = "image",
  compact = false,
  className,
}: {
  kind?: "image" | "video" | "audio" | "project" | "search";
  compact?: boolean;
  className?: string;
}) {
  const icons: Record<string, LucideIcon> = {
    image: Image, video: Clapperboard, audio: Music2, project: FolderOpen, search: Search,
  };
  const Icon = icons[kind];
  return (
    <div aria-hidden="true" className={cn("media-placeholder", compact && "media-placeholder-compact", className)}>
      <div className="placeholder-frame"><Icon strokeWidth={1.4} /></div>
    </div>
  );
}

export function EmptyState({
  kind = "image", title, description, children,
}: {
  kind?: React.ComponentProps<typeof Placeholder>["kind"];
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return <div className="empty-state">
    <Placeholder kind={kind} />
    <h3 className="text-sm font-medium">{title}</h3>
    {description && <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>}
    {children && <div className="mt-5">{children}</div>}
  </div>;
}
