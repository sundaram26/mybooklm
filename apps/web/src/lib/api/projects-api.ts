import { axiosClient } from "./axios-client";
import { Project } from "@repo/shared";

export const projectsApi = {
  async getProjects(): Promise<Project[]> {
    const response = await axiosClient.get("/notebooks");
    return response.data?.data || [];
  },

  async getProject(id: string): Promise<Project> {
    const response = await axiosClient.get(`/notebooks/${id}`);
    return response.data?.data;
  },

  async createProject(data: { title: string; description?: string }): Promise<Project> {
    const response = await axiosClient.post("/notebooks", data);
    return response.data?.data;
  },

  async deleteProject(id: string): Promise<void> {
    await axiosClient.delete(`/notebooks/${id}`);
  },
};
