import React from 'react';

// Force visible text in all inputs
const inputStyle = {
    color: '#111827',
    WebkitTextFillColor: '#111827',
} as React.CSSProperties;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { }

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ style, ...props }, ref) => {
        return <input ref={ref} style={{ ...inputStyle, ...style }} {...props} />;
    }
);
Input.displayName = 'Input';

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ style, ...props }, ref) => {
        return <textarea ref={ref} style={{ ...inputStyle, ...style }} {...props} />;
    }
);
TextArea.displayName = 'TextArea';

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ style, ...props }, ref) => {
        return <select ref={ref} style={{ ...inputStyle, ...style }} {...props} />;
    }
);
Select.displayName = 'Select';
