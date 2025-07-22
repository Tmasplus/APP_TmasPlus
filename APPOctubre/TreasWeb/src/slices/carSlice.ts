import { getDatabase, ref, query, equalTo, orderByChild, get } from 'firebase/database';
import { useEffect, useState } from 'react';

const useUserCars = (uid: string) => {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      setError(null);
      const db = getDatabase();
      const carsRef = ref(db, 'cars');

      const userCarsQuery = query(carsRef, orderByChild('driver'), equalTo(uid));

      try {
        const snapshot = await get(userCarsQuery);

        if (snapshot.exists()) {
          const carsData = snapshot.val();
          const carsArray = Object.keys(carsData).map((key) => ({
            id: key,
            ...carsData[key],
          }));
          setCars(carsArray);
        } else {
          setCars([]);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [uid]);

  return { cars, loading, error };
};

export default useUserCars;
