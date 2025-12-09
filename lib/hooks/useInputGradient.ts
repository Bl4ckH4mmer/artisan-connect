'use client'

import { useState, useCallback, FocusEvent } from 'react'

/**
 * Custom hook for dynamic terracotta gradient styling on input fields.
 * 
 * Behavior:
 * - When focused AND has content: Shows terracotta→burnt-orange gradient with white text
 * - When blurred OR empty: Returns to default styling
 * 
 * @param value - The current value of the input field
 * @param existingOnFocus - Optional existing onFocus handler to preserve
 * @param existingOnBlur - Optional existing onBlur handler to preserve
 * @returns Object with inputClassName and inputProps to spread on the input element
 * 
 * @example
 * ```tsx
 * const [value, setValue] = useState('')
 * const { inputClassName, inputProps } = useInputGradient(value)
 * 
 * <input
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   className={`base-input-classes ${inputClassName}`}
 *   {...inputProps}
 * />
 * ```
 */
export function useInputGradient(
    value: string,
    existingOnFocus?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    existingOnBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
) {
    const [isFocused, setIsFocused] = useState(false)

    const handleFocus = useCallback((e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setIsFocused(true)
        existingOnFocus?.(e)
    }, [existingOnFocus])

    const handleBlur = useCallback((e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setIsFocused(false)
        existingOnBlur?.(e)
    }, [existingOnBlur])

    // Active state: focused AND has at least one character
    const isActive = isFocused && value.length > 0

    // Generate className based on state
    const inputClassName = isActive
        ? 'bg-gradient-to-r from-[#C75B39] to-[#D97642] text-white placeholder-white/60 border-[#C75B39]'
        : ''

    return {
        inputClassName,
        isActive,
        inputProps: {
            onFocus: handleFocus,
            onBlur: handleBlur,
        },
    }
}

export default useInputGradient
