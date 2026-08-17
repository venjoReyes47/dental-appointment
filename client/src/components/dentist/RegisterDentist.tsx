import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { Dentist, RegisterPayload } from '../../types';
import { getDentist, createDentist, updateDentist, deleteDentist } from '../../apis/services';

const RegisterDentist = () => {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<RegisterPayload>>({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [dentistToDelete, setDentistToDelete] = useState<number | null>(null);
    const [operationLoading, setOperationLoading] = useState({
        create: false,
        update: false,
        delete: false
    });

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: ''
    });
    const [dentists, setDentists] = useState<Dentist[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDentists();
    }, []);

    const fetchDentists = async () => {
        try {
            const response = await getDentist();
            setDentists(response.data || []);
        } catch (err) {
            setError('Failed to fetch dentists');
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setOperationLoading(prev => ({ ...prev, create: true }));
        setError('');

        try {
            await createDentist(formData)
            await fetchDentists();
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                        phone: ''
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to register dentist');
        } finally {
            setOperationLoading(prev => ({ ...prev, create: false }));
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const startEdit = (dentist: Dentist) => {
        setEditingId(dentist.userId);
        setEditForm({
            firstName: dentist.firstName,
            lastName: dentist.lastName,
            email: dentist.email,
            phone: dentist.phone ?? ''
        });
    };

    const handleSave = async (id: number) => {
        setOperationLoading(prev => ({ ...prev, update: true }));
        try {
            await updateDentist(id, editForm);
            await fetchDentists();
            setEditingId(null);
            setEditForm({});
        } catch (err) {
            setError('Failed to update dentist');
        } finally {
            setOperationLoading(prev => ({ ...prev, update: false }));
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleDelete = async () => {
        setOperationLoading(prev => ({ ...prev, delete: true }));
        try {
            if (dentistToDelete === null) return;
            await deleteDentist(dentistToDelete);
            await fetchDentists();
            setShowDeleteModal(false);
            setDentistToDelete(null);
        } catch (err) {
            setShowDeleteModal(false);
            setDentistToDelete(null);
            setError(err instanceof Error ? err.message : 'Failed to delete dentist');
        } finally {
            setOperationLoading(prev => ({ ...prev, delete: false }));
        }
    };

    const DeleteConfirmationModal = () => (
        <div
            className={`modal fade ${showDeleteModal ? 'show' : ''}`}
            style={{ display: showDeleteModal ? 'block' : 'none' }}
            tabIndex={-1}
            role="dialog"
            aria-labelledby="deleteModalLabel"
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 border-0 shadow">
                    <div className="modal-header border-0">
                        <h5 className="modal-title fw-bold" id="deleteModalLabel">Confirm Delete</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowDeleteModal(false)}
                            aria-label="Close"
                        />
                    </div>
                    <div className="modal-body py-4">
                        <p className="mb-0">Are you sure you want to delete this dentist? This action cannot be undone.</p>
                    </div>
                    <div className="modal-footer border-0">
                        <button
                            type="button"
                            className="btn btn-light rounded-pill px-4"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger rounded-pill px-3 py-1"
                            onClick={handleDelete}
                            disabled={operationLoading.delete}
                        >
                            {operationLoading.delete ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                    <small>Deleting...</small>
                                </>
                            ) : (
                                'Delete'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
    return (
        <div className="container py-5 mt-5">
            <div className="row flex-column-reverse flex-lg-row">
                {/* Form Section */}
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <div className="card-body">
                            <h2 className="fw-bold mb-4">Register New Dentist</h2>
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        className="form-control rounded-3 border-0 bg-light"
                                        placeholder="First Name"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        className="form-control  rounded-3 border-0 bg-light"
                                        placeholder="Last Name"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="email"
                                        className="form-control  rounded-3 border-0 bg-light"
                                        placeholder="Email Address"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="password"
                                        className="form-control  rounded-3 border-0 bg-light"
                                        placeholder="Password"
                                        name="password"
                                        minLength={8}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <input
                                        type="tel"
                                        className="form-control  rounded-3 border-0 bg-light"
                                        placeholder="Phone Number"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-dark w-100 rounded-pill py-2 fw-semibold"
                                    disabled={operationLoading.create}
                                >
                                    {operationLoading.create ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                            <small>Registering...</small>
                                        </>
                                    ) : (
                                        'Register Dentist'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="col-lg-7 mb-4 mb-lg-0">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body">
                            <h2 className="fw-bold mb-4">Registered Dentists</h2>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col" className="fw-semibold">Name</th>
                                            <th scope="col" className="fw-semibold">Email</th>
                                            <th scope="col" className="fw-semibold">Phone</th>
                                            <th scope="col" className="fw-semibold text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dentists.map((dentist) => (
                                            <tr key={dentist.userId}>
                                                <td>
                                                    {editingId === dentist.userId ? (
                                                        <div className="d-flex gap-2">
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm rounded-3"
                                                                name="firstName"
                                                                value={editForm.firstName}
                                                                onChange={handleEditChange}
                                                            />
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm rounded-3"
                                                                name="lastName"
                                                                value={editForm.lastName}
                                                                onChange={handleEditChange}
                                                            />
                                                        </div>
                                                    ) : (
                                                        `${dentist.firstName} ${dentist.lastName}`
                                                    )}
                                                </td>
                                                <td>
                                                    {editingId === dentist.userId ? (
                                                        <input
                                                            type="email"
                                                            className="form-control form-control-sm rounded-3"
                                                            name="email"
                                                            value={editForm.email}
                                                            onChange={handleEditChange}
                                                        />
                                                    ) : (
                                                        dentist.email
                                                    )}
                                                </td>
                                                <td>
                                                    {editingId === dentist.userId ? (
                                                        <input
                                                            type="tel"
                                                            className="form-control form-control-sm rounded-3"
                                                            name="phone"
                                                            value={editForm.phone}
                                                            onChange={handleEditChange}
                                                        />
                                                    ) : (
                                                        dentist.phone
                                                    )}
                                                </td>
                                                <td className="text-end">
                                                    {editingId === dentist.userId ? (
                                                        <div className="btn-group">
                                                            <button
                                                                className="btn btn-success btn-sm rounded-pill px-3 me-2"
                                                                onClick={() => handleSave(dentist.userId)}
                                                                disabled={operationLoading.update}
                                                            >
                                                                {operationLoading.update ? (
                                                                    <>
                                                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>

                                                                    </>
                                                                ) : (
                                                                    'Save'
                                                                )}
                                                            </button>
                                                            <button
                                                                className="btn btn-light btn-sm rounded-pill px-3"
                                                                onClick={handleCancel}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="btn-group">
                                                            <button
                                                                className="btn btn-outline-dark btn-sm rounded-pill px-3 me-2"
                                                                onClick={() => startEdit(dentist)}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                                                onClick={() => {
                                                                    setDentistToDelete(dentist.userId);
                                                                    setShowDeleteModal(true);
                                                                }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {dentists.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="text-center text-muted py-4">
                                                    No dentists registered yet
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <DeleteConfirmationModal />
        </div>
    );
};

export default RegisterDentist; 