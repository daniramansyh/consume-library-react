import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../constant';

export default function Login() {
    const [login, setLogin] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setLogin({
            ...login,
            [e.target.name]: e.target.value
        });
    };

    const loginProcess = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await axios.post(
                `${API_URL}/login`,
                login,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("Login response:", res.data);

            // Perbaikan struktur pengecekan response untuk format baru
            if (!res.data) {
                throw new Error('Response data kosong');
            }

            // Mengambil token dari format response baru
            const token = res.data.token;

            if (!token) {
                console.error('Struktur response:', res.data);
                throw new Error('Token tidak ditemukan dalam response');
            }

            // Simpan token ke localStorage
            localStorage.setItem('access_token', token);
            
            // Karena tidak ada data user, kita bisa menyimpan email sebagai identitas dasar
            const basicUserInfo = {
                email: login.email
            };
            localStorage.setItem('user', JSON.stringify(basicUserInfo));
            
            navigate('/dashboard');

        } catch (err) {
            console.error("Login error:", err);
            let errorMessage;
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            } else {
                errorMessage = 'Terjadi kesalahan saat login';
            }
            
            setError({ message: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Perpus Digital</h2>
                    <p className="text-sm text-gray-600">
                        Akses koleksi digital kapan pun, di mana pun
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded">
                        <div className="text-red-700">
                            {error.data && typeof error.data === 'object'
                                ? Object.entries(error.data).map(([key, value]) => (
                                    <div key={key}>{value}</div>
                                ))
                                : error.message}
                        </div>
                    </div>
                )}

                <form onSubmit={loginProcess} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="Masukkan email"
                                value={login.email}
                                onChange={handleInputChange}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                placeholder="••••••••"
                                value={login.password}
                                onChange={handleInputChange}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                            loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                        }`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </>
                        ) : 'Login'}
                    </button>
                </form>

                <div className="text-center text-sm text-gray-600">
                    Belum punya akun?{' '}
                    <a href="/register" className="font-medium text-gray-600 hover:text-gray-500">
                        Daftar yuk
                    </a>
                </div>
            </div>
        </div>
    );
}
