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
import {
    BookOpenIcon,
    UsersIcon,
    ClockIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

// Registrasi komponen Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
    const [borrows, setBorrows] = useState([]);
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [state, setState] = useState({ error: null, isLoaded: false });
    const [monthlyData, setMonthlyData] = useState({ labels: [], datasets: [] });
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalMembers: 0,
        pendingReturns: 0,
        totalBorrows: 0
    });

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
                    backgroundColor: 'rgba(79, 70, 229, 0.6)',
                    borderColor: 'rgb(79, 70, 229)',
                    borderWidth: 1
                }
            ]
        });
    };

    const fetchData = () => {
        // Fetch peminjaman
        axios.get(`${API_URL}/peminjaman`)
            .then(res => {
                const borrowData = res.data?.data || [];
                // Sort data by date and get only latest 5 records
                const sortedData = [...borrowData]
                    .sort((a, b) => new Date(b.tgl_pinjam) - new Date(a.tgl_pinjam))
                    .slice(0, 5);

                setBorrows(sortedData);
                processMonthlyData(borrowData);

                // Update stats for borrows
                const pendingReturns = borrowData.filter(item => item.status_pengembalian === 0).length;
                setStats(prev => ({
                    ...prev,
                    pendingReturns,
                    totalBorrows: borrowData.length
                }));

                setState(prev => ({ ...prev, isLoaded: true, error: null }));
            })
            .catch(err => {
                if (err.response?.status === 401) {
                    handleUnauthorized();
                } else {
                    setState(prev => ({
                        ...prev,
                        error: err.response?.data || { message: 'Gagal memuat data.' },
                        isLoaded: true
                    }));
                }
            });

        // Fetch books
        axios.get(`${API_URL}/buku`)
            .then(res => {
                const bookData = Array.isArray(res.data) ? res.data : [];
                setBooks(bookData);
                setStats(prev => ({ ...prev, totalBooks: bookData.length }));
            })
            .catch(err => {
                if (err.response?.status === 401) {
                    handleUnauthorized();
                } else {
                    setState(prev => ({
                        ...prev,
                        error: err.response?.data || { message: "Gagal mengambil data buku." },
                        isLoaded: true
                    }));
                }
            });

        // Fetch members
        axios.get(`${API_URL}/member`)
            .then(res => {
                const memberData = Array.isArray(res.data) ? res.data : [];
                setMembers(memberData);
                setStats(prev => ({ ...prev, totalMembers: memberData.length }));
            })
            .catch(err => {
                err.response?.status === 401
                    ? handleUnauthorized()
                    : setState(prev => ({ ...prev, error: err.response?.data || { message: 'Failed to fetch data.' } }));
            });
    };

    const handleUnauthorized = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    useEffect(() => {
        fetchData();

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
                text: 'Grafik Peminjaman Buku per Bulan',
                font: {
                    size: 16,
                    family: "'Inter', sans-serif",
                    weight: 'bold'
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0
                }
            }
        }
    };

    // Kartu statistik
    const StatCard = ({ title, value, icon, color }) => (
        <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-600', '-100')}`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {state.error && (
                    <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                        {state.error.message}
                    </div>
                )}

                <div className="flex flex-col mb-8">
                    <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">Dashboard Perpustakaan</h1>
                    <p className="text-gray-600">Selamat datang di sistem manajemen perpustakaan digital</p>
                </div>

                {!state.isLoaded ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                title="Total Buku"
                                value={stats.totalBooks}
                                icon={<BookOpenIcon className="h-6 w-6 text-indigo-600" />}
                                color="border-indigo-600"
                            />
                            <StatCard
                                title="Total Member"
                                value={stats.totalMembers}
                                icon={<UsersIcon className="h-6 w-6 text-green-600" />}
                                color="border-green-600"
                            />
                            <StatCard
                                title="Buku Belum Dikembalikan"
                                value={stats.pendingReturns}
                                icon={<ClockIcon className="h-6 w-6 text-amber-600" />}
                                color="border-amber-600"
                            />
                            <StatCard
                                title="Total Peminjaman"
                                value={stats.totalBorrows}
                                icon={<ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />}
                                color="border-blue-600"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold mb-4">Aktivitas Peminjaman Terbaru</h2>
                                <div className="overflow-x-auto shadow-md rounded-lg">
                                    <table className="w-full text-sm text-left text-gray-500">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                                <th className="px-6 py-3">Nama Member - ID</th>
                                                <th className="px-6 py-3">Nama Buku - ID</th>
                                                <th className="px-6 py-3">Tanggal Pinjam</th>
                                                <th className="px-6 py-3">Tanggal Pengembalian</th>
                                                <th className="px-6 py-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {borrows.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-4 text-gray-700">
                                                        Tidak ada data peminjaman
                                                    </td>
                                                </tr>
                                            ) : (
                                                borrows.map((item, index) => {
                                                    const member = members.find(m => m.id === item.id_member);
                                                    const book = books.find(b => b.id === item.id_buku);
                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            className={`border-b ${!item.status_pengembalian ? 'bg-gray-50' : ''} hover:bg-gray-100 transition duration-150`}
                                                        >
                                                            <td className="px-4 py-3 text-center">{index + 1}</td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-gray-800">
                                                                        {member?.nama || 'Unknown'}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        ID: {member?.id || item.id_member}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-gray-800">
                                                                        {book?.judul || 'Unknown'}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        ID: {book?.id || item.id_buku}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {item.tgl_pinjam ? new Date(item.tgl_pinjam).toLocaleDateString('id-ID', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric'
                                                                }) : '-'}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {item.tgl_pengembalian ? new Date(item.tgl_pengembalian).toLocaleDateString('id-ID', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric'
                                                                }) : '-'}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className={`px-3 py-1.5 text-xs font-medium rounded-full inline-block min-w-[120px] text-center ${!item.status_pengembalian
                                                                    ? 'bg-orange-100 text-orange-800'
                                                                    : 'bg-green-100 text-green-800'
                                                                    }`}>
                                                                    {!item.status_pengembalian ? 'Belum Dikembalikan' : 'Sudah Dikembalikan'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <Bar options={options} data={monthlyData} height={300} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
