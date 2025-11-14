import { loadTestData } from '../lib/fileUtils.js';
import { formatDate, getCurrentMonth, getCurrentYear } from '../lib/date.js';

/**
 * Test data helpers
 */
export class TestDataHelper {
  /**
   * Get users test data
   * @returns {object}
   */
  static getUsersData() {
    return loadTestData('users.json');
  }

  /**
   * Get bank accounts test data
   * @returns {object}
   */
  static getBankAccountsData() {
    return loadTestData('bankAccounts.json');
  }

  /**
   * Get transactions test data
   * @returns {object}
   */
  static getTransactionsData() {
    return loadTestData('transactions.json');
  }

  /**
   * Get categories test data
   * @returns {object}
   */
  static getCategoriesData() {
    return loadTestData('categories.json');
  }

  /**
   * Get budgets test data
   * @returns {object}
   */
  static getBudgetsData() {
    return loadTestData('budgets.json');
  }

  /**
   * Get investments test data
   * @returns {object}
   */
  static getInvestmentsData() {
    return loadTestData('investments.json');
  }

  /**
   * Get a valid user for testing
   * @returns {object}
   */
  static getValidUser() {
    const usersData = this.getUsersData();
    return usersData.validUsers[0];
  }

  /**
   * Get an invalid user for testing
   * @returns {object}
   */
  static getInvalidUser() {
    const usersData = this.getUsersData();
    return usersData.invalidUsers[0];
  }

  /**
   * Get a valid bank account for testing
   * @returns {object}
   */
  static getValidBankAccount() {
    const bankAccountsData = this.getBankAccountsData();
    return bankAccountsData.validBankAccounts[0];
  }

  /**
   * Get a valid transaction for testing
   * @returns {object}
   */
  static getValidTransaction() {
    const transactionsData = this.getTransactionsData();
    const transaction = { ...transactionsData.validTransactions[0] };
    // Set current date if not provided
    if (!transaction.date) {
      transaction.date = formatDate(new Date());
    }
    return transaction;
  }

  /**
   * Get a valid category for testing
   * @returns {object}
   */
  static getValidCategory() {
    const categoriesData = this.getCategoriesData();
    return categoriesData.validCategories[0];
  }

  /**
   * Get a valid budget for testing
   * @returns {object}
   */
  static getValidBudget() {
    const budgetsData = this.getBudgetsData();
    const budget = { ...budgetsData.validBudgets[0] };
    // Set current month/year if not provided
    if (!budget.month) {
      budget.month = getCurrentMonth();
    }
    if (!budget.year) {
      budget.year = getCurrentYear();
    }
    return budget;
  }

  /**
   * Get a valid investment for testing
   * @returns {object}
   */
  static getValidInvestment() {
    const investmentsData = this.getInvestmentsData();
    const investment = { ...investmentsData.validInvestments[0] };
    // Set current date if not provided
    if (!investment.purchaseDate) {
      investment.purchaseDate = formatDate(new Date());
    }
    return investment;
  }
}

