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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600"></div>
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

                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Daftar Denda</h1>
                </div>

                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="w-full table-auto divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                <th className="px-3 py-2">Nama Member</th>
                                <th className="px-3 py-2">Nama Buku</th>
                                <th className="px-3 py-2">Jumlah Denda</th>
                                <th className="px-3 py-2">Jenis Denda</th>
                                <th className="px-3 py-2">Deskripsi</th>
                                <th className="px-3 py-2">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dendas.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-3 py-4 text-sm text-gray-500 text-center">
                                        Tidak ada data denda yang tersedia saat ini.
                                    </td>
                                </tr>
                            ) : (
                                dendas.map((item, index) => {
                                    const member = members.find(m => m.id === item.id_member);
                                    const book = books.find(b => b.id === item.id_buku);
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2">{index + 1}</td>
                                            <td className="px-3 py-2 text-center">
                                                {member ? member.nama : item.id_member}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                {book ? book.judul : item.id_buku}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                Rp {parseInt(item.jumlah_denda).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.jenis_denda === 'kerusakan'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {item.jenis_denda}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center">{item.deskripsi}</td>
                                            <td className="px-3 py-2 text-center">
                                                {new Date(item.created_at).toLocaleDateString('id-ID')}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}