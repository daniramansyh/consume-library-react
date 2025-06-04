import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../constant';
import Modal from '../../components/Modal';
import * as XLSX from 'xlsx';
import {
    ClipboardDocumentIcon,
    ArrowUturnRightIcon
} from "@heroicons/react/24/outline";

export default function PeminjamanIndex() {
    const navigate = useNavigate();
    const handleUnauthorized = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };
    const [borrows, setBorrows] = useState([]);
    const [members, setMembers] = useState([]);
    const [books, setBooks] = useState([]);
    const [state, setState] = useState({
        error: null,
        isLoaded: false,
        alert: ''
    });

    // State untuk modal tambah peminjaman
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newPeminjaman, setNewPeminjaman] = useState({
        id_member: '',
        id_buku: '',
        tgl_pinjam: '',
        tgl_pengembalian: ''
    });

    // Handler untuk input form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPeminjaman(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitAdd = (e) => {
        e.preventDefault();
        const selectedBook = books.find(book => book.id === parseInt(newPeminjaman.id_buku));

        if (!selectedBook) {
            setState(prev => ({
                ...prev,
                error: { message: 'Buku tidak ditemukan.' }
            }));
            return;
        }

        if (selectedBook.stok <= 0) {
            setState(prev => ({
                ...prev,
                error: { message: 'Stok buku tidak tersedia.' }
            }));
            return;
        }

        // Add new borrowing record
        axios.post(`${API_URL}/peminjaman`, newPeminjaman)
            .then(() => {
                // Update book stock
                return axios.put(`${API_URL}/buku/${newPeminjaman.id_buku}`, {
                    ...selectedBook,
                    stok: selectedBook.stok - 1
                });
            })
            .then(() => {
                setState(prev => ({
                    ...prev,
                    alert: 'Peminjaman berhasil ditambahkan'
                }));

                // Refresh data
                fetchPeminjaman();
                fetchBooks();

                // Reset form and close modal
                setIsAddModalOpen(false);
                setNewPeminjaman({
                    id_member: '',
                    id_buku: '',
                    tgl_pinjam: '',
                    tgl_pengembalian: ''
                });
            })
            .catch(err => {
                if (err.response?.status === 401) {
                    handleUnauthorized();
                } else {
                    setState(prev => ({
                        ...prev,
                        error: err.response?.data || { message: 'Gagal menambahkan peminjaman.' }
                    }));
                }
            });
    };

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);

    const fetchPeminjaman = async () => {
        try {
            const res = await axios.get(`${API_URL}/peminjaman`);
            const data = res.data?.data || [];
            // Urutkan data dengan yang terbaru di atas
            const sortedData = Array.isArray(data)
                ? [...data].sort((a, b) => b.id - a.id)
                : [];
            setBorrows(sortedData);
            setState(prev => ({ ...prev, isLoaded: true, error: null }));
        } catch (err) {
            if (err.response?.status === 401) {
                handleUnauthorized();
            } else {
                setState(prev => ({
                    ...prev,
                    error: err.response?.data || { message: 'Gagal memuat data.' },
                    isLoaded: true
                }));
            }
        }
    };

    // Fetch data member
    const fetchMembers = () => {
        axios.get(`${API_URL}/member`)
            .then(res => {
                if (res.data && Array.isArray(res.data)) {
                    setMembers(res.data)
                } else {
                    setMembers([])
                }
                setState(prev => ({ ...prev, isLoaded: true }))
            })
            .catch(err => {
                err.response?.status === 401
                    ? handleUnauthorized()
                    : setState(prev => ({
                        ...prev,
                        error: err.response?.data || { message: "Failed to fetch data." }
                    }))
            })
    }

    // Fetch data buku
    const fetchBooks = async () => {
        try {
            const res = await axios.get(`${API_URL}/buku`)
            setBooks(Array.isArray(res.data) ? res.data : [])
            setState(prev => ({ ...prev, isLoaded: true }))
        } catch (err) {
            err.response?.status === 401
                ? handleUnauthorized()
                : setState(prev => ({
                    ...prev,
                    error: err.response?.data || { message: "Failed to fetch data." },
                    isLoaded: true
                }))
        }
    }

    // State untuk modal pengembalian
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [returnInfo, setReturnInfo] = useState({
        showDendaForm: false,
        denda: 0,
        jenis_denda: '',
        deskripsi: ''
    });

    // Handler untuk input form denda
    const handleDendaInputChange = (e) => {
        const { name, value } = e.target;
        setReturnInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handler untuk toggle form denda
    const toggleDendaForm = () => {
        setReturnInfo(prev => ({
            ...prev,
            showDendaForm: !prev.showDendaForm
        }));
    };

    // Prepare modal return
    const openReturnModal = item => {
        setSelectedReturn(item);
        setReturnInfo({
            showDendaForm: false,
            denda: 0,
            jenis_denda: '',
            deskripsi: ''
        });
        setIsReturnModalOpen(true);
    };

    const closeReturnModal = () => {
        setIsReturnModalOpen(false);
        setSelectedReturn(null);
        setReturnInfo({
            showDendaForm: false,
            denda: 0,
            jenis_denda: '',
            deskripsi: ''
        });
    };

    const handleConfirmReturn = async () => {
        if (!selectedReturn) return;

        try {
            const selectedBook = books.find(book => book.id === selectedReturn.id_buku);

            if (returnInfo.showDendaForm && returnInfo.denda > 0) {
                await axios.post(`${API_URL}/denda`, {
                    id_member: selectedReturn.id_member,
                    id_buku: selectedReturn.id_buku,
                    jumlah_denda: returnInfo.denda,
                    jenis_denda: returnInfo.jenis_denda,
                    deskripsi: returnInfo.deskripsi
                });

                if (returnInfo.jenis_denda !== 'kerusakan' && selectedBook) {
                    await axios.put(`${API_URL}/buku/${selectedReturn.id_buku}`, {
                        ...selectedBook,
                        stok: selectedBook.stok + 1
                    });
                }
            } else if (selectedBook) {
                await axios.put(`${API_URL}/buku/${selectedReturn.id_buku}`, {
                    ...selectedBook,
                    stok: selectedBook.stok + 1
                });
            }

            await axios.put(`${API_URL}/peminjaman/pengembalian/${selectedReturn.id}`);
            setState(prev => ({
                ...prev,
                alert: returnInfo.denda > 0
                    ? `Buku berhasil dikembalikan dengan denda Rp ${returnInfo.denda.toLocaleString('id-ID')}`
                    : 'Buku berhasil dikembalikan'
            }));

            closeReturnModal();

            fetchPeminjaman();
            fetchBooks();
        } catch (err) {
            setState(prev => ({
                ...prev,
                error: err.response?.data || { message: 'Gagal mengembalikan buku.' }
            }));
        }
    };

    // Panggil fetch data saat komponen dimount
    useEffect(() => {
        fetchPeminjaman();
        fetchMembers();
        fetchBooks();
    }, []);


    if (!state.isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600"></div>
            </div>
        );
    }

    const handleExportToExcel = () => {
        const dataToExport = borrows.map((item, index) => {
            const member = members.find(m => m.id === item.id_member);
            const book = books.find(b => b.id === item.id_buku);

            return {
                'No': index + 1,
                'Nama Member': member ? member.nama : item.id_member,
                'Judul Buku': book ? book.judul : item.id_buku,
                'Tanggal Pinjam': new Date(item.tgl_pinjam).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                }),
                'Tanggal Pengembalian': item.tgl_pengembalian ? new Date(item.tgl_pengembalian).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                }) : '-',
                'Status': item.status_pengembalian ? 'Sudah Dikembalikan' : 'Belum Dikembalikan'
            };
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dataToExport);

        XLSX.utils.book_append_sheet(wb, ws, 'Data Peminjaman');

        XLSX.writeFile(wb, `Data_Peminjaman.xlsx`);
    };

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
                            Daftar Peminjaman
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Kelola data peminjaman buku perpustakaan dengan mudah dan efisien
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleExportToExcel}
                            className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-lg hover:from-emerald-700 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <i className="bi bi-file-earmark-excel"></i>
                            <span>Export Excel</span>
                        </button>
                        <button
                            onClick={openAddModal}
                            className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg hover:from-indigo-700 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <i className="bi bi-plus-circle"></i>
                            <span>Tambah Peminjaman</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden bg-white rounded-lg shadow-md">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama Member - ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama Buku - ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Tanggal Pinjam</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Tanggal Pengembalian</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {borrows.length > 0 ? (
                                borrows.map((item, index) => {
                                    const member = members.find(m => m.id === item.id_member);
                                    const book = books.find(b => b.id === item.id_buku);
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-4 py-3 whitespace-nowrap">{index + 1}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {member ? `${member.nama} - ${member.id}` : item.id_member}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-700">
                                                {book ? `${book.judul} - ${book.id}` : item.id_buku}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {new Date(item.tgl_pinjam).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {item.tgl_pengembalian ? new Date(item.tgl_pengembalian).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric'
                                                }) : '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${!item.status_pengembalian
                                                    ? 'text-orange-700'
                                                    : ''
                                                    }`}>
                                                    {!item.status_pengembalian ? 'Belum Dikembalikan' : 'Sudah Dikembalikan'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    {!item.status_pengembalian && (
                                                        <button
                                                            onClick={() => openReturnModal(item)}
                                                            className="text-gray-500 hover:text-blue-700 transition-colors duration-150"
                                                            title="Konfirmasi Pengembalian"
                                                        >
                                                            <ArrowUturnRightIcon className='w-5 h-5' />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-6 text-center text-gray-500 italic">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <ClipboardDocumentIcon className='w-5 h-5' />
                                            <span>Tidak ada data peminjaman yang tersedia saat ini.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}

                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
                title="Tambah Peminjaman Baru"
                size="lg"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={closeAddModal}
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:z-10 focus:ring-4 focus:ring-gray-100"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            form="peminjamanForm"
                            className="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        >
                            Simpan
                        </button>
                    </>
                }
            >
                <form id="peminjamanForm" onSubmit={handleSubmitAdd} className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">Member</label>
                        <select
                            name="id_member"
                            value={newPeminjaman.id_member}
                            onChange={handleInputChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                            required
                        >
                            <option value="">Pilih Member</option>
                            {members.map(member => (
                                <option key={member.id} value={member.id}>
                                    {member.nama} - {member.id}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">Buku</label>
                        <select
                            name="id_buku"
                            value={newPeminjaman.id_buku}
                            onChange={handleInputChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                            required
                        >
                            <option value="">Pilih Buku</option>
                            {books.map(book => (
                                <option key={book.id} value={book.id}>
                                    {book.judul} - {book.id}
                                </option>
                            ))}
                        </select>
                    </div>
                    {[
                        { label: 'Tanggal Pinjam', name: 'tgl_pinjam', type: 'date' },
                        { label: 'Tanggal Pengembalian', name: 'tgl_pengembalian', type: 'date' }
                    ].map(({ label, name, type }) => (
                        <div key={name}>
                            <label className="block mb-2 text-sm font-medium text-gray-900">{label}</label>
                            <input
                                type={type}
                                name={name}
                                value={newPeminjaman[name]}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                                required
                            />
                        </div>
                    ))}
                </form>
            </Modal>

            <Modal
                isOpen={isReturnModalOpen}
                onClose={closeReturnModal}
                title="Konfirmasi Pengembalian"
                size="lg"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={closeReturnModal}
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:z-10 focus:ring-4 focus:ring-gray-100"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleConfirmReturn}
                            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        >
                            Konfirmasi Pengembalian
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Apakah Anda yakin ingin mengembalikan buku ini?
                    </p>

                    <button
                        onClick={toggleDendaForm}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-200"
                    >
                        <i className="bi bi-plus-circle mr-2"></i>
                        Tambahkan Denda
                    </button>

                    {returnInfo.showDendaForm && (
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="font-medium text-gray-900 mb-4">Form Denda</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900">
                                        Jumlah Denda (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        name="denda"
                                        value={returnInfo.denda}
                                        onChange={handleDendaInputChange}
                                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900">
                                        Jenis Denda
                                    </label>
                                    <select
                                        name="jenis_denda"
                                        value={returnInfo.jenis_denda}
                                        onChange={handleDendaInputChange}
                                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                        required
                                    >
                                        <option value="">Pilih Jenis Denda</option>
                                        <option value="terlambat">Terlambat</option>
                                        <option value="kerusakan">Kerusakan</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        name="deskripsi"
                                        value={returnInfo.deskripsi}
                                        onChange={handleDendaInputChange}
                                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                        rows="3"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
