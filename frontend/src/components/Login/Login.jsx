import {useContext, useState} from "react";
import {AccountContext} from "../account/AccountProvider";
import {axiosApi} from "../../axios";
import {CgSpinner} from "react-icons/cg";
import {MdDeleteForever} from "react-icons/md";

const CreateAccount = ({onCreate}) => {
  const {addAccount} = useContext(AccountContext);
  const [email, setEmail] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    if (isSigningIn || !email) return;

    setIsSigningIn(true);
    await axiosApi.post('/open_amazon_signin', {
      email: email,
    })
      .then((response) => {
        alert(response.data.message);
        addAccount(email);
        onCreate();
      }).catch((error) => {
        console.error(error);
        alert("Error occurred during sign-in. Please try again.");
      }).finally(() => {
        setIsSigningIn(false);
      })
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
      <div
        className=" bg-deep-black rounded-2xl flex items-center justify-center flex-col gap-8 p-8 w-[400px] h-[400px]">
        {
          isSigningIn ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <div>Signing In</div>
                <CgSpinner className="text-soft-white animate-spin" size={50}/>
              </div>)
            : (<>
              <div className="text-soft-white text-2xl">Create New Account</div>
              <input
                type="email"
                placeholder="Please enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#333333FF] text-soft-white rounded-xl p-4 w-full"/>
              <button className="px-6 py-2 text-base text-soft-white bg-green-600 rounded-2xl"
                      onClick={() => handleSignIn()}>Sign In To Amazon
              </button>
            </>)
        }
      </div>
    </div>
  );
}

const Login = () => {
  const {currentAccount, allAccounts, deleteAccount, selectAccount} = useContext(AccountContext);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6 mt-8 text-soft-white">
      {isCreateAccountOpen && <CreateAccount onCreate={() => setIsCreateAccountOpen(false)}/>}
      <h1 className="bg-green-600 text-soft-white cursor-pointer text-lg rounded-2xl px-4 py-2"
          onClick={() => setIsCreateAccountOpen(true)}>Create New Account</h1>
      <div className="flex flex-row w-full items-center">
        <div className="flex-1">
        </div>
        <div className="flex-1 bg-[#242424FF] h-[450px] rounded-xl overflow-auto p-4">
          {
            allAccounts.length === 0
              ? (
                <div className="h-full w-full flex items-center justify-center text-xl">
                  No accounts created yet. Please create an account
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <h1 className="text-soft-white text-xl">Select Account</h1>
                  <div className="w-full flex flex-col gap-2 px-8">
                    {
                      allAccounts.map(account => (
                        <div className="flex flex-row justify-between items-center gap-6">
                          <div key={account}
                               className="flex-1 bg-[#333333FF] text-soft-white cursor-pointer rounded-xl px-4 py-2"
                               onClick={() => selectAccount(account)}
                               style={{
                                 backgroundColor: currentAccount === account ? '#00bb00' : '#333333FF',
                               }}>
                            {account}
                          </div>
                          <MdDeleteForever size={24} className="text-soft-white cursor-pointer hover:text-red-500 transition-colors duration-200" onClick={() => deleteAccount(account)}/>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )
          }
        </div>
        <div className="flex-1"></div>
      </div>
    </div>
  )
}

export default Login;