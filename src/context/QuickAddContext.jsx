import { createContext, useContext, useState, useCallback } from 'react';
import TransactionFormDialog from '../components/transactions/TransactionFormDialog';
import { createTransaction } from '../api/transactionApi';
import { listCategories } from '../api/categoryApi';
import { listBankAccounts } from '../api/bankAccountApi';
import { listUpiAccounts } from '../api/upiAccountApi';

const QuickAddContext = createContext(null);

// Mounts a single TransactionFormDialog at the app root so the floating "Add"
// button in the tab bar can open it from any screen (Home, Transactions,
// Accounts, Insights, More) without each screen owning its own copy — matches
// the brief's "prominent but doesn't consume permanent nav space" quick-add.
// Screens that list transactions already refetch on focus (useFocusEffect),
// so submitting here shows up the moment the person navigates back to them.
export const QuickAddProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [presetType, setPresetType] = useState('expense');
  const [lookups, setLookups] = useState({ categories: [], bankAccounts: [], upiAccounts: [] });
  const [loaded, setLoaded] = useState(false);

  const openQuickAdd = useCallback(async (type = 'expense') => {
    setPresetType(type);
    setOpen(true);
    try {
      const [catRes, bankRes, upiRes] = await Promise.all([listCategories(), listBankAccounts(), listUpiAccounts()]);
      setLookups({
        categories: catRes.data.data,
        bankAccounts: bankRes.data.data.items,
        upiAccounts: upiRes.data.data.items,
      });
      setLoaded(true);
    } catch (err) {
      // Dialog still opens with empty lookups; category/account pickers will
      // just be empty rather than blocking the whole quick-add flow.
    }
  }, []);

  const submit = async (payload) => {
    await createTransaction(payload);
    setOpen(false);
  };

  return (
    <QuickAddContext.Provider value={{ openQuickAdd }}>
      {children}
      {loaded && (
        <TransactionFormDialog
          open={open}
          initialValues={null}
          presetType={presetType}
          categories={lookups.categories}
          bankAccounts={lookups.bankAccounts}
          upiAccounts={lookups.upiAccounts}
          onClose={() => setOpen(false)}
          onSubmit={submit}
        />
      )}
    </QuickAddContext.Provider>
  );
};

export const useQuickAdd = () => {
  const ctx = useContext(QuickAddContext);
  if (!ctx) throw new Error('useQuickAdd must be used within a QuickAddProvider');
  return ctx;
};
