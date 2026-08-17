import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { DentalService } from '../../types';
import { getServices, createService, updateService, deleteService } from '../../apis/services';

const RegisterServices = () => {
    const [services, setServices] = useState<DentalService[]>([]);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<{ description: string }>({ description: '' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
    const [operationLoading, setOperationLoading] = useState({
        create: false,
        update: false,
        delete: false
    });

    const [formData, setFormData] = useState({
        description: ''
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await getServices();
            setServices(response.data || []);
        } catch (err) {
            setError('Failed to fetch services');
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setOperationLoading(prev => ({ ...prev, create: true }));
        setError('');

        try {
            await createService(formData);
            await fetchServices();
            setFormData({
                description: ''
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create service');
        } finally {
            setOperationLoading(prev => ({ ...prev, create: false }));
        }
    };

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
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

    const startEdit = (service: DentalService) => {

        setEditingId(service.ServiceId);
        setEditForm({
            description: service.Description
        });
    };

    const handleSave = async (id: number) => {
        setOperationLoading(prev => ({ ...prev, update: true }));
        try {
            await updateService(id, editForm);
            await fetchServices();
            setEditingId(null);
            setEditForm({ description: '' });
        } catch (err) {
            setError('Failed to update service');
        } finally {
            setOperationLoading(prev => ({ ...prev, update: false }));
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({ description: '' });
    };

    const handleDelete = async () => {
        setOperationLoading(prev => ({ ...prev, delete: true }));
        try {
            if (serviceToDelete === null) return;
            await deleteService(serviceToDelete);
            await fetchServices();
            setShowDeleteModal(false);
            setServiceToDelete(null);
        } catch (err) {
            setShowDeleteModal(false);
            setServiceToDelete(null);
            setError(err instanceof Error ? err.message : 'Failed to delete service');
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
                        <p className="mb-0">Are you sure you want to delete this service? This action cannot be undone.</p>
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
                            <h2 className="fw-bold mb-4">Register New Service</h2>
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <textarea
    className="form-control form-control-lg rounded-3 border-0 bg-light"
    placeholder="Service Description"
    name="description"
    value={formData.description}
    onChange={handleChange}
    rows={4}
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
                                        'Register Service'
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
                            <h2 className="fw-bold mb-4">Registered Services</h2>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col" className="fw-semibold">Description</th>
                                            <th scope="col" className="fw-semibold text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {services.map((service) => (
                                            <tr key={service.ServiceId}>
                                                <td>
                                                    {editingId === service.ServiceId ? (
                                                        <input
                                                            className="form-control form-control-sm rounded-3"
                                                            name="description"
                                                            defaultValue={service.Description}
                                                            onChange={handleEditChange}
                                                            // rows={2}
                                                        />
                                                    ) : (
                                                        service.Description
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    {editingId === service.ServiceId ? (
                                                        <div className="btn-group">
                                                            <button
                                                                className="btn btn-success btn-sm rounded-pill px-3 me-2"
                                                                onClick={() => handleSave(service.ServiceId)}
                                                                disabled={operationLoading.update}
                                                            >
                                                                {operationLoading.update ? (
                                                                    <>
                                                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                        <small>Saving...</small>
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
                                                                onClick={() => startEdit(service)}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                                                onClick={() => {
                                                                    setServiceToDelete(service.ServiceId);
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
                                        {services.length === 0 && (
                                            <tr>
                                                <td colSpan={2} className="text-center text-muted py-4">
                                                    No services registered yet
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

export default RegisterServices; 