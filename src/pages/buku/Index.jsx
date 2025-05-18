import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../../constant'
import axios from 'axios'
import Modal from '../../components/Modal'

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
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedBook, setSelectedBook] = useState(null)
    const [modalMode, setModalMode] = useState('add') // 'add', 'edit', 'detail'
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
    const navigate = useNavigate()

    const fetchBook = async () => {
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

    useEffect(() => {
        fetchBook()
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
        setModalMode('add')
        setSelectedBook(null)
        setNewBook({
            no_rak: '',
            judul: '',
            pengarang: '',
            tahun_terbit: '',
            penerbit: '',
            stok: '',
            detail: ''
        })
        setIsModalOpen(true)
    }

    const handleEditBook = (book) => {
        setModalMode('edit')
        setSelectedBook(book)
        setNewBook(book)
        setIsModalOpen(true)
    }

    const handleDetailBook = (book) => {
        setModalMode('detail')
        setSelectedBook(book)
        setNewBook(book)
        setIsModalOpen(true)
    }

    const [deleteBookId, setDeleteBookId] = useState(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const handleDeleteBook = async () => {
        try {
            await axios.delete(`${API_URL}/buku/${deleteBookId}`)
            setState(prev => ({ ...prev, alert: 'Buku berhasil dihapus!' }))
            fetchBook()
            setIsDeleteModalOpen(false)
        } catch (err) {
            err.response?.status === 401
                ? handleUnauthorized()
                : setState(prev => ({
                    ...prev,
                    error: err.response?.data || { message: "Gagal menghapus buku." }
                }))
        }
    }

    const openDeleteModal = (id) => {
        setDeleteBookId(id)
        setIsDeleteModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            let response
            if (modalMode === 'edit') {
                response = await axios.put(`${API_URL}/buku/${selectedBook.id}`, newBook)
            } else {
                response = await axios.post(`${API_URL}/buku`, newBook)
            }

            if (response.data) {
                setState(prev => ({
                    ...prev,
                    alert: `Buku berhasil ${modalMode === 'edit' ? 'diperbarui' : 'ditambahkan'}!`
                }))
                fetchBook()
                handleCloseModal()
            }
        } catch (err) {
            err.response?.status === 401
                ? handleUnauthorized()
                : setState(prev => ({
                    ...prev,
                    error: err.response?.data || { message: `Gagal ${modalMode === 'edit' ? 'memperbarui' : 'menambahkan'} buku.` }
                }))
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
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

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setNewBook(prev => ({ ...prev, [name]: value }))
    }

    if (!state.isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600"></div>
            </div>
        )
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
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Daftar Buku</h1>
                    <button
                        onClick={handleAddBook}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                        <i className="bi bi-plus-circle mr-2"></i>
                        <span>Tambah Buku Baru</span>
                    </button>
                </div>

                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="w-full table-auto divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                <th className="px-3 py-2">No. Rak</th>
                                <th className="px-3 py-2">Judul</th>
                                <th className="px-3 py-2">Pengarang</th>
                                <th className="px-3 py-2">Tahun</th>
                                <th className="px-3 py-2">Penerbit</th>
                                <th className="px-3 py-2">Stok</th>
                                <th className="px-3 py-2">Detail</th>
                                <th className="px-3 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {books.length > 0 ? books.map((book, index) => (
                                <tr key={book.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2">{index + 1}</td>
                                    <td className="px-3 py-2">{book.no_rak}</td>
                                    <td className="px-3 py-2">{book.judul}</td>
                                    <td className="px-3 py-2">{book.pengarang}</td>
                                    <td className="px-3 py-2">{book.tahun_terbit}</td>
                                    <td className="px-3 py-2">{book.penerbit}</td>
                                    <td className="px-3 py-2">{book.stok}</td>
                                    <td className="px-3 py-2 max-w-xs truncate">{book.detail}</td>
                                    <td className="px-3 py-2 space-x-2">
                                        <button
                                            onClick={() => handleDetailBook(book)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Detail
                                        </button>
                                        <button
                                            onClick={() => handleEditBook(book)}
                                            className="text-green-600 hover:text-green-800"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(book.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="9" className="px-3 py-2 text-center text-sm text-gray-500">
                                        Tidak ada buku yang tersedia saat ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={modalMode === 'add' ? 'Tambah Buku Baru' :
                        modalMode === 'edit' ? 'Edit Buku' : 'Detail Buku'}
                    size="lg"
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:z-10 focus:ring-4 focus:ring-gray-100"
                            >
                                {modalMode === 'detail' ? 'Tutup' : 'Batal'}
                            </button>
                            {modalMode !== 'detail' && (
                                <button
                                    type="submit"
                                    form="bookForm"
                                    className="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                >
                                    {modalMode === 'edit' ? 'Perbarui' : 'Simpan'}
                                </button>
                            )}
                        </>
                    }
                >
                    <form id="bookForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: 'No. Rak', name: 'no_rak', type: 'text' },
                            { label: 'Judul', name: 'judul', type: 'text' },
                            { label: 'Pengarang', name: 'pengarang', type: 'text' },
                            { label: 'Tahun Terbit', name: 'tahun_terbit', type: 'number', min: 1000, max: new Date().getFullYear() },
                            { label: 'Penerbit', name: 'penerbit', type: 'text' },
                            { label: 'Stok', name: 'stok', type: 'number', min: 0 },
                        ].map(({ label, name, type, ...rest }) => (
                            <div key={name}>
                                <label className="block mb-2 text-sm font-medium text-gray-900">
                                    {label}
                                </label>
                                <input
                                    type={type}
                                    name={name}
                                    value={newBook[name]}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                                    required
                                    disabled={modalMode === 'detail'}
                                    {...rest}
                                />
                            </div>
                        ))}
                        <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-medium text-gray-900">
                                Detail
                            </label>
                            <textarea
                                name="detail"
                                value={newBook.detail}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                                rows="3"
                                disabled={modalMode === 'detail'}
                            />
                        </div>
                    </form>
                </Modal>
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
                                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteBook}
                                className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-5 py-2.5"
                            >
                                Hapus
                            </button>
                        </>
                    }
                >
                    <p className="text-gray-600">
                        Apakah Anda yakin ingin menghapus member ini? Tindakan ini tidak dapat dibatalkan.
                    </p>
                </Modal>
            </div>
        </div>

    )


}
