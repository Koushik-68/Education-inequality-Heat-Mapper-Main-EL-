import axios from "axios";

// Calls NODE backend (not FastAPI directly)
export const getDistrictTypology = async (payload) => {
  const response = await axios.post(
    "http://localhost:5000/api/ml/district-typology",
    payload,
  );
  return response.data;
};
