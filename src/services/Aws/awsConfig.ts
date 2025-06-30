import { APPSYNC_API_KEY, APPSYNC_URL } from "../chatRequest";

const config =  {
      aws_appsync_graphqlEndpoint:
      APPSYNC_URL,
      aws_appsync_region: 'ap-south-1',
      aws_appsync_authenticationType: 'API_KEY',
      aws_appsync_apiKey: APPSYNC_API_KEY,
    }
  
export default config;
