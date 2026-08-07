"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext<any>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {




  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  const handleSetUser = (newUser:any) => {
    setUser(newUser);

    if(newUser){
      localStorage.setItem(
        "user_data",
        JSON.stringify(newUser)
      );
    }else{
      localStorage.removeItem("user_data");
    }
  };


  useEffect(() => {
  console.log("AUTH PROVIDER MOUNTED");

  const verifySession = async () => {
    console.log("CHECKING SESSION");

    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      console.log("ME RESPONSE:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("USER FOUND:", data.user);
        handleSetUser(data.user);
      } else {
        console.log("NO USER");
        handleSetUser(null);
      }

    } catch(err) {
      console.log("AUTH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  verifySession();

}, []);


  useEffect(() => {

    const verifySession = async () => {

      try {

        const res = await fetch("/api/auth/me", {
          credentials:"include",
        });


        if(res.ok){

          const data = await res.json();

          handleSetUser(data.user);

        }else{

          handleSetUser(null);

        }


      } catch(error){

        console.log(error);

        handleSetUser(null);

      } finally {

        setLoading(false);

      }

    };


    verifySession();


  }, []);



  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser: handleSetUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () =>
useContext(AuthContext);