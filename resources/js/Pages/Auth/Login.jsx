import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gradient-to-br from-gray-100 to-gray-50">
            <Head title="Log in" />

            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                <div className="mb-8 flex justify-center">
                    <Link href="/" className="flex items-center">
                        <div className="relative">
                            {/* Background shape */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#D5BEA4] to-[#8B7355] rounded-lg transform rotate-6 scale-90 opacity-20"></div>
                            {/* Main icon */}
                            <div className="relative bg-gradient-to-br from-[#8B7355] to-[#54483A] p-2.5 rounded-lg shadow-lg">
                                <svg
                                    className="w-8 h-8 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-3 flex flex-col">
                            <span className="text-2xl font-bold bg-gradient-to-r from-[#54483A] to-[#8B7355] bg-clip-text text-transparent tracking-tight">
                                InvenTrack
                            </span>
                            <span className="text-xs uppercase tracking-widest text-[#8B7355]/80 -mt-1">
                                Inventory System
                            </span>
                        </div>
                    </Link>
                </div>

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}

                <form onSubmit={submit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B7355] focus:ring-[#8B7355]"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B7355] focus:ring-[#8B7355]"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-gray-300 text-[#8B7355] shadow-sm focus:border-[#8B7355] focus:ring-[#8B7355]"
                            />
                            <span className="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-[#8B7355] hover:text-[#54483A] transition-colors duration-200"
                            >
                                Forgot your password?
                            </Link>
                        )}
                    </div>

                    <div className="mt-6">
                        <PrimaryButton
                            className="w-full justify-center bg-gradient-to-r from-[#8B7355] to-[#54483A] hover:from-[#54483A] hover:to-[#8B7355] transition-all duration-300"
                            disabled={processing}
                        >
                            Log in
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
