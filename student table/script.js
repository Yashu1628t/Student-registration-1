// Student Registration System - Professional Version
// Task 6: JavaScript Functionality Implementation
class StudentManagementSystem {
    constructor() {
        this.students = this.loadStudents();
        this.currentEditIndex = -1;
        this.filteredStudents = [...this.students];
        
        this.initializeEventListeners();
        this.renderStudents();
        this.updateStats();
        this.setupDynamicScrollbar(); // Task 6: Dynamic scrollbar
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Form submission
        document.getElementById('studentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });

        // Clear form button
        document.getElementById('clearForm').addEventListener('click', () => {
            this.clearForm();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Filter functionality
        document.getElementById('courseFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('yearFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        // Export functionality
        document.getElementById('exportCSV').addEventListener('click', () => {
            this.exportToCSV();
        });

        document.getElementById('exportJSON').addEventListener('click', () => {
            this.exportToJSON();
        });

        // Modal functionality
        const modal = document.getElementById('editModal');
        const closeBtn = document.querySelector('.close');
        const cancelBtn = document.getElementById('cancelEdit');

        closeBtn.addEventListener('click', () => {
            this.closeModal();
        });

        cancelBtn.addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Edit form submission
        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditSubmission();
        });

        // Real-time validation for input fields
        this.setupRealTimeValidation();
    }

    // Setup real-time validation for input fields
    setupRealTimeValidation() {
        // Student name validation - characters only
        document.getElementById('name').addEventListener('input', (e) => {
            const value = e.target.value;
            const nameRegex = /^[a-zA-Z\s]+$/;
            if (value && !nameRegex.test(value)) {
                this.showFieldError('nameError', 'Name can only contain letters and spaces');
            } else {
                this.clearFieldError('nameError');
            }
        });

        // Student ID validation - numbers only
        document.getElementById('studentId').addEventListener('input', (e) => {
            const value = e.target.value;
            const idRegex = /^\d+$/;
            if (value && !idRegex.test(value)) {
                this.showFieldError('studentIdError', 'Student ID can only contain numbers');
            } else {
                this.clearFieldError('studentIdError');
            }
        });

        // Contact number validation - minimum 10 digits
        document.getElementById('contact').addEventListener('input', (e) => {
            const value = e.target.value.replace(/\s/g, '');
            const contactRegex = /^\d{10,}$/;
            if (value && !contactRegex.test(value)) {
                this.showFieldError('contactError', 'Contact number must be at least 10 digits');
            } else {
                this.clearFieldError('contactError');
            }
        });

        // Email validation
        document.getElementById('email').addEventListener('input', (e) => {
            const value = e.target.value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                this.showFieldError('emailError', 'Please enter a valid email address');
            } else {
                this.clearFieldError('emailError');
            }
        });
    }

    // Setup dynamic scrollbar for table container
    setupDynamicScrollbar() {
        const tableContainer = document.getElementById('tableContainer');
        
        // Function to check if scrollbar is needed
        const checkScrollbar = () => {
            const table = document.getElementById('studentTable');
            const tbody = document.getElementById('studentTableBody');
            
            if (tbody.rows.length > 5) { // Show scrollbar if more than 5 rows
                tableContainer.style.maxHeight = '400px';
                tableContainer.style.overflowY = 'auto';
            } else {
                tableContainer.style.maxHeight = 'none';
                tableContainer.style.overflowY = 'visible';
            }
        };

        // Check scrollbar on window resize
        window.addEventListener('resize', checkScrollbar);
        
        // Initial check
        checkScrollbar();
        
        // Check after rendering students
        this.checkScrollbarAfterRender = checkScrollbar;
    }

    // Handle form submission with validation
    handleFormSubmission() {
        const formData = this.getFormData();
        
        if (!this.validateFormData(formData)) {
            return;
        }

        // Check for duplicate student ID
        if (this.students.some(student => student.studentId === formData.studentId)) {
            this.showMessage('Student ID already exists!', 'error');
            return;
        }

        // Add new student
        const newStudent = {
            ...formData,
            id: Date.now(),
            registrationDate: new Date().toISOString()
        };

        this.students.push(newStudent);
        this.saveStudents();
        this.applyFilters(); // This will update the filtered list
        this.renderStudents();
        this.updateStats();
        this.clearForm();
        this.showMessage('Student registered successfully!', 'success');
        
        // Check scrollbar after adding new student
        if (this.checkScrollbarAfterRender) {
            this.checkScrollbarAfterRender();
        }
    }

    // Get form data
    getFormData() {
        return {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            contact: document.getElementById('contact').value.trim(),
            studentId: document.getElementById('studentId').value.trim(),
            course: document.getElementById('course').value,
            year: document.getElementById('year').value
        };
    }

    // Validate form data according to assignment requirements
    validateFormData(data) {
        let isValid = true;
        this.clearErrorMessages();

        // Task 6: Validation Requirements
        // 1. Student name validation - characters only
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!data.name || data.name.length < 2) {
            this.showFieldError('nameError', 'Name must be at least 2 characters long');
            isValid = false;
        } else if (!nameRegex.test(data.name)) {
            this.showFieldError('nameError', 'Name can only contain letters and spaces');
            isValid = false;
        }

        // 2. Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            this.showFieldError('emailError', 'Please enter a valid email address');
            isValid = false;
        }

