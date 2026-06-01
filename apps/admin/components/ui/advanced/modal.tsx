'use client';

import { 
  ReactNode, 
  createContext, 
  useContext, 
  useState 
} from 'react';
import { X } from 'lucide-react';
import { Button } from '../button';
import { cn } from '@/lib/utils';

interface ModalContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export interface ModalProps {
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Modal({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange
}: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  };

  return (
    <ModalContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </ModalContext.Provider>
  );
}

export interface ModalTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

export function ModalTrigger({ children, asChild = false }: ModalTriggerProps) {
  const context = useContext(ModalContext);
  if (!context) throw new Error('ModalTrigger must be used within Modal');
  
  const { setIsOpen } = context;

  if (asChild) {
    return <span onClick={() => setIsOpen(true)}>{children}</span>;
  }

  return <Button onClick={() => setIsOpen(true)}>{children}</Button>;
}

export interface ModalContentProps {
  children: ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hideCloseButton?: boolean;
  className?: string;
}

const sizeStyles: Record<'sm' | 'md' | 'lg' | 'xl' | 'full', string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-5xl'
};

export function ModalContent({
  children,
  title,
  description,
  size = 'md',
  hideCloseButton = false,
  className
}: ModalContentProps) {
  const context = useContext(ModalContext);
  if (!context) throw new Error('ModalContent must be used within Modal');
  
  const { isOpen, setIsOpen } = context;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      <div className={cn(
        "relative z-50 w-full mx-4 rounded-lg bg-card border border-border shadow-xl",
        sizeStyles[size],
        className
      )}>
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div className="space-y-1">
            {title && (
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {!hideCloseButton && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn(
      "flex items-center justify-end gap-3 p-6 border-t border-border",
      className
    )}>
      {children}
    </div>
  );
}
