import type { ComponentType, ReactNode } from "react";
import { X } from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";
import { Badge as ShadcnBadge } from "@renderer/components/ui/badge";
import { Button as ShadcnButton } from "@renderer/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from "@renderer/components/ui/dialog";
import { Progress } from "@renderer/components/ui/progress";
import { Switch } from "@renderer/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@renderer/components/ui/tooltip";

type PhosphorIcon = ComponentType<IconProps>;

export function Button({
  children,
  icon: Icon,
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  icon?: PhosphorIcon;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}) {
  const shadcnVariant = {
    primary: "default",
    secondary: "outline",
    ghost: "ghost",
    danger: "destructive"
  }[variant] as "default" | "outline" | "ghost" | "destructive";

  return (
    <ShadcnButton
      variant={shadcnVariant}
      size={size === "sm" ? "sm" : "lg"}
      className={`button button--${variant} button--${size} ${className}`}
      {...props}
    >
      {Icon ? <Icon size={size === "sm" ? 15 : 17} weight="bold" /> : null}
      <span>{children}</span>
    </ShadcnButton>
  );
}

export function IconButton({
  icon: Icon,
  label,
  active = false,
  className = "",
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  icon: PhosphorIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ShadcnButton
          variant="ghost"
          size="icon-lg"
          className={`icon-button ${active ? "is-active" : ""} ${className}`}
          aria-label={label}
          {...props}
        >
          <Icon size={18} weight={active ? "fill" : "regular"} />
        </ShadcnButton>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>{label}</TooltipContent>
    </Tooltip>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className = ""
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger" | "info";
  className?: string;
}) {
  const variant = tone === "danger" ? "destructive" : tone === "neutral" ? "outline" : "secondary";
  return (
    <ShadcnBadge variant={variant} className={`badge badge--${tone} ${className}`}>
      {children}
    </ShadcnBadge>
  );
}

export function Modal({
  open,
  title,
  eyebrow,
  children,
  footer,
  onClose,
  width = "medium"
}: {
  open: boolean;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  width?: "small" | "medium" | "large";
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent
        className={`modal modal--${width} no-drag`}
        showCloseButton={false}
      >
        <header className="modal__header">
          <div>
            {eyebrow ? (
              <DialogDescription className="eyebrow">{eyebrow}</DialogDescription>
            ) : (
              <DialogDescription className="sr-only">{title}对话框</DialogDescription>
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <IconButton icon={X} label="关闭" onClick={onClose} />
        </header>
        <div className="modal__body">{children}</div>
        {footer ? <footer className="modal__footer">{footer}</footer> : null}
      </DialogContent>
    </Dialog>
  );
}

export function Field({
  label,
  hint,
  children
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span className="field__label">
        {label}
        {hint ? <small>{hint}</small> : null}
      </span>
      {children}
    </label>
  );
}

export function ViewHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="view-header">
      <div className="view-header__copy">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="view-header__actions">{actions}</div> : null}
    </header>
  );
}

export function Toggle({
  checked,
  onChange,
  label
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="toggle-row">
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className={`toggle ${checked ? "is-on" : ""}`}
        aria-label={label}
      />
      <span>{label}</span>
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="segmented" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={value === option.value ? "is-active" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Meter({ value }: { value: number }) {
  return <Progress className="meter" value={Math.max(0, Math.min(100, value))} />;
}
