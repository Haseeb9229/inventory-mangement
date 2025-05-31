export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center px-4 py-2 bg-[#8B7355] border border-transparent rounded-md font-semibold text-sm text-white tracking-wide hover:bg-[#54483A] focus:bg-[#54483A] active:bg-[#54483A] focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:ring-offset-2 transition ease-in-out duration-150 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
