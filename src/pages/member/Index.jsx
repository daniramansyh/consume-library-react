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

export default function MemberIndex(){
    const [members, setMembers] = useState([])
    const [state, setState] = useState({
        error: null,
        isLoaded: false,
        alert: ''
    })
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState('add') // 'add', 'edit', 'detail'
    const [selectedMember, setSelectedMember] = useState(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleteMemberId, setDeleteMemberId] = useState(null)
    const [newMember, setNewMember] = useState({
        no_ktp: '',
        nama: '',
        alamat: '',
        tgl_lahir: ''
    })

    const { handleUnauthorized } = useAuth()
    const navigate = useNavigate()

    const fetchMember = () => {
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

    useEffect(() => {
        fetchMember()
    }, [])

    if (!state.isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600"></div>
            </div>
        )
    }

    const handleAddMember = () => {
        setModalMode('add')
        setSelectedMember(null)
        setNewMember({
            no_ktp: '',
            nama: '',
            alamat: '',
            tgl_lahir: ''
        })
        setIsModalOpen(true)
    }

    const handleEditMember = (member) => {
        setModalMode('edit')
        setSelectedMember(member)
        setNewMember({
            no_ktp: member.no_ktp,
            nama: member.nama,
            alamat: member.alamat,
            tgl_lahir: member.tgl_lahir.split('T')[0]
        })
        setIsModalOpen(true)
    }

    const handleDetailMember = (member) => {
        setModalMode('detail')
        setSelectedMember(member)
        setNewMember({
            no_ktp: member.no_ktp,
            nama: member.nama,
            alamat: member.alamat,
            tgl_lahir: member.tgl_lahir.split('T')[0]
        })
        setIsModalOpen(true)
    }

    const openDeleteModal = (id) => {
        setDeleteMemberId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteMember = async () => {
        try {
            await axios.delete(`${API_URL}/member/${deleteMemberId}`)
            setState(prev => ({ ...prev, alert: 'Member berhasil dihapus!' }))
            fetchMember()
            setIsDeleteModalOpen(false)
        } catch (err) {
            err.response?.status === 401
                ? handleUnauthorized()
                : setState(prev => ({
                    ...prev,
                    error: err.response?.data || { message: "Gagal menghapus member." }
                }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            let response
            if (modalMode === 'edit') {
                response = await axios.put(`${API_URL}/member/${selectedMember.id}`, newMember)
            } else {
                response = await axios.post(`${API_URL}/member`, newMember)
            }

            if (response.data) {
                setState(prev => ({
                    ...prev,
                    alert: `Member berhasil ${modalMode === 'edit' ? 'diperbarui' : 'ditambahkan'}!`
                }))
                fetchMember()
                handleCloseModal()
            }
        } catch (err) {
            err.response?.status === 401
                ? handleUnauthorized()
                : setState(prev => ({
                    ...prev,
                    error: err.response?.data || {
                        message: `Gagal ${modalMode === 'edit' ? 'memperbarui' : 'menambahkan'} member.`
                    }
                }))
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setNewMember({
            no_ktp: '',
            nama: '',
            alamat: '',
            tgl_lahir: ''
        })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setNewMember(prev => ({ ...prev, [name]: value }))
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
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Daftar Member</h1>
                    <button
                        onClick={handleAddMember}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                        <i className="bi bi-plus-circle mr-2"></i>
                        <span>Add New Member</span>
                    </button>
                </div>

                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="w-full table-auto divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. KTP</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Lahir</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {members.map((member, index) => (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{member.no_ktp}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900">{member.nama}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate">{member.alamat}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(member.tgl_lahir).toLocaleDateString()}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => handleDetailMember(member)} className="text-blue-600 hover:text-blue-800">
                                            Detail
                                        </button>
                                        <button onClick={() => handleEditMember(member)} className="text-green-600 hover:text-green-800">
                                            Edit
                                        </button>
                                        <button onClick={() => openDeleteModal(member.id)} className="text-red-600 hover:text-red-800">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {members.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-3 py-2 text-center text-sm text-gray-500">
                                        Tidak ada member yang tersedia saat ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={modalMode === 'add' ? 'Tambah Member Baru' :
                    modalMode === 'edit' ? 'Edit Member' : 'Detail Member'}
                size="lg"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100"
                        >
                            {modalMode === 'detail' ? 'Tutup' : 'Batal'}
                        </button>
                        {modalMode !== 'detail' && (
                            <button
                                type="submit"
                                form="memberForm"
                                className="text-white bg-gray-600 hover:bg-gray-700 font-medium rounded-lg text-sm px-5 py-2.5"
                            >
                                {modalMode === 'edit' ? 'Perbarui' : 'Simpan'}
                            </button>
                        )}
                    </>
                }
            >
                <form id="memberForm" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
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
                                    disabled={modalMode === 'detail'}
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
                                    disabled={modalMode === 'detail'}
                                    {...rest}
                                />
                            )}
                        </div>
                    ))}
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
                            onClick={handleDeleteMember}
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
    )
}
