window.onload = function() {
  // elements required for the app
  let descriptionInput = document.getElementById('description');
  let amountInput = document.getElementById('amount');
  let transactionList = document.getElementById('transactionList');
  let balanceDisplay = document.getElementById('balance');
  let incomeDisplay = document.getElementById('totalIncome');
  let expenseDisplay = document.getElementById('totalExpenses');
  
  // empty array Where we'll store our transactions
  let transactions = [];
  let currentType = 'income'; // default type
  
  // Set up button handlers
  document.getElementById('Incomebtn').addEventListener('click', function() {
    currentType = 'income';
    addTransaction();
  });
  
  document.getElementById('Expensebtn').addEventListener('click', function() {
    currentType = 'expense';
    addTransaction();
  });
  
  function addTransaction() {
    // Get the values from the form
    let description = descriptionInput.value;
    let amount = parseFloat(amountInput.value);
    
    // Simple validation
    if(!description || !amount) {
      alert("Please fill in both fields!");
      return;
    }
    
    // Create new transaction object
    let newTransaction = {
      id: Date.now(), // Simple way to get unique ID
      description: description,
      amount: amount,
      type: currentType
    };
    
    // Add to our list
    transactions.push(newTransaction);
    
    // Save and update display
    saveTransactions();
    updateDisplay();
    
    // Clear the form inputs
    descriptionInput.value = '';
    amountInput.value = '';
  };
  
  // Handle deleting transactions
  transactionList.addEventListener('click', function(e) {
    if(e.target.classList.contains('delete-btn')) {
      let id = parseInt(e.target.getAttribute('data-id'));
      
      // Remove from array
      transactions = transactions.filter(function(t) {
        return t.id !== id;
      });
      
      // Save and update
      saveTransactions();
      updateDisplay();
    }
  });
  
  // Filter buttons
  document.getElementById('showAllBtn').addEventListener('click', function() {
    updateDisplay('all');
  });
  
  document.getElementById('showIncomeBtn').addEventListener('click', function() {
    updateDisplay('income');
  });
  
  document.getElementById('showExpenseBtn').addEventListener('click', function() {
    updateDisplay('expense');
  });
  
  // Save transactions to cookie
  function saveTransactions() {
    const data = encodeURIComponent(JSON.stringify(transactions));
    document.cookie = `transactions=${data}; max-age=2592000; path=/`; // 30 days
  }
  
  // Load transactions from cookie
  function loadTransactions() {
    const cookies = document.cookie.split('; ');
    for(let cookie of cookies) {
      if(cookie.startsWith('transactions=')) {
        try {
          const data = decodeURIComponent(cookie.split('=')[1]);
          transactions = JSON.parse(data) || [];
        } catch(e) {
          console.error("Error loading transactions", e);
          transactions = [];
        }
        break;
      }
    }
  }
  
  function updateDisplay(filter = 'all') {
    // Update transaction list
    transactionList.innerHTML = '';
    
    let filtered = transactions;
    if (filter === 'income') {
      filtered = transactions.filter(t => t.type === 'income');
    } else if (filter === 'expense') {
      filtered = transactions.filter(t => t.type === 'expense');
    }
  
    if (filtered.length === 0) {
      transactionList.innerHTML = '<li class="text-gray-500">No transactions yet</li>';
    } else {
      filtered.forEach(function(t) {
        let item = document.createElement('li');
        item.className = `flex justify-between items-center p-2 ${t.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`;
        item.innerHTML = `
          <span>${t.description}</span>
          <span class="font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}">
            ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
          </span>
          <button class="delete-btn bg-red-500 text-white px-2 py-1 rounded" data-id="${t.id}">Delete</button>
        `;
        transactionList.appendChild(item);
      });
    }
  
    // Update totals
    let income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    let expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  
    let balance = income - expense;
  
    // Update display elements
    incomeDisplay.textContent = '$' + income.toFixed(2);
    expenseDisplay.textContent = '$' + expense.toFixed(2);
    balanceDisplay.textContent = '$' + balance.toFixed(2);
  
    // Style balance based on value
    balanceDisplay.className = balance < 0 ? 'text-red-600' : 'text-green-600';
  }
  
  // Load any saved transactions when page loads
  loadTransactions();
  updateDisplay();
};