import { DATA_URL } from './REST.constant';
import { DataResponse } from './REST.interfaces';

class RESTService {
  fetchData = async (): Promise<DataResponse> => {
    const response = await fetch(DATA_URL);

    const data = await response.json();

    if (!response.ok) {
      const message = `${response.status}: ${response.statusText}`;
      throw { httpStatus: response.status, message };
    }

    return data;
  };
}

export default new RESTService();
