const DATA_PATH = '/DATA';

const URL = `${window.location.protocol}//${window.location.host}`;

class RESTService {
  fetchData = async () => {
    const url = `${URL}${DATA_PATH}`;

    const response = await fetch(url);

    try {
      const data = await response.json();

      if (!response.ok) {
        const message = `An error occured: ${response.status}`;
        throw new Error(message);
      }

      return data;
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  };
}

export default new RESTService();