        // 3. Contact number validation - minimum 10 digits
        const contactRegex = /^\d{10,}$/;
        const cleanContact = data.contact.replace(/\s/g, '');
        if (!cleanContact || !contactRegex.test(cleanContact)) {
            this.showFieldError('contactError', 'Contact number must be at least 10 digits');
            isValid = false;
        }

        // 4. Student ID validation - numbers only
        const idRegex = /^\d+$/;
        if (!data.studentId || data.studentId.length < 3) {
            this.showFieldError('studentIdError', 'Student ID must be at least 3 characters long');
            isValid = false;
        } else if (!idRegex.test(data.studentId)) {
            this.showFieldError('studentIdError', 'Student ID can only contain numbers');
            isValid = false;
        }

        // 5. Check for empty data
        if (!data.name || !data.email || !data.contact || !data.studentId) {
            this.showMessage('Please fill in all required fields!', 'error');
            isValid = false;
        }

        return isValid;
    }

    // Show field error
    showFieldError(fieldId, message) {
        const errorElement = document.getElementById(fieldId);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    // Clear specific field error
    clearFieldError(fieldId) {
        const errorElement = document.getElementById(fieldId);
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    // Clear error messages
    clearErrorMessages() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
        });
    }

    // Clear form
    clearForm() {
        document.getElementById('studentForm').reset();
        this.clearErrorMessages();
    }

    // Handle search
    handleSearch(searchTerm) {
        this.applyFilters();
    }

    // Apply filters and search
    applyFilters() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const courseFilter = document.getElementById('courseFilter').value;
        const yearFilter = document.getElementById('yearFilter').value;

        this.filteredStudents = this.students.filter(student => {
            const matchesSearch = !searchTerm || 
                student.name.toLowerCase().includes(searchTerm) ||
                student.email.toLowerCase().includes(searchTerm) ||
                student.studentId.toLowerCase().includes(searchTerm) ||
                student.contact.includes(searchTerm);

            const matchesCourse = !courseFilter || student.course === courseFilter;
            const matchesYear = !yearFilter || student.year === yearFilter;

            return matchesSearch && matchesCourse && matchesYear;
        });

        this.renderStudents();
        this.updateStats();
    }

    // Render students table
    renderStudents() {
        const tbody = document.getElementById('studentTableBody');
        
        if (this.filteredStudents.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>No students found</h3>
                        <p>${this.students.length === 0 ? 'Add your first student using the form on the left.' : 'Try adjusting your search or filter criteria.'}</p>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = this.filteredStudents.map((student, index) => `
                <tr>
                    <td>${this.escapeHtml(student.name)}</td>
                    <td>${this.escapeHtml(student.email)}</td>
                    <td>${this.escapeHtml(student.contact)}</td>
                    <td>${this.escapeHtml(student.studentId)}</td>
                    <td>${this.escapeHtml(student.course || '-')}</td>
                    <td>${this.escapeHtml(student.year || '-')}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-edit" onclick="studentSystem.editStudent(${index})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-delete" onclick="studentSystem.deleteStudent(${index})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        // Check scrollbar after rendering
        if (this.checkScrollbarAfterRender) {
            this.checkScrollbarAfterRender();
        }
    }

    // Edit student
    editStudent(index) {
        const student = this.filteredStudents[index];
        this.currentEditIndex = this.students.findIndex(s => s.id === student.id);
        
        // Populate edit form
        document.getElementById('editName').value = student.name;
        document.getElementById('editEmail').value = student.email;
        document.getElementById('editContact').value = student.contact;
        document.getElementById('editStudentId').value = student.studentId;
        document.getElementById('editCourse').value = student.course || '';
        document.getElementById('editYear').value = student.year || '';
        
        // Show modal
        document.getElementById('editModal').style.display = 'block';
    }

    // Handle edit form submission
    handleEditSubmission() {
        const formData = {
            name: document.getElementById('editName').value.trim(),
            email: document.getElementById('editEmail').value.trim(),
            contact: document.getElementById('editContact').value.trim(),
            studentId: document.getElementById('editStudentId').value.trim(),
            course: document.getElementById('editCourse').value,
            year: document.getElementById('editYear').value
        };

        if (!this.validateFormData(formData)) {
            return;
        }

        // Check for duplicate student ID (excluding current student)
        const originalStudent = this.students[this.currentEditIndex];
        if (formData.studentId !== originalStudent.studentId && 
            this.students.some(student => student.studentId === formData.studentId)) {
            this.showMessage('Student ID already exists!', 'error');
            return;
        }

        // Update student
        this.students[this.currentEditIndex] = {
            ...originalStudent,
            ...formData,
            lastModified: new Date().toISOString()
        };

        this.saveStudents();
        this.applyFilters();
        this.renderStudents();
        this.updateStats();
        this.closeModal();
        this.showMessage('Student updated successfully!', 'success');
    }

    // Delete student
    deleteStudent(index) {
        const student = this.filteredStudents[index];
        
        if (confirm(`Are you sure you want to delete ${student.name}?`)) {
            const actualIndex = this.students.findIndex(s => s.id === student.id);
            this.students.splice(actualIndex, 1);
            this.saveStudents();
            this.applyFilters();
            this.renderStudents();
            this.updateStats();
            this.showMessage('Student deleted successfully!', 'success');
        }
    }

    // Close modal
    closeModal() {
        document.getElementById('editModal').style.display = 'none';
        this.currentEditIndex = -1;
    }

    // Update statistics
    updateStats() {
        const totalStudents = this.students.length;
        const filteredCount = this.filteredStudents.length;
        
        document.getElementById('totalStudents').textContent = 
            `Total Students: ${totalStudents}${filteredCount !== totalStudents ? ` (Showing: ${filteredCount})` : ''}`;
    }

    // Export to CSV
    exportToCSV() {
        if (this.filteredStudents.length === 0) {
            this.showMessage('No data to export!', 'error');
            return;
        }

        const headers = ['Student Name', 'Email ID', 'Contact No.', 'Student ID', 'Course', 'Year', 'Registration Date'];
        const csvContent = [
            headers.join(','),
            ...this.filteredStudents.map(student => [
                student.name,
                student.email,
                student.contact,
                student.studentId,
                student.course || '',
                student.year || '',
                new Date(student.registrationDate).toLocaleDateString()
            ].join(','))
        ].join('\n');

        this.downloadFile(csvContent, 'students.csv', 'text/csv');
        this.showMessage('CSV exported successfully!', 'success');
    }

    // Export to JSON
    exportToJSON() {
        if (this.filteredStudents.length === 0) {
            this.showMessage('No data to export!', 'error');
            return;
        }

        const jsonContent = JSON.stringify(this.filteredStudents, null, 2);
        this.downloadFile(jsonContent, 'students.json', 'application/json');
        this.showMessage('JSON exported successfully!', 'success');
    }

    // Download file
    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Show message
    showMessage(message, type = 'info') {
        const messageContainer = document.getElementById('messageContainer');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        messageContainer.appendChild(messageElement);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }

    // Load students from localStorage - Task 6: Data persistence
    loadStudents() {
        try {
            const saved = localStorage.getItem('students');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading students:', error);
            return [];
        }
    }

    // Save students to localStorage - Task 6: Data persistence
    saveStudents() {
        try {
            localStorage.setItem('students', JSON.stringify(this.students));
        } catch (error) {
            console.error('Error saving students:', error);
            this.showMessage('Error saving data!', 'error');
        }
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.studentSystem = new StudentManagementSystem();
});
