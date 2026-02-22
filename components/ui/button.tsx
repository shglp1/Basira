import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' };

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  return <button className={`btn btn-${variant} ${className}`.trim()} {...props} />;
}
