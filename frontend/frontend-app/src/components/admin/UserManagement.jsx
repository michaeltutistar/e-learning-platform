import React, { useState, useEffect } from 'react'
import SearchInput from '../common/SearchInput'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 20,
    estado: '',
    rol: '',
    search: ''
  })
  const [selectedUsers, setSelectedUsers] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [showBulkModal, setShowBulkModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(filters)
      const response = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setPagination(data.pagination)
      } else {
        setError('Error al cargar usuarios')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }))
    setSelectedUsers([]) // Clear selection when filtering
  }

  const handleSearchChange = (value) => {
    setFilters(prev => ({
      ...prev,
      search: value,
      page: 1
    }))
    setSelectedUsers([]) // Clear selection when filtering
  }

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleUserUpdate = async (userId, updates) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        fetchUsers() // Refresh the list
      } else {
        setError('Error al actualizar usuario')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  const handleBulkUpdate = async () => {
    if (!bulkAction || selectedUsers.length === 0) return

    try {
      const updates = {}
      if (bulkAction === 'activate') updates.estado_cuenta = 'activa'
      if (bulkAction === 'deactivate') updates.estado_cuenta = 'inactiva'
      if (bulkAction === 'suspend') updates.estado_cuenta = 'suspendida'
      if (bulkAction === 'make_instructor') updates.rol = 'instructor'
      if (bulkAction === 'make_student') updates.rol = 'estudiante'

      const response = await fetch('/api/admin/users/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          user_ids: selectedUsers,
          updates
        })
      })
      
      if (response.ok) {
        setSelectedUsers([])
        setBulkAction('')
        setShowBulkModal(false)
        fetchUsers()
      } else {
        setError('Error en actualización masiva')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/users/export', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'usuarios_registrados.xlsx'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      setError('Error al exportar')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      activa: 'bg-green-100 text-green-800',
      inactiva: 'bg-yellow-100 text-yellow-800',
      suspendida: 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-800',
      instructor: 'bg-blue-100 text-blue-800',
      estudiante: 'bg-green-100 text-green-800'
    }
    return badges[role] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando usuarios...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              👥 Gestión de Usuarios
            </h2>
            <p className="text-gray-600">
              Administración completa de usuarios del sistema
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              📥 Exportar Excel
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SearchInput
            placeholder="Nombre, email, documento..."
            onSearch={handleSearchChange}
            defaultValue={filters.search}
            label="Buscar"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.estado}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="activa">Activa</option>
              <option value="inactiva">Inactiva</option>
              <option value="suspendida">Suspendida</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={filters.rol}
              onChange={(e) => handleFilterChange('rol', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="estudiante">Estudiante</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Por página
            </label>
            <select
              value={filters.per_page}
              onChange={(e) => handleFilterChange('per_page', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Acciones Masivas */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-blue-800">
              {selectedUsers.length} usuario(s) seleccionado(s)
            </p>
            <div className="flex space-x-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Seleccionar acción...</option>
                <option value="activate">Activar</option>
                <option value="deactivate">Desactivar</option>
                <option value="suspend">Suspender</option>
                <option value="make_instructor">Hacer Instructor</option>
                <option value="make_student">Hacer Estudiante</option>
              </select>
              <button
                onClick={() => setShowBulkModal(true)}
                disabled={!bulkAction}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Aplicar
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(u => u.id))
                      } else {
                        setSelectedUsers([])
                      }
                    }}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Convocatoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id])
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                        }
                      }}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.nombre} {user.apellido}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.tipo_documento} - {user.numero_documento}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.convocatoria ? `Conv. ${user.convocatoria}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.rol)}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.estado_cuenta)}`}>
                      {user.estado_cuenta}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.fecha_creacion).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <select
                        value={user.estado_cuenta}
                        onChange={(e) => handleUserUpdate(user.id, { estado_cuenta: e.target.value })}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="activa">Activa</option>
                        <option value="inactiva">Inactiva</option>
                        <option value="suspendida">Suspendida</option>
                      </select>
                      <select
                        value={user.rol}
                        onChange={(e) => handleUserUpdate(user.id, { rol: e.target.value })}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="estudiante">Estudiante</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => window.open(`/api/admin/users/${user.id}/documento`, '_blank')}
                        className="text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"
                        title="Ver documento PDF"
                      >
                        Documento
                      </button>
                      <button
                        onClick={() => window.open(`/api/admin/users/${user.id}/requisitos`, '_blank')}
                        className="text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"
                        title="Ver requisitos PDF"
                      >
                        Requisitos
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((pagination.page - 1) * pagination.per_page) + 1} a{' '}
              {Math.min(pagination.page * pagination.per_page, pagination.total)} de{' '}
              {pagination.total} resultados
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.has_prev}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Página {pagination.page} de {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.has_next}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Masiva */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirmar Acción Masiva
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                ¿Estás seguro de que quieres aplicar esta acción a {selectedUsers.length} usuario(s)?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleBulkUpdate}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}

export default UserManagement 