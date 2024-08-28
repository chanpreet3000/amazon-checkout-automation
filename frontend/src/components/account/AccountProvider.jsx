import React, {createContext, useState, useEffect} from 'react';

const AccountContext = createContext();

export const AccountProvider = ({children}) => {
  const local
  const [currentAccount, setCurrentAccount] = useState(null);
  const [allAccounts, setAllAccounts] = useState([]);

  useEffect(() => {
    const storedCurrentAccount = localStorage.getItem('currentAccount');
    const storedAllAccounts = localStorage.getItem('allAccounts');

    if (storedCurrentAccount) {
      setCurrentAccount(JSON.parse(storedCurrentAccount));
    }

    if (storedAllAccounts) {
      setAllAccounts(JSON.parse(storedAllAccounts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('currentAccount', JSON.stringify(currentAccount));
    localStorage.setItem('allAccounts', JSON.stringify(allAccounts));
  }, [currentAccount, allAccounts]);

  const addAccount = (email) => {
    if (!allAccounts.includes(email)) {
      setAllAccounts([...allAccounts, email]);
      if (!currentAccount) {
        setCurrentAccount(email);
      }
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