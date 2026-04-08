import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cva } from 'class-variance-authority'
import { X, Loader2 } from 'lucide-react'
import { cn, STATUS_LABEL } from '@/lib/utils'

// ─── Button ──────────────────────────────────────────────────
const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
    {
        variants: {
            variant: {
                default:     'bg-primary text-primary-foreground hover:bg-primary/90',
                destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                outline:     'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost:       'hover:bg-accent hover:text-accent-foreground',
                link:        'text-primary underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-9 px-4 py-2',
                sm:      'h-8 rounded-md px-3 text-xs',
                lg:      'h-10 rounded-md px-8',
                icon:    'h-9 w-9',
            },
        },
        defaultVariants: { variant: 'default', size: 'default' },
    }
)

export const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
))
Button.displayName = 'Button'

// ─── Input ───────────────────────────────────────────────────
export const Input = React.forwardRef(({ className, type, ...props }, ref) => (
    <input ref={ref} type={type}
           className={cn('flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', className)}
           {...props} />
))
Input.displayName = 'Input'

// ─── Textarea ─────────────────────────────────────────────────
export const Textarea = React.forwardRef(({ className, ...props }, ref) => (
    <textarea ref={ref}
              className={cn('flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none', className)}
              {...props} />
))
Textarea.displayName = 'Textarea'

// ─── Label ───────────────────────────────────────────────────
export const Label = React.forwardRef(({ className, ...props }, ref) => (
    <LabelPrimitive.Root ref={ref}
                         className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
                         {...props} />
))
Label.displayName = 'Label'

// ─── Card ────────────────────────────────────────────────────
export const Card = ({ className, ...props }) => (
    <div className={cn('rounded-xl border bg-card text-card-foreground shadow-sm', className)} {...props} />
)
export const CardHeader = ({ className, ...props }) => (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
)
export const CardTitle = ({ className, ...props }) => (
    <h3 className={cn('text-base font-semibold leading-none tracking-tight', className)} {...props} />
)
export const CardContent = ({ className, ...props }) => (
    <div className={cn('p-6 pt-0', className)} {...props} />
)
export const CardDescription = ({ className, ...props }) => (
    <p className={cn('text-sm text-muted-foreground', className)} {...props} />
)

// ─── Badge ───────────────────────────────────────────────────
const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
    {
        variants: {
            variant: {
                default:              'border-transparent bg-primary text-primary-foreground',
                secondary:            'border-transparent bg-secondary text-secondary-foreground',
                outline:              'text-foreground',
                menunggu:             'border-transparent bg-slate-100 text-slate-700',
                diagnosa:             'border-transparent bg-violet-100 text-violet-700',
                menunggu_persetujuan: 'border-transparent bg-amber-100 text-amber-700',
                proses:               'border-transparent bg-blue-100 text-blue-700',
                selesai:              'border-transparent bg-emerald-100 text-emerald-700',
                diambil:              'border-transparent bg-teal-100 text-teal-700',
                batal:                'border-transparent bg-red-100 text-red-600',
                lunas:                'border-transparent bg-emerald-100 text-emerald-700',
                belum_lunas:          'border-transparent bg-orange-100 text-orange-700',
            },
        },
        defaultVariants: { variant: 'default' },
    }
)

export const Badge = ({ className, variant, ...props }) => (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
)

export const StatusBadge = ({ status }) => (
    <Badge variant={status}>{STATUS_LABEL[status] ?? status}</Badge>
)

// ─── Dialog ──────────────────────────────────────────────────
export const Dialog        = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger

export const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay ref={ref}
                             className={cn('fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0', className)}
                             {...props} />
))
DialogOverlay.displayName = 'DialogOverlay'

export const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
    <DialogPrimitive.Portal>
        <DialogOverlay />
        <DialogPrimitive.Content ref={ref}
                                 className={cn('fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl', className)}
                                 {...props}>
            {children}
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <X className="h-4 w-4" /><span className="sr-only">Close</span>
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
))
DialogContent.displayName = 'DialogContent'

export const DialogHeader = ({ className, ...props }) => (
    <div className={cn('flex flex-col space-y-1.5', className)} {...props} />
)
export const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Title ref={ref}
                           className={cn('text-base font-semibold leading-none tracking-tight', className)} {...props} />
))
DialogTitle.displayName = 'DialogTitle'
export const DialogFooter = ({ className, ...props }) => (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
)

// ─── Select — pure native HTML (tidak pakai Radix) ───────────
// Menghindari konflik portal antara Dialog dan Select Radix UI
const selectCls = 'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer'

export const Select = ({ value, onValueChange, children, defaultValue }) => {
    return (
        <SelectContext.Provider value={{ value: value ?? defaultValue ?? '', onValueChange }}>
            {children}
        </SelectContext.Provider>
    )
}

const SelectContext = React.createContext({})

export const SelectTrigger = ({ children, className }) => {
    const { value, onValueChange } = React.useContext(SelectContext)
    // Render anak-anak untuk ambil options dari SelectContent
    const ref = React.useRef()
    return <div ref={ref} className={cn('relative', className)}>{children}</div>
}

export const SelectValue = ({ placeholder }) => {
    return <span>{placeholder}</span>
}

export const SelectContent = ({ children }) => {
    const { value, onValueChange } = React.useContext(SelectContext)

    // Kumpulkan semua options dari SelectItem children
    const options = []
    React.Children.forEach(children, child => {
        if (child?.type === SelectItem || child?.props?.value !== undefined) {
            options.push({ value: child.props.value, label: child.props.children })
        }
        // Handle SelectGroup
        if (child?.props?.children) {
            React.Children.forEach(child.props.children, sub => {
                if (sub?.props?.value !== undefined) {
                    options.push({ value: sub.props.value, label: sub.props.children })
                }
            })
        }
    })

    return (
        <select
            className={selectCls}
            value={value}
            onChange={e => onValueChange?.(e.target.value)}
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    )
}

export const SelectItem = ({ value, children }) => {
    // Dirender oleh SelectContent, tidak perlu render sendiri
    return null
}

export const SelectGroup  = ({ children }) => <>{children}</>
export const SelectLabel  = ({ children }) => <option disabled>{children}</option>

// ─── Spinner ─────────────────────────────────────────────────
export const Spinner = ({ className }) => (
    <Loader2 className={cn('animate-spin', className)} />
)

// ─── Form Field ───────────────────────────────────────────────
export const FormField = ({ label, required, hint, children }) => (
    <div className="grid gap-1.5">
        {label && (
            <Label>{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
        )}
        {children}
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
)

// ─── Page Header ──────────────────────────────────────────────
export const PageHeader = ({ title, description, action }) => (
    <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {action}
    </div>
)

// ─── Empty State ──────────────────────────────────────────────
export const EmptyState = ({ icon, message = 'Tidak ada data' }) => (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
        {icon && <div className="opacity-25">{icon}</div>}
        <p className="text-sm">{message}</p>
    </div>
)

// ─── Loading ──────────────────────────────────────────────────
export const LoadingPage = () => (
    <div className="flex items-center justify-center py-24">
        <Spinner className="h-7 w-7 text-primary" />
    </div>
)

// ─── Separator ────────────────────────────────────────────────
export const Separator = ({ className }) => (
    <div className={cn('shrink-0 bg-border h-[1px] w-full', className)} />
)