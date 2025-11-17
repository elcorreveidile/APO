/**
 * Estoy Bien - API Client
 * Cliente para conectar el frontend con el backend
 */

class EstoyBienAPI {
  constructor(baseURL = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('estoyBienToken');
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    localStorage.setItem('estoyBienToken', token);
  }

  /**
   * Remove authentication token
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('estoyBienToken');
  }

  /**
   * Get authentication token
   */
  getToken() {
    return this.token;
  }

  /**
   * Make API request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers
      }
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la solicitud');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ========== AUTH ENDPOINTS ==========

  /**
   * Register new user
   */
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: userData
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  /**
   * Login user
   */
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  /**
   * Logout user
   */
  logout() {
    this.clearToken();
  }

  /**
   * Get current user
   */
  async getMe() {
    return await this.request('/auth/me');
  }

  /**
   * Update user details
   */
  async updateProfile(userData) {
    return await this.request('/auth/updatedetails', {
      method: 'PUT',
      body: userData
    });
  }

  /**
   * Update password
   */
  async updatePassword(currentPassword, newPassword) {
    return await this.request('/auth/updatepassword', {
      method: 'PUT',
      body: { currentPassword, newPassword }
    });
  }

  /**
   * Update FCM token for push notifications
   */
  async updateFCMToken(fcmToken) {
    return await this.request('/auth/fcmtoken', {
      method: 'PUT',
      body: { fcmToken }
    });
  }

  // ========== CHECK-IN ENDPOINTS ==========

  /**
   * Create check-in
   */
  async createCheckIn(checkInData = {}) {
    return await this.request('/checkins', {
      method: 'POST',
      body: checkInData
    });
  }

  /**
   * Get all check-ins
   */
  async getCheckIns(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/checkins${queryString ? `?${queryString}` : ''}`;
    return await this.request(endpoint);
  }

  /**
   * Get check-in statistics
   */
  async getCheckInStats(days = 30) {
    return await this.request(`/checkins/stats?days=${days}`);
  }

  /**
   * Get single check-in
   */
  async getCheckIn(checkInId) {
    return await this.request(`/checkins/${checkInId}`);
  }

  /**
   * Delete check-in
   */
  async deleteCheckIn(checkInId) {
    return await this.request(`/checkins/${checkInId}`, {
      method: 'DELETE'
    });
  }

  // ========== CONTACT ENDPOINTS ==========

  /**
   * Get all contacts
   */
  async getContacts() {
    return await this.request('/contacts');
  }

  /**
   * Get single contact
   */
  async getContact(contactId) {
    return await this.request(`/contacts/${contactId}`);
  }

  /**
   * Create contact
   */
  async createContact(contactData) {
    return await this.request('/contacts', {
      method: 'POST',
      body: contactData
    });
  }

  /**
   * Update contact
   */
  async updateContact(contactId, contactData) {
    return await this.request(`/contacts/${contactId}`, {
      method: 'PUT',
      body: contactData
    });
  }

  /**
   * Delete contact
   */
  async deleteContact(contactId) {
    return await this.request(`/contacts/${contactId}`, {
      method: 'DELETE'
    });
  }

  // ========== ALERT ENDPOINTS ==========

  /**
   * Get all alerts
   */
  async getAlerts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/alerts${queryString ? `?${queryString}` : ''}`;
    return await this.request(endpoint);
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts() {
    return await this.request('/alerts/active');
  }

  /**
   * Get alert statistics
   */
  async getAlertStats(days = 30) {
    return await this.request(`/alerts/stats?days=${days}`);
  }

  /**
   * Get single alert
   */
  async getAlert(alertId) {
    return await this.request(`/alerts/${alertId}`);
  }

  /**
   * Resolve alert manually
   */
  async resolveAlert(alertId) {
    return await this.request(`/alerts/${alertId}/resolve`, {
      method: 'PUT'
    });
  }

  /**
   * Trigger manual alert check
   */
  async triggerAlertCheck() {
    return await this.request('/alerts/check', {
      method: 'POST'
    });
  }

  // ========== UTILITY METHODS ==========

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create global instance
const api = new EstoyBienAPI();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EstoyBienAPI;
}
