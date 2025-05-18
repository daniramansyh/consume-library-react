import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { API_URL } from '../constant';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Registrasi komponen Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
    const [borrows, setBorrows] = useState([]);
    const [state, setState] = useState({ error: null, isLoaded: false });
    const [monthlyData, setMonthlyData] = useState({ labels: [], datasets: [] });

    const processMonthlyData = (data) => {
        const monthlyBorrows = {};

        data.forEach(borrow => {
            const date = new Date(borrow.tgl_pinjam);
            if (isNaN(date)) return; // Skip jika tanggal invalid

            const monthYear = `${date.toLocaleString('id-ID', { month: 'long' })} ${date.getFullYear()}`;
            monthlyBorrows[monthYear] = (monthlyBorrows[monthYear] || 0) + 1;
        });

        const labels = Object.keys(monthlyBorrows);
        const borrowCounts = Object.values(monthlyBorrows);

        setMonthlyData({
            labels,
            datasets: [
                {
                    label: 'Jumlah Peminjaman',
                    data: borrowCounts,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1
                }
            ]
        });
    };

    const fetchPeminjaman = async () => {
        try {
            const res = await axios.get(`${API_URL}/peminjaman`);
            const data = res.data?.data || [];
            const sortedData = Array.isArray(data) ? [...data].sort((a, b) => b.id - a.id) : [];

            setBorrows(sortedData);
            processMonthlyData(sortedData); // ✅ Kunci grafik muncul
            setState({ isLoaded: true, error: null });
        } catch (err) {
            setState({
                isLoaded: true,
                error: err.response?.data || { message: 'Gagal memuat data.' }
            });
        }
    };

    useEffect(() => {
        fetchPeminjaman();

        const justLoggedIn = localStorage.getItem('just_logged_in');
        if (justLoggedIn === 'true') {
            toast.success('Login berhasil! Selamat datang di dashboard!', {
                position: 'top-center',
                autoClose: 3000,
            });
            localStorage.removeItem('just_logged_in');
        }
    }, []);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Grafik Peminjaman Buku per Bulan'
            }
        }
    };

    return (
        <div className="p-6 lg:p-8">
            <div className="max-w-full mx-auto">
                {state.error && (
                    <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                        {state.error.message}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Dashboard Perpustakaan</h1>
                </div>

                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    {!state.isLoaded ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                        </div>
                    ) : (
                        <div className="p-6">
                            <p className="text-gray-600 mb-6">Selamat datang di dashboard perpustakaan!</p>
                            <div className="bg-white rounded-lg">
                                <Bar options={options} data={monthlyData} height={300} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
