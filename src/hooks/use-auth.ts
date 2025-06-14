"use client"

import {useSession, signIn, signOut} from "next-auth/react";
import {useState} from "react";
import {useRouter} from "next/navigation";


export function useAuth() {
    const { data: session, status } = useSession()
    const [loading, setLoading] = useState(false)
    const router = useRouter()


    const login = async (email: string, password: string) => {
        setLoading(true)
        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            })

            if (result?.error) {
                return { success: false, error: "Invalid email or password"}
            }

            return { success: true}
        } catch (error){
            console.error("Login failed with error: ", error)
            return { success: false, error: "An error occurred" }
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        await signOut({ redirect: false })
        router.push("/")
    }

    console.log("user", session?.user)

    return {
        user: session?.user,
        loading: status === "loading" || loading,
        isAuthenticated: status === "authenticated",
        login,
        logout
    }
}