import { useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Dashboard() {
    useEffect(() => {
        // Cek apakah user baru saja login
        const justLoggedIn = localStorage.getItem('just_logged_in');
        
        if (justLoggedIn === 'true') {
            toast.success('Login berhasil! Selamat datang di dashboard!', {
                position: 'top-center',
                autoClose: 3000,
            });
            // Hapus flag setelah menampilkan toast
            localStorage.removeItem('just_logged_in');
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="p-8 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
                <p>Selamat datang di dashboard!</p>
            </div>
        </div>
    );
}
