import createApi from '../api.service';
import { GetPropertiesOptions, ValidMultiChangeType, ValidStatus } from '../../../../backend/commonTypes';

class PropertiesServiceAdmin {
  private api: any; 

  constructor(baseUrl = "http://localhost:3000/api/v1/admin/properties") {
    this.api = createApi(baseUrl);
  }

  async getProperties(options: GetPropertiesOptions) {
    return (await this.api.get("/", { params: options })).data;
  }

  async changePropertyStatus(id: string, status: ValidStatus) {
    return (await this.api.patch(`/change-status/${status}/${id}`)).data;
  }

  async multiChangeProperties(ids: string[], type: ValidMultiChangeType) {
    return (await this.api.patch(`/multi-change`, {ids, type})).data;
  }
}

const propertiesService = new PropertiesServiceAdmin();

export default propertiesService;
