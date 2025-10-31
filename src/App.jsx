import { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Form, Button, Table,
  Toast, ToastContainer, InputGroup
} from 'react-bootstrap';
import './App.css';

// Key for localStorage
const LOCAL_STORAGE_KEY = 'crud-products-data-full';

// Define initial state for the form to make resetting easier
const initialFormState = {
  name: '',
  description: '',
  price: '',
  category: '',
  releaseDate: '',
  stock: 0,
  isActive: true,
};

// Pre-defined categories for the dropdown
const categories = ["Elektronik", "Pakaian", "Makanan", "Minuman", "Lainnya"];

export default function App() {
  // --- STATES ---
  const [products, setProducts] = useState(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : [];
  });

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Toast notification states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  const isEditing = editingId !== null;

  // --- LOCAL STORAGE EFFECT ---
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  // --- FUNCTIONS ---

  // Handle changes in any form input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear validation error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validation function for all fields
  const validate = () => {
    const newErrors = {};
    const { name, description, price, category, releaseDate, stock } = formData;

    // Name validation
    if (!name.trim()) newErrors.name = 'Nama Produk wajib diisi.';
    else if (name.trim().length > 100) newErrors.name = 'Nama Produk maksimal 100 karakter.';
    else {
      const isDuplicate = products.some(p => p.name.toLowerCase() === name.trim().toLowerCase() && p.id !== editingId);
      if (isDuplicate) newErrors.name = 'Nama Produk sudah ada.';
    }

    // Description validation
    if (description.trim() && description.trim().length < 20) {
      newErrors.description = 'Deskripsi minimal 20 karakter.';
    }

    // Price validation
    if (!price) newErrors.price = 'Harga wajib diisi.';
    else if (isNaN(price) || Number(price) <= 0) newErrors.price = 'Harga harus angka dan lebih dari 0.';

    // Category validation
    if (!category) newErrors.category = 'Kategori wajib dipilih.';

    // Release Date validation
    if (!releaseDate) newErrors.releaseDate = 'Tanggal rilis wajib diisi.';
    else if (new Date(releaseDate) > new Date()) newErrors.releaseDate = 'Tanggal rilis tidak boleh di masa depan.';

    // Stock validation
    if (stock === '' || isNaN(stock) || Number(stock) < 0) newErrors.stock = 'Stok harus angka dan minimal 0.';

    return newErrors;
  };

  const showToastMsg = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToastMsg('Periksa kembali input Anda.', 'danger');
      return;
    }

    if (isEditing) {
      // Update existing product
      setProducts(prev =>
        prev.map(p => (p.id === editingId ? { ...p, ...formData, price: Number(formData.price), stock: Number(formData.stock) } : p))
      );
      showToastMsg('Produk berhasil diperbarui.', 'primary');
    } else {
      // Add new product
      const newProduct = {
        id: Date.now(),
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      };
      setProducts(prev => [newProduct, ...prev]);
      showToastMsg('Produk berhasil ditambahkan.', 'success');
    }
    resetForm();
  };

  const handleEdit = (product) => {
    setFormData(product);
    setEditingId(product.id);
    setErrors({});
  };

  const handleDelete = (id) => {
    const target = products.find(p => p.id === id);
    if (!target) return;

    if (window.confirm(`Hapus Produk "${target.name}"?`)) {
      setProducts(prev => prev.filter(p => p.id !== id));
      if (editingId === id) resetForm();
      showToastMsg('Produk berhasil dihapus.', 'success');
    }
  };

  return (
    <>
      <Container className="py-4">
        <h2 className="text-center mb-4">Manajemen Produk</h2>
        <Row>
          {/* --- FORM COLUMN --- */}
          <Col lg={5}>
            <Card className="mb-4">
              <Card.Header as="h5">{isEditing ? 'Edit Produk' : 'Tambah Produk'}</Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit} noValidate>
                  {/* Name */}
                  <Form.Group className="mb-3">
                    <Form.Label>Nama Produk</Form.Label>
                    <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} isInvalid={!!errors.name} maxLength={100} />
                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                  </Form.Group>

                  {/* Description */}
                  <Form.Group className="mb-3">
                    <Form.Label>Deskripsi</Form.Label>
                    <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleInputChange} isInvalid={!!errors.description} />
                    <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                  </Form.Group>

                  {/* Price */}
                  <Form.Group className="mb-3">
                    <Form.Label>Harga</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>Rp</InputGroup.Text>
                      <Form.Control type="number" name="price" value={formData.price} onChange={handleInputChange} isInvalid={!!errors.price} placeholder="Contoh: 50000" />
                      <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  {/* Category */}
                  <Form.Group className="mb-3">
                    <Form.Label>Kategori</Form.Label>
                    <Form.Select name="category" value={formData.category} onChange={handleInputChange} isInvalid={!!errors.category}>
                      <option value="">Pilih Kategori...</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
                  </Form.Group>
                  
                  <Row>
                    {/* Release Date */}
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tanggal Rilis</Form.Label>
                        <Form.Control type="date" name="releaseDate" value={formData.releaseDate} onChange={handleInputChange} isInvalid={!!errors.releaseDate} />
                        <Form.Control.Feedback type="invalid">{errors.releaseDate}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    {/* Stock */}
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Stok Tersedia</Form.Label>
                        <Form.Control type="number" name="stock" value={formData.stock} onChange={handleInputChange} isInvalid={!!errors.stock} />
                        <Form.Control.Feedback type="invalid">{errors.stock}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  {/* Is Active Switch */}
                  <Form.Group className="mb-4">
                     <Form.Check type="switch" id="product-active-switch" label="Produk Aktif" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                  </Form.Group>
                  
                  {/* Action Buttons */}
                  <div className="d-flex gap-2">
                    <Button type="submit" variant={isEditing ? 'primary' : 'success'}>{isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}</Button>
                    {isEditing && <Button type="button" variant="secondary" onClick={resetForm}>Batal</Button>}
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* --- TABLE COLUMN --- */}
          <Col lg={7}>
            <Card>
              <Card.Header as="h5">Daftar Produk</Card.Header>
              <Card.Body className="p-0">
                <Table striped bordered hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Nama Produk</th>
                      <th>Harga</th>
                      <th>Stok</th>
                      <th>Status</th>
                      <th className="text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-4 text-muted">Belum ada data Produk.</td></tr>
                    ) : (
                      products.map(product => (
                        <tr key={product.id}>
                          <td>
                            <strong>{product.name}</strong>
                            <br />
                            <small className="text-muted">{product.category}</small>
                          </td>
                          <td>{Number(product.price).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                          <td>{product.stock}</td>
                          <td>
                            <span className={`badge ${product.isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {product.isActive ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                          </td>
                          <td className="text-center">
                            <Button size="sm" variant="warning" onClick={() => handleEdit(product)} className="me-2">Edit</Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(product.id)}>Hapus</Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Header closeButton>
            <strong className="me-auto">Notifikasi</strong>
            <small>Baru saja</small>
          </Toast.Header>
          <Toast.Body className={toastVariant === 'danger' ? 'text-white' : ''}>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}