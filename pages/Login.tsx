import React, { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ICONS } from '../constants';
import { Button } from '../components/ui/Button';

const LoginInputField: React.FC<{
    id: string;
    name: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon: React.ReactNode;
}> = ({ id, name, type, placeholder, value, onChange, icon }) => (
    <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {icon}
        </div>
        <input
            id={id}
            name={name}
            type={type}
            autoComplete={name}
            required
            className="w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm transition-colors bg-brand-gray-50 text-brand-gray-900 placeholder:text-brand-gray-400 border-brand-gray-300 focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    </div>
);

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!email || !password) {
            setError('Por favor, preencha todos os campos.');
            setIsLoading(false);
            return;
        }

        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError((err as Error).message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex min-h-screen bg-white">
            <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-brand-blue-700 text-white p-12 text-center">
                <ICONS.JurisControlLogo className="w-16 h-16 mb-6" />
                <h1 className="text-4xl font-bold">Bem-vindo ao JurisControl</h1>
                <p className="mt-4 text-lg text-brand-blue-200">Sua plataforma completa para gestão de processos e pagamentos trabalhistas.</p>
            </div>
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-brand-gray-50">
                <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-brand-gray-900">Acesse sua conta</h2>
                        <p className="text-brand-gray-500 mt-2">Insira seus dados para continuar</p>
                    </div>
                    
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                        <div className="space-y-4">
                            <LoginInputField
                                id="email-address"
                                name="email"
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                icon={<ICONS.Email className="w-5 h-5 text-brand-gray-400" />}
                            />
                            <LoginInputField
                                id="password-for-login"
                                name="password"
                                type="password"
                                placeholder="Senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={<ICONS.Password className="w-5 h-5 text-brand-gray-400" />}
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="w-full"
                            >
                                Entrar
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
