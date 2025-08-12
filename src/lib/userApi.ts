import apiClient from "@/lib/axios";

export async function getCurrentUser() {
  try {
    const res = await apiClient.get("/api/auth/me");
    console.log("getCurrentUser response:", res.data);
    
    if (res.data && res.data.success !== false) {
      // Nếu phản hồi có trường success, sử dụng thuộc tính data, nếu không sử dụng phản hồi trực tiếp
      return res.data.data || res.data;
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
