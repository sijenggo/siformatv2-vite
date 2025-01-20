import axios from "axios";
const BASE_URL = `http://192.168.3.7/siformatv2/backend/api/`; //taruh apimu disini

//fungsi data DB
export const ambil_data = async (query) => {
    try {
      const response = await axios.post(`${BASE_URL}ambil_data`,{ query });
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
};