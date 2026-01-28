import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(false); // Can start false if we trust local storage immediately

    useEffect(() => {
        // Check if token exists and validate/load user
        const checkUser = async () => {
            if (token) {
                try {
                    // VERIFY TOKEN WITH BACKEND
                    const response = await api.get('/auth/me');

                    // If successful, update user state with fresh data from DB
                    setUser(response.data.data.user);
                    localStorage.setItem('user', JSON.stringify(response.data.data.user));

                } catch (error) {
                    console.error("Token verification failed:", error);
                    // If 401 Unauthorized or other error, clear session
                    logout();
                }
            }
            setLoading(false);
        };

        checkUser();
    }, [token]);

    const login = async (email, password, privateKey) => {
        try {
            const response = await api.post('/auth/login', { email, password, privateKey });
            const { token, data } = response.data;

            setToken(token);
            localStorage.setItem('token', token);

            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user)); // Persist basic user info

            return { success: true, user: data.user };
        } catch (error) {
            console.error("Login failed", error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const signup = async (formData) => {
        try {
            const response = await api.post('/auth/signup', formData);
            const { token, data } = response.data;

            setToken(token);
            localStorage.setItem('token', token);

            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));

            return { success: true };
        } catch (error) {
            console.error("Signup failed", error);
            return {
                success: false,
                message: error.response?.data?.message || 'Signup failed'
            };
        }
    }

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const value = {
        user,
        token,
        login,
        signup,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
