/**
 * components/ui/Button.tsx
 *
 * Brutalist button component.
 * Supports rendering as a native <button> or as a react-router <Link> when `to` prop is provided.
 * Uses motion.div wrapper for clean whileTap animation without event handler typing collisions.
 * Variants: primary (green), secondary (white outline), danger (red), ghost.
 * Size: sm, md, lg.
 */

import React from 'react'
import { Link, LinkProps } from 'react-router-dom'
import { motion } from 'framer-motion'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-green text-brand-ink border-2 border-brand-ink shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg active:translate-x-0 active:translate-y-0 active:shadow-none',
  secondary:
    'bg-white text-brand-ink border-2 border-brand-ink hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0 active:translate-y-0 active:shadow-none',
  danger:
    'bg-brand-red text-white border-2 border-brand-ink hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0 active:translate-y-0 active:shadow-none',
  ghost:
    'bg-transparent text-brand-ink border-2 border-brand-ink hover:bg-brand-sage active:bg-brand-offwhite',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

interface CommonButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

type AsButtonProps = CommonButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: undefined
  }

type AsLinkProps = CommonButtonProps &
  LinkProps & {
    to: string
  }

export type ButtonProps = AsButtonProps | AsLinkProps

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      children,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const isLink = 'to' in rest && typeof rest.to === 'string'
    const isDisabled = (!isLink && (rest as AsButtonProps).disabled) || isLoading

    const baseClasses = [
      'inline-flex items-center justify-center gap-2 font-semibold font-body text-center',
      'transition-all duration-150 cursor-pointer select-none no-underline',
      variantClasses[variant],
      sizeClasses[size],
      isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
      className,
    ].join(' ')

    const content = (
      <>
        {isLoading ? (
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        ) : (
          leftIcon
        )}
        {children}
      </>
    )

    if (isLink) {
      const { to, ...linkProps } = rest as AsLinkProps
      return (
        <motion.div whileTap={{ scale: 0.98 }} className="inline-block">
          <Link
            ref={ref as React.Ref<HTMLAnchorElement>}
            to={to}
            className={baseClasses}
            {...linkProps}
          >
            {content}
          </Link>
        </motion.div>
      )
    }

    const {
      variant: _variant,
      size: _size,
      isLoading: _isLoading,
      leftIcon: _leftIcon,
      ...buttonProps
    } = rest as AsButtonProps

    return (
      <motion.div whileTap={{ scale: 0.98 }} className="inline-block">
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          className={baseClasses}
          disabled={isDisabled}
          aria-disabled={isDisabled}
          {...buttonProps}
        >
          {content}
        </button>
      </motion.div>
    )
  },
)

Button.displayName = 'Button'
