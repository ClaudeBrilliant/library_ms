// script.ts
// This TypeScript file needs to be compiled to JavaScript to run in the browser

// Define types for our data structures
interface Book {
    id: number;
    title: string;
    author: string;
    isAvailable: boolean;
    borrowedBy?: number; // ID of the member who borrowed it
}

interface Member {
    id: number;
    name: string;
    email: string;
    borrowedBooks: number[]; // Array of book IDs
}

interface BorrowRecord {
    bookId: number;
    memberId: number;
    borrowDate: Date;
}

// Global variables to store our data
let books: Book[] = [];
let members: Member[] = [];
let borrowRecords: BorrowRecord[] = [];
let nextBookId = 1;
let nextMemberId = 1;

// Initialize the system with some sample data
function initializeSystem(): void {
    console.log("Library System Starting...");
    
    // Add sample books
    books.push({
        id: nextBookId++,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isAvailable: true
    });
    
    books.push({
        id: nextBookId++,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isAvailable: true
    });
    
    // Add sample member
    members.push({
        id: nextMemberId++,
        name: "John Doe",
        email: "john@example.com",
        borrowedBooks: []
    });
    
    // Update displays
    displayBooks();
    displayMembers();
    updateDropdowns();
    displayBorrowedBooks();
}

// Book Management Functions
function addBook(): void {
    const titleInput = document.getElementById('bookTitle') as HTMLInputElement;
    const authorInput = document.getElementById('bookAuthor') as HTMLInputElement;
    
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    
    // Validate input
    if (!title || !author) {
        alert('Please enter both title and author');
        return;
    }
    
    // Create new book
    const newBook: Book = {
        id: nextBookId++,
        title: title,
        author: author,
        isAvailable: true
    };
    
    // Add to books array
    books.push(newBook);
    
    // Clear input fields
    titleInput.value = '';
    authorInput.value = '';
    
    // Update display
    displayBooks();
    updateDropdowns();
    
    console.log('Book added:', newBook);
}

function deleteBook(bookId: number): void {
    // Check if book is currently borrowed
    const book = books.find(b => b.id === bookId);
    if (book && !book.isAvailable) {
        alert('Cannot delete a book that is currently borrowed');
        return;
    }
    
    // Remove book from array
    books = books.filter(book => book.id !== bookId);
    
    // Update display
    displayBooks();
    updateDropdowns();
    
    console.log('Book deleted:', bookId);
}

function displayBooks(): void {
    const booksContainer = document.getElementById('booksList') as HTMLElement;
    
    if (books.length === 0) {
        booksContainer.innerHTML = '<p>No books available</p>';
        return;
    }
    
    let html = '';
    books.forEach(book => {
        const statusClass = book.isAvailable ? 'available' : 'borrowed';
        const statusText = book.isAvailable ? 'Available' : 'Borrowed';
        
        html += `
            <div class="item">
                <h4>${book.title}</h4>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>Status:</strong> <span class="status ${statusClass}">${statusText}</span></p>
                <div class="item-actions">
                    <button class="delete-btn" onclick="deleteBook(${book.id})">Delete</button>
                </div>
            </div>
        `;
    });
    
    booksContainer.innerHTML = html;
}

// Member Management Functions
function addMember(): void {
    const nameInput = document.getElementById('memberName') as HTMLInputElement;
    const emailInput = document.getElementById('memberEmail') as HTMLInputElement;
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    
    // Validate input
    if (!name || !email) {
        alert('Please enter both name and email');
        return;
    }
    
    // Check if email already exists
    if (members.some(member => member.email === email)) {
        alert('A member with this email already exists');
        return;
    }
    
    // Create new member
    const newMember: Member = {
        id: nextMemberId++,
        name: name,
        email: email,
        borrowedBooks: []
    };
    
    // Add to members array
    members.push(newMember);
    
    // Clear input fields
    nameInput.value = '';
    emailInput.value = '';
    
    // Update display
    displayMembers();
    updateDropdowns();
    
    console.log('Member added:', newMember);
}

function deleteMember(memberId: number): void {
    const member = members.find(m => m.id === memberId);
    
    if (!member) {
        alert('Member not found');
        return;
    }
    
    // Handle borrowed books - return them automatically
    if (member.borrowedBooks.length > 0) {
        const confirm = window.confirm(
            `This member has ${member.borrowedBooks.length} borrowed book(s). ` +
            'These books will be automatically returned. Continue?'
        );
        
        if (!confirm) {
            return;
        }
        
        // Return all borrowed books
        member.borrowedBooks.forEach(bookId => {
            returnBookById(bookId, memberId);
        });
    }
    
    // Remove member from array
    members = members.filter(member => member.id !== memberId);
    
    // Update displays
    displayMembers();
    updateDropdowns();
    displayBorrowedBooks();
    
    console.log('Member deleted:', memberId);
}

