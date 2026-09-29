import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'success' | 'danger' | 'secondary' | 'ghost' | 'danger-ghost'

const styles: Record<Variant, string> = {
  primary: 'bg-brand text-white shadow-[0_4px_0_var(--brand-strong)] hover:brightness-105',
  success: 'bg-success text-white shadow-[0_4px_0_var(--success-strong)] hover:brightness-105',
  danger: 'bg-danger text-white shadow-[0_4px_0_var(--danger-strong)] hover:brightness-105',
  secondary: 'bg-surface text-fg border-2 border-border shadow-[0_4px_0_var(--border)] hover:bg-surface-2',
  ghost: 'bg-transparent text-muted hover:bg-surface-2 hover:text-fg',
  'danger-ghost': 'bg-transparent text-danger hover:bg-danger-soft',
}

/** Botón "gordito" al estilo Duolingo: la sombra inferior se aplasta al presionar. */
export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const pressable = variant !== 'ghost' && variant !== 'danger-ghost'
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-extrabold uppercase tracking-wide transition-[transform,box-shadow,filter] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none ${
        pressable ? 'active:translate-y-[3px] active:shadow-none' : ''
      } ${styles[variant]} ${className}`}
    />
  )
}
