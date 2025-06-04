import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../constant';
import axios from 'axios';

export default function DendaIndex() {
    const [dendas, setDendas] = useState([]);
    const [members, setMembers] = useState([]);
    const [books, setBooks] = useState([]);
    const [state, setState] = useState({
        error: null,
        isLoaded: false,
        alert: ''
    });

    const navigate = useNavigate();

    const handleUnauthorized = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    const fetchDenda = async () => {
        try {
            const res = await axios.get(`${API_URL}/denda`);
            const data = res.data?.data || [];
            setDendas(Array.isArray(data) ? data : []);
            setState(prev => ({ ...prev, isLoaded: true }));
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                handleUnauthorized();
            } else {
                setState(prev => ({
                    ...prev,
                    error: err.response?.data || { message: "Gagal memuat data." },
                    isLoaded: true
                }));
            }
        }
    };

    const fetchBook = async () => {
        try {
            const res = await axios.get(`${API_URL}/buku`);
            const data = res.data?.data || [];
            setBooks(Array.isArray(data) ? data : []);
            setState(prev => ({ ...prev, isLoaded: true }));
        } catch (err) {
            if (err.response?.status === 401) {
                handleUnauthorized();
            } else {
                setState(prev => ({
                    ...prev,
                    error: err.response?.data || { message: "Gagal memuat data buku." },
                    isLoaded: true
                }));
            }
        }
    };

    const fetchMember = async () => {
        try {
            const res = await axios.get(`${API_URL}/member`);
            const data = res.data?.data || [];
            setMembers(Array.isArray(data) ? data : []);
            setState(prev => ({ ...prev, isLoaded: true }));
        } catch (err) {
            if (err.response?.status === 401) {
                handleUnauthorized();
            } else {
                setState(prev => ({
                    ...prev,
                    error: err.response?.data || { message: "Gagal memuat data member." },
                    isLoaded: true
                }));
            }
        }
    };

    useEffect(() => {
        fetchBook();
        fetchMember();
        fetchDenda();
    }, []);

    if (!state.isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            <div className="max-w-full mx-auto">
                {state.alert && (
                    <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
                        {state.alert}
                    </div>
                )}
                {state.error && (
                    <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                        {state.error.message}
                    </div>
                )}

                <div className="flex justify-between items-center mb-8 mt-8 px-4">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-gray-800 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                            Daftar Denda
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Kelola data denda perpustakaan dengan mudah dan efisien
                        </p>
                    </div>
                </div>

<div className="overflow-hidden bg-white rounded-lg shadow-md">
    <table className="w-full table-auto">
        <thead className="bg-gray-100 text-gray-700">
            <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">No</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama Member</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama Buku</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Jumlah Denda</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Jenis Denda</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Deskripsi</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Tanggal</th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {dendas.length > 0 ? dendas.map((item, index) => {
                const member = members.find(m => m.id === item.id_member);
                const book = books.find(b => b.id === item.id_buku);
                return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-3 whitespace-nowrap">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-700">
                            {member ? member.nama : item.id_member}
                        </td>
                        <td className="px-4 py-3">
                            {book ? book.judul : item.id_buku}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            Rp {parseInt(item.jumlah_denda).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                item.jenis_denda === 'kerusakan' 
                                ? 'text-red-700' 
                                : 'text-yellow-700'
                            }`}>
                                {item.jenis_denda.charAt(0).toUpperCase() + item.jenis_denda.slice(1)}
                            </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate text-gray-500 text-sm">
                            {item.deskripsi}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            {new Date(item.created_at).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'long', 
                                year: 'numeric'
                            })}
                        </td>
                    </tr>
                )
            }) : (
                <tr>
                    <td colSpan="7" className="px-4 py-6 text-center text-gray-500 italic">
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <span>Tidak ada data denda yang tersedia saat ini.</span>
                        </div>
                    </td>
                </tr>
            )}
        </tbody>
    </table>
</div>
            </div>
        </div>
    );
}