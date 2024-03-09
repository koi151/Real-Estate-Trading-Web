import createApi from '../api.service';
import { GetPropertiesOptions } from '../../../../backend/commonTypes';

class PropertiesServiceClient {
  private api: any; 

  constructor(baseUrl = "http://localhost:3000/api/v1/properties") {
    this.api = createApi(baseUrl);
  }

  private getAuthHeaders() {
    const clientAccessToken = localStorage.getItem('clientAccessToken');
    
    if (!clientAccessToken) {
      console.log("Access token not found");
      throw new Error('Unauthorized');
    }
    return {
      headers: {
        Authorization: `Bearer ${clientAccessToken}`
      }
    };
  }

  private async handleRequest(request: Promise<any>): Promise<any> {
    try {
      const response = await request;
      return response.data;

    } catch (err: any) {
      console.log('Error occurred in handleRequest:', err)
      
      if (err.message === 'Access token not found') {
        throw new Error('Unauthorized')

      } else if (err.response && err.response.status === 401) {

        // Attempt to refresh the token
        try {
          const clientRefreshToken = localStorage.getItem('clientRefreshToken');
          if (!clientRefreshToken) {
            throw new Error('Refresh token not found in localStorage');
          }
  
          const refreshResponse = await this.api.post('/refresh', { clientRefreshToken });
          const newClientAccessToken = refreshResponse.data.clientAccessToken;
          localStorage.setItem('clientAccessToken', newClientAccessToken);
  
          return await this.handleRequest(request);

        } catch (refreshError) {
          throw new Error('Unauthorized');
        }

      } else {
        console.error('An error occurred:', err);
        throw new Error('An unexpected error occurred. Please try again later.');
      }
    }
  }

  async getProperties(options: GetPropertiesOptions) {
    const request = this.api.get("/", { 
      params: options,
      ...this.getAuthHeaders()
    });
    return this.handleRequest(request);
  }

  async getSingleProperty(id: string) {
    const request = this.api.get(`/detail/${id}`, this.getAuthHeaders());
    return this.handleRequest(request);
  }
}

const propertiesServiceClient = new PropertiesServiceClient();

export default propertiesServiceClient;
