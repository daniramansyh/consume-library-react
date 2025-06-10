import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../../constant'
import axios from 'axios'
import Modal from '../../components/Modal'
import {
    BookOpenIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon
} from "@heroicons/react/24/outline";

const useAuth = () => {
    const navigate = useNavigate()
    const handleUnauthorized = () => {
        localStorage.removeItem('access_token')
        navigate('/login')
    }
    return { handleUnauthorized }
}

export default function BukuIndex() {
    const [books, setBooks] = useState([])
    const [state, setState] = useState({
        error: null,
        isLoaded: false,
        alert: ''
    })

    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    
    const [selectedBook, setSelectedBook] = useState(null)
    const [deleteBookId, setDeleteBookId] = useState(null)
    const [editBook, setEditBook] = useState(null)
    const [newBook, setNewBook] = useState({
        no_rak: '',
        judul: '',
        pengarang: '',
        tahun_terbit: '',
        penerbit: '',
        stok: '',
        detail: ''
    })

    const { handleUnauthorized } = useAuth()
    const fetchBook = () => {
        axios.get(`${API_URL}/buku`)
            .then(res => {
                setBooks(Array.isArray(res.data) ? res.data : [])
                setState(prev => ({ ...prev, isLoaded: true }))
            })
            .catch(err => {
                err.response?.status === 401
                    ? handleUnauthorized()
                    : setState(prev => ({
                        ...prev,
                        error: err.response?.data || { message: "Gagal mengambil data buku." },
                        isLoaded: true
                    }))
            })
    }

    useEffect(() => {
        fetchBook()
        window.scrollTo(0, 0);
    }, [])

    useEffect(() => {
        if (state.alert) {
            const timer = setTimeout(() => {
                setState(prev => ({ ...prev, alert: '' }))
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [state.alert])

    const handleAddBook = () => {
        setNewBook({
            no_rak: '',
            judul: '',
            pengarang: '',
            tahun_terbit: '',
            penerbit: '',
            stok: '',
            detail: ''
        })
        setIsAddModalOpen(true)
    }

    const handleDetailBook = (book) => {
        setSelectedBook(book)
        setIsDetailModalOpen(true)
    }

    const handleEditBook = (book) => {
        setEditBook(book)
        setIsEditModalOpen(true)
    }

    const handleEditSubmit = (e) => {
        e.preventDefault()
        axios.put(`${API_URL}/buku/${editBook.id}`, editBook)
            .then(response => {
                if (response.data) {
                    setState(prev => ({
                        ...prev,
                        alert: 'Buku berhasil diperbarui!'
                    }))
                    fetchBook()
                    setIsEditModalOpen(false)
                }
            })
            .catch(err => {
                err.response?.status === 401
                    ? handleUnauthorized()
                    : setState(prev => ({
                        ...prev,
                        error: err.response?.data || { message: 'Gagal memperbarui buku.' }
                    }))
            })
    }

    const handleEditInputChange = (e) => {
        const { name, value } = e.target
        setEditBook(prev => ({ ...prev, [name]: value }))
    }

    const handleDeleteBook = () => {
        axios.delete(`${API_URL}/buku/${deleteBookId}`)
            .then(() => {
                setState(prev => ({ ...prev, alert: 'Buku berhasil dihapus!' }))
                fetchBook()
                setIsDeleteModalOpen(false)
            })
            .catch(err => {
                err.response?.status === 401
                    ? handleUnauthorized()
                    : setState(prev => ({
                        ...prev,
                        error: err.response?.data || { message: "Gagal menghapus buku." }
                    }))
            })
    }
    const openDeleteModal = (id) => {
        setDeleteBookId(id)
        setIsDeleteModalOpen(true)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        axios.post(`${API_URL}/buku`, newBook)
            .then(response => {
                if (response.data) {
                    setState(prev => ({
                        ...prev,
                        alert: 'Buku berhasil ditambahkan!'
                    }))
                    fetchBook()
                    setIsAddModalOpen(false)
                    setNewBook({
                        no_rak: '',
                        judul: '',
                        pengarang: '',
                        tahun_terbit: '',
                        penerbit: '',
                        stok: '',
                        detail: ''
                    })
                }
            })
            .catch(err => {
                err.response?.status === 401
                    ? handleUnauthorized()
                    : setState(prev => ({
                        ...prev,
                        error: err.response?.data || { message: 'Gagal menambahkan buku.' }
                    }))
            })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setNewBook(prev => ({ ...prev, [name]: value }))
    }

    if (!state.isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {state.alert && (
                    <div className="mb-6 p-4 bg-gray-100 border-l-4 border-gray-500 text-gray-700 rounded-r-md shadow-sm transition-all duration-300 ease-in-out">
                        {state.alert}
                    </div>
                )}
                {state.error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r-md shadow-sm">
                        {state.error.message}
                    </div>
                )}

                <div className="flex justify-between items-center mb-8 mt-8 px-4">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-gray-800 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                            Katalog Buku
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Kelola koleksi buku perpustakaan dengan mudah dan efisien
                        </p>
                    </div>
                    <button
                        onClick={handleAddBook}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg hover:from-indigo-700 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <PlusIcon className="w-6 h-6 mr-1" />
                        <span>Tambah Buku</span>
                    </button>
                </div>

                <div className="overflow-hidden bg-white rounded-lg shadow-md">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">No. Rak</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Judul</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Pengarang</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Tahun</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Penerbit</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Stok</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Detail</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {books.length > 0 ? books.map((book, index) => (
                                <tr key={book.id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-4 py-3 whitespace-nowrap">{index + 1}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{book.no_rak}</td>
                                    <td className="px-4 py-3 font-medium text-gray-700">{book.judul}</td>
                                    <td className="px-4 py-3">{book.pengarang}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{book.tahun_terbit}</td>
                                    <td className="px-4 py-3">{book.penerbit}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${parseInt(book.stok) > 0 ? '' : 'text-red-700'}`}>
                                            {book.stok}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 max-w-xs truncate text-gray-500 text-sm">{book.detail}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleDetailBook(book)}
                                                className="text-gray-500 hover:text-green-700 transition-colors duration-150"
                                                title="Detail"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleEditBook(book)}
                                                className="text-gray-500 hover:text-blue-600 transition-colors duration-150"
                                                title="Edit"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(book.id)}
                                                className="text-gray-500 hover:text-red-600 transition-colors duration-150"
                                                title="Hapus"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="9" className="px-4 py-6 text-center text-gray-500 italic">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <BookOpenIcon className="w-6 h-6" />
                                            <span>Tidak ada buku yang tersedia saat ini.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Add Book Modal */}
                <Modal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    title="Tambah Buku Baru"
                    size="lg"
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 transition-colors duration-150 shadow-sm cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form="bookForm"
                                className="text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-150 shadow-sm font-medium rounded-md text-sm px-5 py-2.5 text-center cursor-pointer"
                            >
                                Simpan
                            </button>
                        </>
                    }
                >
                    <form id="bookForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                            { label: 'No. Rak', name: 'no_rak', type: 'text' },
                            { label: 'Judul', name: 'judul', type: 'text' },
                            { label: 'Pengarang', name: 'pengarang', type: 'text' },
                            { label: 'Tahun Terbit', name: 'tahun_terbit', type: 'number', min: 1000, max: new Date().getFullYear() },
                            { label: 'Penerbit', name: 'penerbit', type: 'text' },
                            { label: 'Stok', name: 'stok', type: 'number', min: 0 },
                        ].map(({ label, name, type, ...rest }) => (
                            <div key={name} className="relative">
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    {label}
                                </label>
                                <input
                                    type={type}
                                    name={name}
                                    value={newBook[name]}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400 block w-full p-2.5 transition-all duration-150"
                                    required
                                    {...rest}
                                />
                            </div>
                        ))}
                        <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Detail
                            </label>
                            <textarea
                                name="detail"
                                value={newBook.detail}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400 block w-full p-2.5 transition-all duration-150"
                                rows="4"
                            />
                        </div>
                    </form>
                </Modal>

                {/* Edit Book Modal */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title="Edit Buku"
                    size="lg"
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200 shadow-sm cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form="editBookForm"
                                className="text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium rounded-lg text-sm px-6 py-2.5 text-center cursor-pointer"
                            >
                                Simpan Perubahan
                            </button>
                        </>
                    }
                >
                    {editBook && (
                        <form id="editBookForm" onSubmit={handleEditSubmit} className="space-y-6">
                            <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                                <h3 className="text-indigo-700 font-medium mb-2">Informasi Buku</h3>
                                <p className="text-sm text-indigo-600">Silakan edit informasi buku sesuai kebutuhan</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { label: 'No. Rak', name: 'no_rak', type: 'text', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
                                    { label: 'Judul', name: 'judul', type: 'text', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                                    { label: 'Pengarang', name: 'pengarang', type: 'text', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                                    { label: 'Tahun Terbit', name: 'tahun_terbit', type: 'number', min: 1000, max: new Date().getFullYear(), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                                    { label: 'Penerbit', name: 'penerbit', type: 'text', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                                    { label: 'Stok', name: 'stok', type: 'number', min: 0, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                                ].map(({ label, name, type, icon, ...rest }) => (
                                    <div key={name} className="relative">
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            {label}
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                                                </svg>
                                            </div>
                                            <input
                                                type={type}
                                                name={name}
                                                value={editBook[name]}
                                                onChange={handleEditInputChange}
                                                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 transition-all duration-200"
                                                required
                                                {...rest}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6">
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Detail
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
                                        </svg>
                                    </div>
                                    <textarea
                                        name="detail"
                                        value={editBook.detail}
                                        onChange={handleEditInputChange}
                                        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 transition-all duration-200"
                                        rows="4"
                                        placeholder="Masukkan detail buku..."
                                    />
                                </div>
                            </div>
                        </form>
                    )}
                </Modal>

                <Modal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    title="Detail Buku"
                    size="lg"
                    footer={
                        <button
                            type="button"
                            onClick={() => setIsDetailModalOpen(false)}
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 transition-colors duration-150 shadow-sm cursor-pointer"
                        >
                            Tutup
                        </button>
                    }
                >
                    {selectedBook && (
                        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
                            <div className="p-5 bg-gradient-to-r from-indigo-600 to-blue-500 border-b border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-serif font-bold text-white mb-1">{selectedBook.judul}</h2>
                                        <p className="text-gray-100 text-sm">Oleh: {selectedBook.pengarang}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${parseInt(selectedBook.stok) > 0 ? 'bg-white text-indigo-600' : 'bg-red-100 text-red-700'}`}>
                                        {parseInt(selectedBook.stok) > 0 ? `Tersedia: ${selectedBook.stok}` : 'Stok Habis'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Informasi Penerbitan</h3>
                                            <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                                                <div className="flex items-center mb-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-gray-700">Tahun Terbit: {selectedBook.tahun_terbit}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    <span className="text-gray-700">Penerbit: {selectedBook.penerbit}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Lokasi</h3>
                                            <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-gray-700">No. Rak: {selectedBook.no_rak}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col h-full">
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Deskripsi</h3>
                                        <div className="bg-gray-50 p-4 rounded-md shadow-sm flex-1">
                                            <p className="text-gray-700 whitespace-pre-line">
                                                {selectedBook.detail || "Tidak ada deskripsi untuk buku ini."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    title="Konfirmasi Hapus"
                    size="sm"
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 transition-colors duration-150 shadow-sm cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteBook}
                                className="text-white bg-red-500 hover:bg-red-600 transition-colors duration-150 shadow-sm font-medium rounded-md text-sm px-5 py-2.5 cursor-pointer"
                            >
                                Hapus
                            </button>
                        </>
                    }
                >
                    <div className="flex items-center space-x-4 p-2">
                        <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-gray-600">
                            Apakah Anda yakin ingin menghapus buku ini? Tindakan ini tidak dapat dibatalkan.
                        </p>
                    </div>
                </Modal>
            </div>
        </div>
    )
}
