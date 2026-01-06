const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class BarrelManagementService {
  constructor() {
    this.baseURL = `${API_BASE}/api/barrel-management`;
  }

  // Helper method for API calls
  async apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API call failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ADMIN METHODS
  async registerBarrels(data) {
    return this.apiCall('/admin/register-barrels', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getRegisteredBarrels() {
    return this.apiCall('/admin/registered-barrels');
  }

  async getBarrelRequests() {
    return this.apiCall('/admin/barrel-requests');
  }

  async approveBarrelRequest(requestId, adminNotes = '') {
    return this.apiCall(`/admin/barrel-requests/${requestId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ adminNotes })
    });
  }

  // USER METHODS
  async createBarrelRequest(data) {
    return this.apiCall('/user/barrel-requests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getUserBarrelRequests() {
    return this.apiCall('/user/barrel-requests');
  }

  async getUserStock() {
    return this.apiCall('/user/stock');
  }

  // MANAGER METHODS
  async getSellRequests() {
    return this.apiCall('/manager/sell-requests');
  }

  // DASHBOARD STATS
  async getStats(role) {
    return this.apiCall(`/stats/${role}`);
  }

  // UTILITY METHODS
  async getUsers(role = null) {
    const endpoint = role ? `/users?role=${role}` : '/users';
    return this.apiCall(endpoint);
  }
}

export default new BarrelManagementService();