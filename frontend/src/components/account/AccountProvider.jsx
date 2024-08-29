import React, {createContext, useState, useEffect} from 'react';

export const AccountContext = createContext();

const AccountProvider = ({children}) => {
  const localCurrentAccount = localStorage.getItem('currentAccount') ?? JSON.stringify(null);
  const localAllAccounts = localStorage.getItem('allAccounts') ?? JSON.stringify([]);

  const [currentAccount, setCurrentAccount] = useState(JSON.parse(localCurrentAccount));
  const [allAccounts, setAllAccounts] = useState(JSON.parse(localAllAccounts));

  useEffect(() => {
    localStorage.setItem('currentAccount', JSON.stringify(currentAccount));
    localStorage.setItem('allAccounts', JSON.stringify(allAccounts));
  }, [currentAccount, allAccounts]);

  const addAccount = (email) => {
    if (!allAccounts.includes(email)) {
      setAllAccounts([...allAccounts, email]);
      setCurrentAccount(email);
    }
  };

  const selectAccount = (email) => {
    if (allAccounts.includes(email)) {
      setCurrentAccount(email);
    }
  };

  const deleteAccount = (email) => {
    const updatedAccounts = allAccounts.filter(account => account !== email);
    setAllAccounts(updatedAccounts);
    if (currentAccount === email) {
      setCurrentAccount(updatedAccounts.length > 0 ? updatedAccounts[0] : null);
    }
  };

  const getCurrentAccount = () => currentAccount;

  const switchAccount = (email) => {
    if (allAccounts.includes(email) && email !== currentAccount) {
      setCurrentAccount(email);
    }
  };

  const value = {
    currentAccount,
    allAccounts,
    addAccount,
    selectAccount,
    deleteAccount,
    getCurrentAccount,
    switchAccount,
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
};

export default AccountProvider;