function displayMembers(): void {
    const membersContainer = document.getElementById('membersList') as HTMLElement;
    
    if (members.length === 0) {
        membersContainer.innerHTML = '<p>No members registered</p>';
        return;
    }
    
    let html = '';
    members.forEach(member => {
        html += `
            <div class="item">
                <h4>${member.name}</h4>
                <p><strong>Email:</strong> ${member.email}</p>
                <p><strong>Books Borrowed:</strong> ${member.borrowedBooks.length}</p>
                <div class="item-actions">
                    <button class="delete-btn" onclick="deleteMember(${member.id})">Delete</button>
                </div>
            </div>
        `;
    });
    
    membersContainer.innerHTML = html;
}

// Borrowing System Functions
function borrowBook(): void {
    const memberSelect = document.getElementById('memberSelect') as HTMLSelectElement;
    const bookSelect = document.getElementById('bookSelect') as HTMLSelectElement;
    
    const memberId = parseInt(memberSelect.value);
    const bookId = parseInt(bookSelect.value);
    
    // Validate selections
    if (!memberId || !bookId) {
        alert('Please select both a member and a book');
        return;
    }
    
    // Find member and book
    const member = members.find(m => m.id === memberId);
    const book = books.find(b => b.id === bookId);
    
    if (!member || !book) {
        alert('Invalid selection');
        return;
    }
    
    if (!book.isAvailable) {
        alert('This book is not available');
        return;
    }
    
    // Update book status
    book.isAvailable = false;
    book.borrowedBy = memberId;
    
    // Update member's borrowed books
    member.borrowedBooks.push(bookId);
    
    // Create borrow record
    const borrowRecord: BorrowRecord = {
        bookId: bookId,
        memberId: memberId,
        borrowDate: new Date()
    };
    borrowRecords.push(borrowRecord);
    
    // Reset selections
    memberSelect.value = '';
    bookSelect.value = '';
    
    // Update displays
    displayBooks();
    displayMembers();
    updateDropdowns();
    displayBorrowedBooks();
    
    console.log('Book borrowed:', borrowRecord);
}

function returnBook(bookId: number): void {
    const book = books.find(b => b.id === bookId);
    
    if (!book || !book.borrowedBy) {
        alert('Book not found or not borrowed');
        return;
    }
    
    returnBookById(bookId, book.borrowedBy);
    
    // Update displays
    displayBooks();
    displayMembers();
    updateDropdowns();
    displayBorrowedBooks();
    
    console.log('Book returned:', bookId);
}

function returnBookById(bookId: number, memberId: number): void {
    // Find and update book
    const book = books.find(b => b.id === bookId);
    if (book) {
        book.isAvailable = true;
        delete book.borrowedBy;
    }
    
    // Find and update member
    const member = members.find(m => m.id === memberId);
    if (member) {
        member.borrowedBooks = member.borrowedBooks.filter(id => id !== bookId);
    }
    
    // Remove borrow record
    borrowRecords = borrowRecords.filter(
        record => !(record.bookId === bookId && record.memberId === memberId)
    );
}

function displayBorrowedBooks(): void {
    const container = document.getElementById('borrowedBooksList') as HTMLElement;
    
    const borrowedBooks = books.filter(book => !book.isAvailable);
    
    if (borrowedBooks.length === 0) {
        container.innerHTML = '<p>No books currently borrowed</p>';
        return;
    }
    
    let html = '';
    borrowedBooks.forEach(book => {
        const member = members.find(m => m.id === book.borrowedBy);
        const memberName = member ? member.name : 'Unknown Member';
        
        html += `
            <div class="item borrowed-item">
                <h4>${book.title}</h4>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>Borrowed by:</strong> ${memberName}</p>
                <div class="item-actions">
                    <button class="return-btn" onclick="returnBook(${book.id})">Return Book</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Helper Functions
function updateDropdowns(): void {
    updateMemberDropdown();
    updateBookDropdown();
}

function updateMemberDropdown(): void {
    const memberSelect = document.getElementById('memberSelect') as HTMLSelectElement;
    
    // Clear existing options except the first one
    memberSelect.innerHTML = '<option value="">Select Member</option>';
    
    // Add member options
    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id.toString();
        option.textContent = member.name;
        memberSelect.appendChild(option);
    });
}

function updateBookDropdown(): void {
    const bookSelect = document.getElementById('bookSelect') as HTMLSelectElement;
    
    // Clear existing options except the first one
    bookSelect.innerHTML = '<option value="">Select Available Book</option>';
    
    // Add available book options
    const availableBooks = books.filter(book => book.isAvailable);
    availableBooks.forEach(book => {
        const option = document.createElement('option');
        option.value = book.id.toString();
        option.textContent = `${book.title} by ${book.author}`;
        bookSelect.appendChild(option);
    });
}

// Initialize the system when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeSystem();
});

// Make functions available globally for HTML onclick events
(window as any).addBook = addBook;
(window as any).deleteBook = deleteBook;
(window as any).addMember = addMember;
(window as any).deleteMember = deleteMember;
(window as any).borrowBook = borrowBook;
(window as any).returnBook = returnBook;