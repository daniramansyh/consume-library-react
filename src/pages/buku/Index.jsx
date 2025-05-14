import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../../constant'
import axios from 'axios'

const useAuth = () => {
    const navigate = useNavigate()

    const handleUnauthorized = () => {
        localStorage.removeItem('access_token')
        navigate('/login')
    }

    return { handleUnauthorized }
}

const BukuIndex = () => {
    const [books, setBooks] = useState([])
    const [state, setState] = useState({
        error: null,
        isLoaded: false,
        alert: ''
    })

    const { handleUnauthorized } = useAuth()
    const navigate = useNavigate()

    const fetchBook = () => {
        axios.get(`${API_URL}/buku`)
            .then(res => {
                if (res.data && Array.isArray(res.data)) {
                    setBooks(res.data)
                } else {
                    setBooks([])
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

    useEffect(() => {
        fetchBook()
    }, [])

    const handleAddBook = () => {
        navigate('/buku/create')
    }

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
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Rak</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengarang</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penerbit</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {books.length > 0 ? books.map((book, index) => (
                                <tr key={book.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{book.no_rak}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900">{book.judul}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900">{book.pengarang}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{book.tahun_terbit}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900">{book.penerbit}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{book.stok}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate">{book.detail}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button className="text-blue-600 hover:text-blue-900">Detail</button>
                                        <button className="text-green-600 hover:text-green-900">Edit</button>
                                        <button className="text-red-600 hover:text-red-900">Delete</button>
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
            </div>
        </div>
    )
}

export default BukuIndex
