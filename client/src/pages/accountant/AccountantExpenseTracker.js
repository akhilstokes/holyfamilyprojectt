import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AccountantExpenseTracker.css';

const AccountantExpenseTracker = () => {
    // State management
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
    const [itemSearchTerm, setItemSearchTerm] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [gstEnabled, setGstEnabled] = useState(false);

    // Party dropdown state
    const [isPartyDropdownOpen, setIsPartyDropdownOpen] = useState(false);
    const [partySearchTerm, setPartySearchTerm] = useState('');
    
    // Predefined parties
    const [availableParties] = useState([
        'Cash Sale',
        'ABC Suppliers',
        'XYZ Vendors',
        'Office Depot',
        'Local Store',
        'Petty Cash',
        'Online Purchase',
        'Bank Transfer'
    ]);

    // Predefined items for selection
    const [availableItems] = useState([
        { name: 'ammonia', hsn: '-', price: 2000.0 },
        { name: 'Office Supplies', hsn: '48239000', price: 150.0 },
        { name: 'Printer Paper', hsn: '48025610', price: 300.0 },
        { name: 'Fuel', hsn: '27101990', price: 85.0 },
        { name: 'Stationery', hsn: '48239000', price: 200.0 },
        { name: 'Computer Equipment', hsn: '84713000', price: 15000.0 },
        { name: 'Office Furniture', hsn: '94036000', price: 8000.0 },
        { name: 'Cleaning Supplies', hsn: '34029090', price: 500.0 }
    ]);

    // Form state
    const [formData, setFormData] = useState({
        expenseNumber: '',
        partyName: '',
        originalInvoiceNumber: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        paymentMode: '',
        description: '',
        items: [] // Start with empty items array
    });

    // Categories for dropdown - matching user's image
    const [categories, setCategories] = useState([
        'Bank Fee and Charges',
        'Employee Salaries & Advances',
        'Printing and Stationery',
        'Raw Material',
        'Rent Expense',
        'Repair & Maintenance',
        'Telephone & Internet Expense',
        'Office Supplies',
        'Travel & Transport',
        'Utilities',
        'Marketing',
        'Equipment',
        'Professional Services',
        'Other'
    ]);

    // State for category management
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    
    // GST calculation state
    const [additionalCharges, setAdditionalCharges] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [gstRate, setGstRate] = useState(18); // Default 18% GST
    
    // Enhanced charges and discount state
    const [charges, setCharges] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [showChargeForm, setShowChargeForm] = useState(false);
    const [showDiscountForm, setShowDiscountForm] = useState(false);
    
    // Charge form state
    const [chargeForm, setChargeForm] = useState({
        description: '',
        amount: 0,
        taxType: 'No Tax Applicable'
    });
    
    // Discount form state  
    const [discountForm, setDiscountForm] = useState({
        type: 'percentage', // 'percentage' or 'amount'
        percentage: 0,
        amount: 0
    });

    // Fetch expenses on component mount
    useEffect(() => {
        fetchExpenses();
    }, []);

    // Fetch expenses from API
    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/expenses', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                setExpenses(response.data.data.expenses || []);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
            // Fallback to empty array if API fails
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    // Generate expense number
    const generateExpenseNumber = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `EXP-${year}${month}${day}-${random}`;
    };

    // Initialize form when modal opens
    useEffect(() => {
        if (isModalOpen) {
            setFormData(prev => ({
                ...prev,
                expenseNumber: generateExpenseNumber(),
                date: new Date().toISOString().split('T')[0]
            }));
        }
    }, [isModalOpen]);

    // Close party dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.select-party-container')) {
                setIsPartyDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle item changes
    const handleItemChange = (index, field, value) => {
        const updatedItems = [...formData.items];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: field === 'quantity' || field === 'amount' ? parseFloat(value) || 0 : value
        };
        setFormData(prev => ({
            ...prev,
            items: updatedItems
        }));
    };

    // Add new item
    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: 1, amount: 0 }]
        }));
    };

    // Add item from modal (keep this for the modal functionality)
    const openItemModal = () => {
        setIsItemsModalOpen(true);
    };

    // Add item from modal selection
    const addItemFromModal = (selectedItem) => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { 
                description: selectedItem.name, 
                quantity: 1, 
                amount: selectedItem.price,
                hsn: selectedItem.hsn 
            }]
        }));
        setIsItemsModalOpen(false);
        setItemSearchTerm('');
    };

    // Create new item from modal
    const createNewItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: 1, amount: 0, hsn: '' }]
        }));
        setIsItemsModalOpen(false);
        setItemSearchTerm('');
    };

    // Filter available items based on search
    const filteredItems = availableItems.filter(item =>
        item.name.toLowerCase().includes(itemSearchTerm.toLowerCase())
    );

    // Category management functions
    const handleAddCategory = () => {
        if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
            setCategories(prev => [...prev, newCategoryName.trim()]);
            setNewCategoryName('');
            setIsCategoryModalOpen(false);
        }
    };

    const handleDeleteCategory = (categoryToDelete) => {
        if (categories.length > 1) {
            setCategories(prev => prev.filter(cat => cat !== categoryToDelete));
        }
    };

    // Party selection functions
    const handlePartySelect = (party) => {
        setFormData(prev => ({ ...prev, partyName: party }));
        setPartySearchTerm(party);
        setIsPartyDropdownOpen(false);
    };

    const handlePartySearchChange = (e) => {
        const value = e.target.value;
        setPartySearchTerm(value);
        setFormData(prev => ({ ...prev, partyName: value }));
        setIsPartyDropdownOpen(true);
    };

    // Filter parties based on search
    const filteredParties = availableParties.filter(party =>
        party.toLowerCase().includes(partySearchTerm.toLowerCase())
    );

    // Enhanced charge and discount functions
    const addCharge = () => {
        if (chargeForm.description && chargeForm.amount > 0) {
            const newCharge = {
                id: Date.now(),
                description: chargeForm.description,
                amount: parseFloat(chargeForm.amount),
                taxType: chargeForm.taxType
            };
            setCharges(prev => [...prev, newCharge]);
            setChargeForm({ description: '', amount: 0, taxType: 'No Tax Applicable' });
            setShowChargeForm(false);
        }
    };

    const removeCharge = (chargeId) => {
        setCharges(prev => prev.filter(charge => charge.id !== chargeId));
    };

    const addDiscount = () => {
        const newDiscount = {
            id: Date.now(),
            type: discountForm.type,
            percentage: discountForm.percentage,
            amount: discountForm.amount
        };
        setDiscounts(prev => [...prev, newDiscount]);
        setDiscountForm({ type: 'percentage', percentage: 0, amount: 0 });
        setShowDiscountForm(false);
    };

    const removeDiscount = (discountId) => {
        setDiscounts(prev => prev.filter(discount => discount.id !== discountId));
    };

    const calculateTotalCharges = () => {
        return charges.reduce((sum, charge) => sum + charge.amount, 0);
    };

    const calculateTotalDiscount = () => {
        const subtotal = calculateSubtotal();
        return discounts.reduce((sum, discount) => {
            if (discount.type === 'percentage') {
                return sum + (subtotal * discount.percentage / 100);
            } else {
                return sum + discount.amount;
            }
        }, 0);
    };

    // Remove item
    const removeItem = (index) => {
        const updatedItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            items: updatedItems
        }));
    };

    // Calculate total amount with enhanced GST breakdown
    const calculateSubtotal = () => {
        if (formData.items.length === 0) return 0;
        return formData.items.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
    };

    const calculateTaxableAmount = () => {
        const subtotal = calculateSubtotal();
        const totalCharges = calculateTotalCharges();
        const totalDiscount = calculateTotalDiscount();
        return subtotal + totalCharges - totalDiscount;
    };

    const calculateGSTAmount = () => {
        if (!gstEnabled) return 0;
        return (calculateTaxableAmount() * gstRate) / 100;
    };

    const calculateTotal = () => {
        const taxableAmount = calculateTaxableAmount();
        const gstAmount = calculateGSTAmount();
        return taxableAmount + gstAmount;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const expenseData = {
                ...formData,
                gstEnabled,
                items: formData.items.filter(item => item.description && item.quantity && item.amount)
            };

            const response = await axios.post('/api/expenses', expenseData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                // Refresh expenses list
                await fetchExpenses();
                
                // Reset form and close modal
                setFormData({
                    expenseNumber: '',
                    partyName: '',
                    originalInvoiceNumber: '',
                    category: '',
                    date: new Date().toISOString().split('T')[0],
                    paymentMode: '',
                    description: '',
                    items: [] // Reset to empty items array
                });
                setGstEnabled(false);
                setIsModalOpen(false);
                
                console.log('Expense created successfully:', response.data.data);
            }
        } catch (error) {
            console.error('Error creating expense:', error);
            alert('Failed to create expense. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Filter expenses based on search and filters
    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            expense.expenseNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || expense.category === categoryFilter;
        const matchesDate = !dateFilter || expense.date === dateFilter;
        
        return matchesSearch && matchesCategory && matchesDate;
    });

    return (
        <div className="expense-tracker">
            {/* Header */}
            <div className="expense-header">
                <div className="header-left">
                    <h1 className="page-title">Expense Tracker</h1>
                </div>
                <div className="header-right">
                    <button className="reports-btn">
                        <span>📊</span>
                        Reports
                    </button>
                    <button className="settings-btn">
                        <span>⚙️</span>
                    </button>
                    <button className="more-btn">
                        <span>⋯</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="expense-filters">
                <div className="filter-left">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search expenses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="date-filter"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    >
                        <option value="">All Dates</option>
                        <option value={new Date().toISOString().split('T')[0]}>Today</option>
                        <option value={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}>Last 7 Days</option>
                    </select>
                    <select
                        className="category-filter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                <button
                    className="create-expense-btn"
                    onClick={() => setIsModalOpen(true)}
                >
                    + Create Expense
                </button>
            </div>

            {/* Table */}
            <div className="expense-table-container">
                {loading ? (
                    <div className="expense-loading">
                        <div className="loading-spinner"></div>
                    </div>
                ) : filteredExpenses.length > 0 ? (
                    <table className="expense-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Expense Number</th>
                                <th>Party Name</th>
                                <th>Category</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map((expense, index) => (
                                <tr key={index}>
                                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                                    <td>{expense.expenseNumber}</td>
                                    <td>{expense.partyName}</td>
                                    <td>{expense.category}</td>
                                    <td>₹{expense.totalAmount?.toFixed(2) || '0.00'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <div className="empty-content">
                            <div className="empty-icon">📄</div>
                            <p>No Transactions Matching the current filter</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Expense Modal - Matching User's Design */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="expense-modal-modern">
                        <div className="expense-modal-header-modern">
                            <div className="modal-header-left-modern">
                                <h2>Create Expense</h2>
                            </div>
                            <div className="modal-header-right-modern">
                                <button
                                    className="settings-icon-btn"
                                    title="Settings"
                                >
                                    ⚙️
                                </button>
                                <button
                                    className="cancel-button-modern"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="save-button-modern"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>

                        <div className="expense-modal-content-modern">
                            <form onSubmit={handleSubmit}>
                                <div className="expense-form-grid-modern">
                                    <div className="expense-form-left-modern">
                                        <div className="form-group-modern">
                                            <label className="form-label-modern">Expense With GST</label>
                                            <div className="toggle-switch-modern">
                                                <input
                                                    type="checkbox"
                                                    id="gst-toggle"
                                                    checked={gstEnabled}
                                                    onChange={(e) => setGstEnabled(e.target.checked)}
                                                />
                                                <label htmlFor="gst-toggle" className="toggle-slider-modern"></label>
                                            </div>
                                        </div>

                                        <div className="form-group-modern">
                                            <label className="form-label-modern">Select Party</label>
                                            <div className="select-party-container">
                                                <span className="search-icon-party">🔍</span>
                                                <input
                                                    type="text"
                                                    name="partyName"
                                                    className="form-input-modern party-search-input"
                                                    value={partySearchTerm}
                                                    onChange={handlePartySearchChange}
                                                    onFocus={() => setIsPartyDropdownOpen(true)}
                                                    placeholder="Search Party"
                                                    required
                                                />
                                                <span 
                                                    className="dropdown-arrow"
                                                    onClick={() => setIsPartyDropdownOpen(!isPartyDropdownOpen)}
                                                >
                                                    ▼
                                                </span>
                                                
                                                {/* Party Dropdown */}
                                                {isPartyDropdownOpen && (
                                                    <div className="party-dropdown">
                                                        {filteredParties.length > 0 ? (
                                                            filteredParties.map((party, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="party-option"
                                                                    onClick={() => handlePartySelect(party)}
                                                                >
                                                                    {party}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="party-option no-results">
                                                                No parties found
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="form-group-modern">
                                            <label className="form-label-modern">Expense Category</label>
                                            <select
                                                name="category"
                                                className="form-select-modern"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(category => (
                                                    <option key={category} value={category}>{category}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group-modern">
                                            <label className="form-label-modern">Expense Number</label>
                                            <input
                                                type="text"
                                                name="expenseNumber"
                                                className="form-input-modern"
                                                value={formData.expenseNumber}
                                                onChange={handleInputChange}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div className="expense-form-right-modern">
                                        <div className="form-group-modern">
                                            <label className="form-label-modern">Original Invoice Number</label>
                                            <input
                                                type="text"
                                                name="originalInvoiceNumber"
                                                className="form-input-modern"
                                                value={formData.originalInvoiceNumber || ''}
                                                onChange={handleInputChange}
                                                placeholder="Enter invoice number"
                                            />
                                        </div>

                                        <div className="form-group-modern">
                                            <label className="form-label-modern">Date</label>
                                            <input
                                                type="date"
                                                name="date"
                                                className="form-input-modern date-input-modern"
                                                value={formData.date}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group-modern">
                                            <label className="form-label-modern">Payment Mode</label>
                                            <select 
                                                name="paymentMode"
                                                className="form-select-modern"
                                                value={formData.paymentMode || ''}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select</option>
                                                <option value="cash">Cash</option>
                                                <option value="card">Card</option>
                                                <option value="bank">Bank Transfer</option>
                                                <option value="cheque">Cheque</option>
                                            </select>
                                        </div>

                                        <div className="form-group-modern">
                                            <label className="form-label-modern">Note</label>
                                            <textarea
                                                name="description"
                                                className="form-textarea-modern"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                placeholder="Enter Notes"
                                                rows="4"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Items Section */}
                                <div className="expense-items-section-modern">
                                    {/* Always show Add Item button */}
                                    <div className="add-item-container-modern">
                                        <button
                                            type="button"
                                            className="add-item-button-modern"
                                            onClick={addItem}
                                        >
                                            + Add Item
                                        </button>
                                    </div>
                                    
                                    {/* Only show items if they exist */}
                                    {formData.items.length > 0 && (
                                        <div className="items-list">
                                            {formData.items.map((item, index) => (
                                                <div key={index} className="expense-item-modern">
                                                    <div className="item-fields-modern">
                                                        <input
                                                            type="text"
                                                            className="item-description-modern"
                                                            placeholder="Item description"
                                                            value={item.description}
                                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                        />
                                                        <input
                                                            type="number"
                                                            className="item-quantity-modern"
                                                            placeholder="Qty"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                            min="1"
                                                        />
                                                        <input
                                                            type="number"
                                                            className="item-amount-modern"
                                                            placeholder="Amount"
                                                            value={item.amount}
                                                            onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="remove-item-button-modern"
                                                        onClick={() => removeItem(index)}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="total-amount-section-modern">
                                        {/* Total Row */}
                                        <div className="total-summary-row">
                                            <span className="total-label-left">Total</span>
                                            <span className="total-amount-right">₹ {calculateSubtotal().toFixed(0)}</span>
                                            <span className="total-quantity-center">{formData.items.length}</span>
                                            <span className="total-final-right">₹ {calculateSubtotal().toFixed(0)}</span>
                                        </div>

                                        {/* Existing Charges Display */}
                                        {charges.map((charge) => (
                                            <div key={charge.id} className="charge-display-row">
                                                <div className="charge-info">
                                                    <input
                                                        type="text"
                                                        value={charge.description}
                                                        className="charge-description-input"
                                                        readOnly
                                                    />
                                                    <span className="charge-amount">₹ {charge.amount.toFixed(0)}</span>
                                                    <select className="charge-tax-select" value={charge.taxType} disabled>
                                                        <option>No Tax Applicable</option>
                                                        <option>GST 5%</option>
                                                        <option>GST 12%</option>
                                                        <option>GST 18%</option>
                                                        <option>GST 28%</option>
                                                    </select>
                                                    <button 
                                                        className="remove-charge-btn"
                                                        onClick={() => removeCharge(charge.id)}
                                                    >
                                                        ⊗
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add Charge Form */}
                                        {showChargeForm ? (
                                            <div className="charge-form-row">
                                                <input
                                                    type="text"
                                                    placeholder="Enter charge (ex. Transport Charge)"
                                                    value={chargeForm.description}
                                                    onChange={(e) => setChargeForm(prev => ({...prev, description: e.target.value}))}
                                                    className="charge-description-input"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={chargeForm.amount}
                                                    onChange={(e) => setChargeForm(prev => ({...prev, amount: e.target.value}))}
                                                    className="charge-amount-input"
                                                />
                                                <select 
                                                    value={chargeForm.taxType}
                                                    onChange={(e) => setChargeForm(prev => ({...prev, taxType: e.target.value}))}
                                                    className="charge-tax-select"
                                                >
                                                    <option>No Tax Applicable</option>
                                                    <option>GST 5%</option>
                                                    <option>GST 12%</option>
                                                    <option>GST 18%</option>
                                                    <option>GST 28%</option>
                                                </select>
                                                <button className="add-charge-confirm-btn" onClick={addCharge}>✓</button>
                                                <button 
                                                    className="remove-charge-btn"
                                                    onClick={() => setShowChargeForm(false)}
                                                >
                                                    ⊗
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                type="button" 
                                                className="blue-action-button charges-button"
                                                onClick={() => setShowChargeForm(true)}
                                            >
                                                + Add Another Charge
                                            </button>
                                        )}

                                        {/* Taxable Amount (only when GST enabled) */}
                                        {gstEnabled && (
                                            <div className="taxable-amount-display">
                                                <span className="taxable-label">Taxable Amount</span>
                                                <span className="taxable-amount">₹ {calculateTaxableAmount().toFixed(0)}</span>
                                            </div>
                                        )}

                                        {/* Existing Discounts Display */}
                                        {discounts.map((discount) => (
                                            <div key={discount.id} className="discount-display-row">
                                                <div className="discount-info">
                                                    <span className="discount-label">Discount</span>
                                                    <div className="discount-inputs">
                                                        <span className="discount-percentage">% {discount.percentage}</span>
                                                        <span className="discount-separator">/</span>
                                                        <span className="discount-amount">₹ {discount.amount}</span>
                                                    </div>
                                                    <button 
                                                        className="remove-discount-btn"
                                                        onClick={() => removeDiscount(discount.id)}
                                                    >
                                                        ⊗
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add Discount Form */}
                                        {showDiscountForm ? (
                                            <div className="discount-form-row">
                                                <span className="discount-label">Discount</span>
                                                <div className="discount-inputs">
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        value={discountForm.percentage}
                                                        onChange={(e) => setDiscountForm(prev => ({...prev, percentage: parseFloat(e.target.value) || 0}))}
                                                        className="discount-percentage-input"
                                                    />
                                                    <span className="discount-separator">/</span>
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        value={discountForm.amount}
                                                        onChange={(e) => setDiscountForm(prev => ({...prev, amount: parseFloat(e.target.value) || 0}))}
                                                        className="discount-amount-input"
                                                    />
                                                </div>
                                                <button className="add-discount-confirm-btn" onClick={addDiscount}>✓</button>
                                                <button 
                                                    className="remove-discount-btn"
                                                    onClick={() => setShowDiscountForm(false)}
                                                >
                                                    ⊗
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                type="button" 
                                                className="blue-action-button discount-button"
                                                onClick={() => setShowDiscountForm(true)}
                                            >
                                                + Add Discount
                                            </button>
                                        )}

                                        {/* GST Row (only when GST enabled) */}
                                        {gstEnabled && (
                                            <div className="gst-amount-display">
                                                <span className="gst-label">GST ({gstRate}%)</span>
                                                <span className="gst-amount">₹ {calculateGSTAmount().toFixed(0)}</span>
                                            </div>
                                        )}

                                        {/* Total Amount - Final */}
                                        <div className="final-total-display">
                                            <span className="final-total-label">Total Amount</span>
                                            <span className="final-total-amount">₹ {calculateTotal().toFixed(0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Expense Items Modal */}
            {isItemsModalOpen && (
                <div className="modal-overlay">
                    <div className="items-modal">
                        <div className="items-modal-header">
                            <h2>Add Expense Items</h2>
                            <button
                                className="close-button"
                                onClick={() => setIsItemsModalOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="items-modal-content">
                            <div className="items-search-section">
                                <div className="search-container">
                                    <span className="search-icon">🔍</span>
                                    <input
                                        type="text"
                                        className="items-search-input"
                                        placeholder="Search"
                                        value={itemSearchTerm}
                                        onChange={(e) => setItemSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button
                                    className="create-new-item-btn"
                                    onClick={createNewItem}
                                >
                                    +Create New Item
                                </button>
                            </div>

                            <div className="items-table-container">
                                <table className="items-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th></th>
                                            <th>Item Name</th>
                                            <th>HSN/SAC</th>
                                            <th>Price</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredItems.map((item, index) => (
                                            <tr key={index}>
                                                <td className="row-number">{index + 1}</td>
                                                <td>
                                                    <input 
                                                        type="checkbox" 
                                                        className="item-checkbox"
                                                    />
                                                </td>
                                                <td>{item.name}</td>
                                                <td>{item.hsn}</td>
                                                <td>{item.price.toFixed(1)}</td>
                                                <td>
                                                    <button
                                                        className="add-item-btn"
                                                        onClick={() => addItemFromModal(item)}
                                                    >
                                                        + Add
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="items-modal-footer">
                                <button
                                    className="cancel-items-btn"
                                    onClick={() => setIsItemsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="add-items-btn"
                                    onClick={() => setIsItemsModalOpen(false)}
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountantExpenseTracker;