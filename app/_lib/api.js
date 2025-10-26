"use server";

import axios from "axios";

// ---------------- POST ----------------
export async function postData(endpoint, data = {}, token = "") {
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await axios.post(`${process.env.BASE_URL}${endpoint}`, data, {
      headers,
      withCredentials: true,
    });

    return {
      ...response.data,
      statusCode: response.status,
    };
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message;
    const statusCode = err.response?.status || 500;

    console.error("API POST Error:", errorMessage);

    return {
      success: false,
      statusCode,
      message: errorMessage,
    };
  }
}

// ---------------- GET ----------------
export async function getData(endpoint, token = "") {
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await axios.get(`${process.env.BASE_URL}${endpoint}`, {
      headers,
      withCredentials: true,
    });

    return {
      ...response.data,
      statusCode: response.status,
    };
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message;
    const statusCode = err.response?.status || 500;

    console.error("API GET Error:", errorMessage);

    return {
      success: false,
      statusCode,
      message: errorMessage,
    };
  }
}

// ---------------- UPDATE / PATCH ----------------
export async function updateData(endpoint, data = {}, token = "") {
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await axios.patch(`${process.env.BASE_URL}${endpoint}`, data, {
      headers,
      withCredentials: true,
    });

    return {
      ...response.data,
      statusCode: response.status,
    };
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message;
    const statusCode = err.response?.status || 500;

    console.error("API UPDATE Error:", errorMessage);

    return {
      success: false,
      statusCode,
      message: errorMessage,
    };
  }
}

// ---------------- DELETE ----------------
export async function deleteData(endpoint, token = "") {
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await axios.delete(`${process.env.BASE_URL}${endpoint}`, {
      headers,
      withCredentials: true,
    });

    return {
      ...response.data,
      statusCode: response.status,
    };
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message;
    const statusCode = err.response?.status || 500;

    console.error("API DELETE Error:", errorMessage);

    return {
      success: false,
      statusCode,
      message: errorMessage,
    };
  }
}
