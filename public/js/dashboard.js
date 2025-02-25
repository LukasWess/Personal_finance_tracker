document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login.html';
      return;
    }
  
    // Set current month and year in the filter
    const today = new Date();
    document.getElementById('month-select').value = today.getMonth();
    document.getElementById('year-select').value = today.getFullYear();
  
    // DOM Elements
    const transactionModal = document.getElementById('transaction-modal');
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    const closeModalBtn = document.querySelector('.close');
    const transactionForm = document.getElementById('transaction-form');
    const transactionTypeSelect = document.getElementById('transaction-type');
    const categorySelect = document.getElementById('transaction-category');
    const transactionsTableBody = document.getElementById('transactions-body');
    const logoutBtn = document.getElementById('logout-btn');
    const filterBtn = document.getElementById('filter-btn');
  
    // Sample income categories
    const incomeCategories = [
      { id: 1, name: 'Salary' },
      { id: 2, name: 'Freelance' },
      { id: 3, name: 'Investments' },
      { id: 4, name: 'Gifts' },
      { id: 5, name: 'Other Income' }
    ];
  
    // Sample expense categories
    const expenseCategories = [
      { id: 101, name: 'Food & Dining' },
      { id: 102, name: 'Housing' },
      { id: 103, name: 'Transportation' },
      { id: 104, name: 'Utilities' },
      { id: 105, name: 'Entertainment' },
      { id: 106, name: 'Shopping' },
      { id: 107, name: 'Health & Fitness' },
      { id: 108, name: 'Education' },
      { id: 109, name: 'Travel' },
      { id: 110, name: 'Other Expenses' }
    ];
  
    // Sample transaction data
    // In a real app, this would come from your API
    let transactions = [
      {
        id: 1,
        date: '2025-02-20',
        amount: 2500.00,
        type: 'income',
        category_id: 1,
        category_name: 'Salary',
        description: 'Monthly salary'
      },
      {
        id: 2,
        date: '2025-02-21',
        amount: 300.00,
        type: 'expense',
        category_id: 101,
        category_name: 'Food & Dining',
        description: 'Grocery shopping'
      },
      {
        id: 3,
        date: '2025-02-22',
        amount: 150.00,
        type: 'expense',
        category_id: 105,
        category_name: 'Entertainment',
        description: 'Movie and dinner'
      },
      {
        id: 4,
        date: '2025-02-22',
        amount: 800.00,
        type: 'expense',
        category_id: 102,
        category_name: 'Housing',
        description: 'Rent payment'
      },
      {
        id: 5,
        date: '2025-02-23',
        amount: 200.00,
        type: 'income',
        category_id: 4,
        category_name: 'Gifts',
        description: 'Birthday gift'
      }
    ];
  
    // Event Listeners
    addTransactionBtn.addEventListener('click', openAddTransactionModal);
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', outsideClick);
    transactionForm.addEventListener('submit', handleTransactionSubmit);
    transactionTypeSelect.addEventListener('change', updateCategoryOptions);
    logoutBtn.addEventListener('click', handleLogout);
    filterBtn.addEventListener('click', filterTransactions);
  
    // Initialize the dashboard
    initializeDashboard();
  
    // Functions
    function initializeDashboard() {
      updateCategoryOptions();
      displayTransactions();
      updateFinancialSummary();
      renderCharts();
    }
  
    function openAddTransactionModal() {
      // Reset form
      transactionForm.reset();
      document.getElementById('modal-title').textContent = 'Add Transaction';
      document.getElementById('transaction-id').value = '';
      document.getElementById('transaction-date').value = formatDateForInput(new Date());
      
      // Show modal
      transactionModal.style.display = 'block';
    }
  
    function closeModal() {
      transactionModal.style.display = 'none';
    }
  
    function outsideClick(e) {
      if (e.target === transactionModal) {
        closeModal();
      }
    }
  
    function formatDateForInput(date) {
      const d = new Date(date);
      let month = '' + (d.getMonth() + 1);
      let day = '' + d.getDate();
      const year = d.getFullYear();
  
      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
  
      return [year, month, day].join('-');
    }
  
    function formatDateForDisplay(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }
  
    function formatCurrency(amount) {
      return '$' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
  
    function updateCategoryOptions() {
      // Clear existing options
      categorySelect.innerHTML = '<option value="" disabled selected>Select a category</option>';
      
      // Get selected transaction type
      const type = transactionTypeSelect.value;
      
      // Add appropriate categories based on type
      const categories = type === 'income' ? incomeCategories : expenseCategories;
      
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    }
  
    function handleTransactionSubmit(e) {
      e.preventDefault();
      
      const transactionId = document.getElementById('transaction-id').value;
      const isEdit = transactionId !== '';
      
      const newTransaction = {
        id: isEdit ? parseInt(transactionId) : transactions.length + 1,
        date: document.getElementById('transaction-date').value,
        amount: parseFloat(document.getElementById('transaction-amount').value),
        type: document.getElementById('transaction-type').value,
        category_id: parseInt(document.getElementById('transaction-category').value),
        description: document.getElementById('transaction-description').value
      };
      
      // Get category name
      const categories = newTransaction.type === 'income' ? incomeCategories : expenseCategories;
      const category = categories.find(cat => cat.id === newTransaction.category_id);
      newTransaction.category_name = category ? category.name : '';
      
      if (isEdit) {
        // Update existing transaction
        const index = transactions.findIndex(t => t.id === parseInt(transactionId));
        if (index !== -1) {
          transactions[index] = newTransaction;
        }
      } else {
        // Add new transaction
        transactions.push(newTransaction);
      }
      
      // Update dashboard
      displayTransactions();
      updateFinancialSummary();
      renderCharts();
      
      // Close modal
      closeModal();
    }
  
    function displayTransactions() {
      // Clear existing table rows
      transactionsTableBody.innerHTML = '';
      
      // Sort transactions by date (newest first)
      const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Display transactions
      sortedTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${formatDateForDisplay(transaction.date)}</td>
          <td>${transaction.description}</td>
          <td>${transaction.category_name}</td>
          <td class="${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}">
            ${formatCurrency(transaction.amount)}
          </td>
          <td>
            <span class="badge ${transaction.type === 'income' ? 'badge-income' : 'badge-expense'}">
              ${transaction.type}
            </span>
          </td>
          <td class="action-buttons">
            <button class="action-btn edit" data-id="${transaction.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" data-id="${transaction.id}">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
        
        transactionsTableBody.appendChild(row);
      });
      
      // Add event listeners to edit and delete buttons
      document.querySelectorAll('.action-btn.edit').forEach(button => {
        button.addEventListener('click', handleEditTransaction);
      });
      
      document.querySelectorAll('.action-btn.delete').forEach(button => {
        button.addEventListener('click', handleDeleteTransaction);
      });
    }
  
    function handleEditTransaction(e) {
      const transactionId = parseInt(e.currentTarget.getAttribute('data-id'));
      const transaction = transactions.find(t => t.id === transactionId);
      
      if (transaction) {
        // Populate form with transaction data
        document.getElementById('transaction-id').value = transaction.id;
        document.getElementById('transaction-date').value = transaction.date;
        document.getElementById('transaction-amount').value = transaction.amount;
        document.getElementById('transaction-type').value = transaction.type;
        
        // Update category options based on type
        updateCategoryOptions();
        
        // Set selected category
        document.getElementById('transaction-category').value = transaction.category_id;
        document.getElementById('transaction-description').value = transaction.description;
        
        // Update modal title
        document.getElementById('modal-title').textContent = 'Edit Transaction';
        
        // Show modal
        transactionModal.style.display = 'block';
      }
    }
  
    function handleDeleteTransaction(e) {
      if (confirm('Are you sure you want to delete this transaction?')) {
        const transactionId = parseInt(e.currentTarget.getAttribute('data-id'));
        transactions = transactions.filter(t => t.id !== transactionId);
        
        // Update dashboard
        displayTransactions();
        updateFinancialSummary();
        renderCharts();
      }
    }
  
    function updateFinancialSummary() {
      // Calculate totals
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const balance = income - expenses;
      const savingsRate = income > 0 ? ((income - expenses) / income * 100) : 0;
      
      // Update DOM
      document.getElementById('total-income').textContent = formatCurrency(income);
      document.getElementById('total-expenses').textContent = formatCurrency(expenses);
      document.getElementById('balance').textContent = formatCurrency(balance);
      document.getElementById('savings-rate').textContent = savingsRate.toFixed(1) + '%';
      
      // Set balance color based on value
      const balanceElement = document.getElementById('balance');
      if (balance > 0) {
        balanceElement.classList.add('positive-balance');
        balanceElement.classList.remove('negative-balance');
      } else if (balance < 0) {
        balanceElement.classList.add('negative-balance');
        balanceElement.classList.remove('positive-balance');
      } else {
        balanceElement.classList.remove('positive-balance');
        balanceElement.classList.remove('negative-balance');
      }
    }
  
    function renderCharts() {
      renderIncomeExpenseChart();
      renderExpenseCategoriesChart();
    }
  
    function renderIncomeExpenseChart() {
      const ctx = document.getElementById('income-expense-chart').getContext('2d');
      
      // Destroy previous chart if it exists
      if (window.incomeExpenseChart) {
        window.incomeExpenseChart.destroy();
      }
      
      // Get data for the last 6 months
      const months = [];
      const incomeData = [];
      const expenseData = [];
      
      // Generate last 6 months
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = d.toLocaleString('default', { month: 'short' });
        const monthYear = `${monthName} ${d.getFullYear()}`;
        months.push(monthYear);
        
        // Filter transactions for this month
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        
        const monthIncome = transactions
          .filter(t => t.type === 'income' && new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd)
          .reduce((sum, t) => sum + t.amount, 0);
        
        const monthExpenses = transactions
          .filter(t => t.type === 'expense' && new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd)
          .reduce((sum, t) => sum + t.amount, 0);
        
        incomeData.push(monthIncome);
        expenseData.push(monthExpenses);
      }
      
      // Create chart
      window.incomeExpenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Income',
              data: incomeData,
              backgroundColor: 'rgba(46, 204, 113, 0.7)',
              borderColor: 'rgba(46, 204, 113, 1)',
              borderWidth: 1
            },
            {
              label: 'Expenses',
              data: expenseData,
              backgroundColor: 'rgba(231, 76, 60, 0.7)',
              borderColor: 'rgba(231, 76, 60, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value;
                }
              }
            }
          }
        }
      });
    }
  
    function renderExpenseCategoriesChart() {
      const ctx = document.getElementById('expense-categories-chart').getContext('2d');
      
      // Destroy previous chart if it exists
      if (window.expenseCategoriesChart) {
        window.expenseCategoriesChart.destroy();
      }
      
      // Get expense data by category
      const expensesByCategory = {};
      
      transactions.filter(t => t.type === 'expense').forEach(transaction => {
        if (expensesByCategory[transaction.category_name]) {
          expensesByCategory[transaction.category_name] += transaction.amount;
        } else {
          expensesByCategory[transaction.category_name] = transaction.amount;
        }
      });
      
      const categoryNames = Object.keys(expensesByCategory);
      const categoryAmounts = Object.values(expensesByCategory);
      
      // Chart colors
      const backgroundColors = [
        'rgba(231, 76, 60, 0.7)',
        'rgba(52, 152, 219, 0.7)',
        'rgba(155, 89, 182, 0.7)',
        'rgba(243, 156, 18, 0.7)',
        'rgba(46, 204, 113, 0.7)',
        'rgba(26, 188, 156, 0.7)',
        'rgba(22, 160, 133, 0.7)',
        'rgba(41, 128, 185, 0.7)',
        'rgba(142, 68, 173, 0.7)',
        'rgba(230, 126, 34, 0.7)'
      ];
      
      // Create chart
      window.expenseCategoriesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: categoryNames,
          datasets: [{
            data: categoryAmounts,
            backgroundColor: backgroundColors.slice(0, categoryNames.length),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.raw;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
  
    function filterTransactions() {
      // This would typically call your API with selected month/year
      // For demo purposes, we'll just update the charts
      renderCharts();
      alert('Filtering would fetch transactions for the selected period from the server');
    }
  
    function handleLogout() {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      window.location.href = '/login.html';
    }
  
    // Add some CSS for transaction amounts and badges
    const style = document.createElement('style');
    style.textContent = `
      .income-amount {
        color: #2ecc71;
        font-weight: 600;
      }
      
      .expense-amount {
        color: #e74c3c;
        font-weight: 600;
      }
      
      .positive-balance {
        color: #2ecc71;
      }
      
      .negative-balance {
        color: #e74c3c;
      }
      
      .badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: capitalize;
      }
      
      .badge-income {
        background-color: rgba(46, 204, 113, 0.2);
        color: #2ecc71;
      }
      
      .badge-expense {
        background-color: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
      }
    `;
    document.head.appendChild(style);
  });