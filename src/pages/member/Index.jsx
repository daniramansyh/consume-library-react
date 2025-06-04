import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../../constant'
import axios from 'axios'
import Modal from '../../components/Modal'
import { usePDF } from 'react-to-pdf';
import {
    UsersIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    ClockIcon
} from "@heroicons/react/24/outline";

const useAuth = () => {
    const navigate = useNavigate()
    const handleUnauthorized = () => {
        localStorage.removeItem('access_token')
        navigate('/login')
    }
    return { handleUnauthorized }
}

export default function MemberIndex() {
    const [members, setMembers] = useState([]);
    const [state, setState] = useState({ error: null, isLoaded: false, alert: '' });
    const [newMember, setNewMember] = useState({ no_ktp: '', nama: '', alamat: '', tgl_lahir: '' });
    const [selectedMember, setSelectedMember] = useState(null);
    const [books, setBooks] = useState([]);
    const [borrowHistory, setBorrowHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const { handleUnauthorized } = useAuth();
    const { toPDF, targetRef } = usePDF({ filename: 'page.pdf' });

    // Modal states
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);

    useEffect(() => {
        fetchMember();
        fetchBook();
    }, []);

    const fetchMember = () => {
        axios.get(`${API_URL}/member`)
            .then(res => {
                setMembers(Array.isArray(res.data) ? res.data : []);
                setState(prev => ({ ...prev, isLoaded: true }));
            })
            .catch(err => {
                err.response?.status === 401
                    ? handleUnauthorized()
                    : setState(prev => ({ ...prev, error: err.response?.data || { message: 'Failed to fetch data.' } }));
            });
    };

    const fetchBook = () => {
        axios.get(`${API_URL}/buku`)
            .then(res => {
                setBooks(Array.isArray(res.data) ? res.data : [])
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMember(prev => ({ ...prev, [name]: value }));
    };

    // Add Member Modal & Functions
    const openAddModal = () => {
        setNewMember({ no_ktp: '', nama: '', alamat: '', tgl_lahir: '' });
        setAddModalOpen(true);
    };

    const handelDetailModal = (member) => {
        setSelectedMember(member);
        setDetailModalOpen(true);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        axios.post(`${API_URL}/member`, newMember)
            .then(response => {
                if (response.data) {
                    setState(prev => ({ ...prev, alert: 'Member berhasil ditambahkan!' }));
                    fetchMember();
                    setAddModalOpen(false);
                }
            })
            .catch(err => {
                err.response?.status === 401
                    ? handleUnauthorized()
                    : setState(prev => ({
                        ...prev,
                        error: err.response?.data || { message: 'Gagal menambahkan member.' }
                    }));
            });
    };

    // Edit Member Modal & Functions
    const openEditModal = (member) => {
        setSelectedMember(member);
        setNewMember({
            no_ktp: member.no_ktp,
            nama: member.nama,
            alamat: member.alamat,
            tgl_lahir: member.tgl_lahir.split('T')[0]
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        axios.put(`${API_URL}/member/${selectedMember.id}`, newMember)
            .then(response => {
                if (response.data) {
                    setState(prev => ({ ...prev, alert: 'Member berhasil diperbarui!' }));
                    fetchMember();
                    setEditModalOpen(false);
                }
            })
            .catch(err => {
                err.response?.status === 401
                    ? handleUnauthorized()
                    : setState(prev => ({
                        ...prev,
                        error: err.response?.data || { message: 'Gagal memperbarui member.' }
                    }));
            });
    };

    // Delete Member Modal & Functions
    const openDeleteModal = (member) => {
        setSelectedMember(member);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        axios.delete(`${API_URL}/member/${selectedMember.id}`)
            .then(() => {
                setState(prev => ({ ...prev, alert: 'Member berhasil dihapus!' }));
                fetchMember();
                setDeleteModalOpen(false);
            })
            .catch(err => {
                err.response?.status === 401
                    ? handleUnauthorized()
                    : setState(prev => ({
                        ...prev,
                        error: err.response?.data || { message: 'Gagal menghapus member.' }
                    }));
            });
    };

    // History Modal & Functions
    const openHistoryModal = (member) => {
        setSelectedMember(member);
        setHistoryModalOpen(true);
        setHistoryLoading(true);

        axios.get(`${API_URL}/peminjaman/${member.id}`)
            .then(response => {
                setBorrowHistory(Array.isArray(response.data.data) ? response.data.data : []);
            })
            .catch(err => {
                err.response?.status === 401
                    ? handleUnauthorized()
                    : setState(prev => ({
                        ...prev,
                        error: err.response?.data || { message: 'Gagal memuat riwayat peminjaman.' }
                    }));
            })
            .finally(() => {
                setHistoryLoading(false);
            });
    };

    if (!state.isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
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

                <div className="flex justify-between items-center mb-8 mt-8 px-4">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-gray-800 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                            Daftar Member
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Kelola data member perpustakaan dengan mudah dan efisien
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg hover:from-indigo-700 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <PlusIcon className="w-6 h-6 mr-1" />
                        <span>Tambah Member</span>
                    </button>
                </div>

                <div className="overflow-hidden bg-white rounded-lg shadow-md">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">No. KTP</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Alamat</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Tanggal Lahir</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {members.length > 0 ? members.map((member, index) => (
                                <tr key={member.id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-4 py-3 whitespace-nowrap">{index + 1}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{member.no_ktp}</td>
                                    <td className="px-4 py-3 font-medium text-gray-700">{member.nama}</td>
                                    <td className="px-4 py-3">{member.alamat}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {new Date(member.tgl_lahir).toLocaleDateString('id-ID', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handelDetailModal(member)}
                                                className="text-gray-500 hover:text-blue-600 transition-colors duration-150"
                                                title="Detail"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(member)}
                                                className="text-gray-500 hover:text-green-700 transition-colors duration-150"
                                                title="Edit"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(member)}
                                                className="text-gray-500 hover:text-red-600 transition-colors duration-150"
                                                title="Hapus"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => openHistoryModal(member)}
                                                className="text-gray-500 hover:text-violet-700 transition-colors duration-150"
                                                title="Riwayat"
                                            >
                                                <ClockIcon className='w-5 h-5' />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-6 text-center text-gray-500 italic">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <UsersIcon className="w-6 h-6" />
                                            <span>Tidak ada member yang tersedia saat ini.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Member Modal */}
            <Modal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                title="Tambah Member Baru"
                size="lg"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setAddModalOpen(false)}
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            form="addMemberForm"
                            className="text-white bg-gray-600 hover:bg-gray-700 font-medium rounded-lg text-sm px-5 py-2.5"
                        >
                            Simpan
                        </button>
                    </>
                }
            >
                <form id="addMemberForm" onSubmit={handleAddSubmit} className="grid grid-cols-1 gap-4">
                    {[
                        { label: 'No. KTP', name: 'no_ktp', type: 'text' },
                        { label: 'Nama', name: 'nama', type: 'text' },
                        { label: 'Tanggal Lahir', name: 'tgl_lahir', type: 'date' },
                        { label: 'Alamat', name: 'alamat', type: 'textarea', rows: 3 }
                    ].map(({ label, name, type, ...rest }) => (
                        <div key={name}>
                            <label className="block mb-2 text-sm font-medium text-gray-900">{label}</label>
                            {type === 'textarea' ? (
                                <textarea
                                    name={name}
                                    value={newMember[name]}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                                    {...rest}
                                />
                            ) : (
                                <input
                                    type={type}
                                    name={name}
                                    value={newMember[name]}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                                    required
                                    {...rest}
                                />
                            )}
                        </div>
                    ))}
                </form>
            </Modal>

            {/* Detail Member Modal */}
            <Modal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title="Detail Member"
                size="lg"
                footer={
                    <button
                        type="button"
                        onClick={() => setDetailModalOpen(false)}
                        className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 transition-colors duration-150 shadow-sm cursor-pointer"
                    >
                        Tutup
                    </button>
                }
            >
                {selectedMember && (
                    <div className="bg-white rounded-lg overflow-hidden">
                        <div className="p-6 space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full flex items-center justify-center">
                                    <UsersIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedMember.nama}</h3>
                                    <p className="text-sm text-gray-500">Member ID: {selectedMember.id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">No. KTP</h4>
                                    <p className="text-gray-900">{selectedMember.no_ktp}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Tanggal Lahir</h4>
                                    <p className="text-gray-900">
                                        {new Date(selectedMember.tgl_lahir).toLocaleDateString('id-ID', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Alamat</h4>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedMember.alamat}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Member Modal */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title="Edit Member"
                size="lg"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setEditModalOpen(false)}
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            form="editMemberForm"
                            className="text-white bg-gray-600 hover:bg-gray-700 font-medium rounded-lg text-sm px-5 py-2.5"
                        >
                            Perbarui
                        </button>
                    </>
                }
            >
                <form id="editMemberForm" onSubmit={handleEditSubmit} className="grid grid-cols-1 gap-4">
                    {[
                        { label: 'No. KTP', name: 'no_ktp', type: 'text' },
                        { label: 'Nama', name: 'nama', type: 'text' },
                        { label: 'Tanggal Lahir', name: 'tgl_lahir', type: 'date' },
                        { label: 'Alamat', name: 'alamat', type: 'textarea', rows: 3 }
                    ].map(({ label, name, type, ...rest }) => (
                        <div key={name}>
                            <label className="block mb-2 text-sm font-medium text-gray-900">{label}</label>
                            {type === 'textarea' ? (
                                <textarea
                                    name={name}
                                    value={newMember[name]}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                                    {...rest}
                                />
                            ) : (
                                <input
                                    type={type}
                                    name={name}
                                    value={newMember[name]}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                                    required
                                    {...rest}
                                />
                            )}
                        </div>
                    ))}
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Konfirmasi Hapus"
                size="sm"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setDeleteModalOpen(false)}
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
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

            {/* History Modal */}
            <Modal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                title={`Riwayat Peminjaman - ${selectedMember?.nama || ''}`}
                size="xl"
                footer={
                    <>
                        <button
                            onClick={() => toPDF()}
                            className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 cursor-pointer transition-colors duration-200 flex items-center gap-2"
                        >
                            <i className="bi bi-download"></i>
                            Download PDF
                        </button>
                    </>
                }
            >
                {historyLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-600"></div>
                    </div>
                ) : (
                    <div ref={targetRef} style={{
                        overflowX: 'auto'
                    }}>
                        <table style={{
                            width: '100%',
                            fontSize: '0.875rem',
                            textAlign: 'left',
                            color: '#6b7280'
                        }}>
                            <thead style={{
                                fontSize: '0.75rem',
                                color: '#374151',
                                textTransform: 'uppercase',
                                backgroundColor: '#f9fafb'
                            }}>
                                <tr>
                                    <th style={{padding: '0.75rem 1.5rem'}}>No</th>
                                    <th style={{padding: '0.75rem 1.5rem'}}>Judul Buku</th>
                                    <th style={{padding: '0.75rem 1.5rem'}}>Tanggal Pinjam</th>
                                    <th style={{padding: '0.75rem 1.5rem'}}>Tanggal Kembali</th>
                                    <th style={{padding: '0.75rem 1.5rem'}}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {borrowHistory.length === 0 ? (
                                    <tr style={{
                                        backgroundColor: '#ffffff',
                                        borderBottom: '1px solid #e5e7eb'
                                    }}>
                                        <td colSpan="5" style={{
                                            padding: '1rem 1.5rem',
                                            textAlign: 'center'
                                        }}>
                                            Tidak ada riwayat peminjaman
                                        </td>
                                    </tr>
                                ) : (
                                    borrowHistory.map((history, index) => {
                                        const book = books.find(b => b.id === history.id_buku);
                                        return (
                                            <tr key={history.id} style={{
                                                backgroundColor: '#ffffff',
                                                borderBottom: '1px solid #e5e7eb',
                                                transition: 'background-color 0.2s',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}>
                                                <td style={{padding: '1rem 1.5rem'}}>{index + 1}</td>
                                                <td style={{padding: '1rem 1.5rem'}}>{book ? book.judul : history.id_buku}</td>
                                                <td style={{padding: '1rem 1.5rem'}}>
                                                    {new Date(history.tgl_pinjam).toLocaleDateString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td style={{padding: '1rem 1.5rem'}}>
                                                    {history.tgl_pengembalian ?
                                                        new Date(history.tgl_pengembalian).toLocaleDateString('id-ID', {
                                                            day: '2-digit',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        }) :
                                                        '-'
                                                    }
                                                </td>
                                                <td style={{padding: '1rem 1.5rem'}}>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        borderRadius: '9999px',
                                                        backgroundColor: history.status === 0 ? '#fef3c7' : '#d1fae5',
                                                        color: history.status === 0 ? '#92400e' : '#065f46'
                                                    }}>
                                                        {history.status === 0 ? 'Belum Dikembalikan' : 'Sudah Dikembalikan'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Modal>
        </div>
    );
}