import { useEffect, useState } from 'react';
import { fetch } from 'expo/fetch';

export const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async() => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.status}`);
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (url) {
            fetchData();
        } else {
            // If no URL is provided, we shouldn't attempt to fetch.
            // Set loading to false and data to null.
            setLoading(false);
            setData(null);
        }
    }, [url]);

    return { data, loading, error };
};