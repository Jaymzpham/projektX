import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const getProjects = (search?: string, status?: string) =>
  api.get('/projects', { params: { search, status } }).then(r => r.data)

export const getProject = (id: number) =>
  api.get(`/projects/${id}`).then(r => r.data)

export const createProject = (data: object) =>
  api.post('/projects', data).then(r => r.data)

export const updateProject = (id: number, data: object) =>
  api.put(`/projects/${id}`, data).then(r => r.data)

export const deleteProject = (id: number) =>
  api.delete(`/projects/${id}`)

export const getAllActivities = () =>
  api.get('/activities').then(r => r.data)

export const getActivities = (projectId: number) =>
  api.get(`/activities/${projectId}`).then(r => r.data)

export const createActivity = (data: object) =>
  api.post('/activities', data).then(r => r.data)

export const updateActivity = (id: number, data: object) =>
  api.put(`/activities/${id}`, data).then(r => r.data)

export const deleteActivity = (id: number) =>
  api.delete(`/activities/${id}`)

export const addDependency = (activityId: number, blockedByActivityId: number) =>
  api.post(`/activities/${activityId}/dependencies`, { blockedByActivityId }).then(r => r.data)

export const addResource = (activityId: number, resourceId: number, hoursNeeded?: number) =>
  api.post(`/activities/${activityId}/resources`, { resourceId, hoursNeeded }).then(r => r.data)

export const getResourceHierarchy = () =>
  api.get('/resources/hierarchy').then(r => r.data)

export const getAllResources = () =>
  api.get('/resources').then(r => r.data)

export const getTeamSummary = () =>
  api.get('/resources/team-summary').then(r => r.data)

export const getRisks = (projectId: number) =>
  api.get(`/raid/${projectId}/risks`).then(r => r.data)

export const createRisk = (projectId: number, data: object) =>
  api.post(`/raid/${projectId}/risks`, data).then(r => r.data)

export const updateRisk = (id: number, data: object) =>
  api.put(`/raid/risks/${id}`, data).then(r => r.data)

export const getIssues = (projectId: number) =>
  api.get(`/raid/${projectId}/issues`).then(r => r.data)

export const createIssue = (projectId: number, data: object) =>
  api.post(`/raid/${projectId}/issues`, data).then(r => r.data)

export const getDecisions = (projectId: number) =>
  api.get(`/raid/${projectId}/decisions`).then(r => r.data)

export const createDecision = (projectId: number, data: object) =>
  api.post(`/raid/${projectId}/decisions`, data).then(r => r.data)

export const createShareToken = (projectId: number) =>
  api.post(`/projects/${projectId}/share`).then(r => r.data)

export const getSharedProject = (token: string) =>
  api.get(`/share/${token}`).then(r => r.data)

export const exportIcs = (projectId: number) =>
  window.open(`/api/projects/${projectId}/export/ics`, '_blank')

export default api
